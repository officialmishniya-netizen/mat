import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    userTelegramSettings, users, userAdPositions,
    telegramAdminSettings, settings
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
    sendTelegramMessage,
    getDefaultTemplate
} from '@/lib/telegram/bot';
import { getUserBalance } from '@/lib/ledger';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const message = body.message || body.edited_message;
        if (!message) return NextResponse.json({ ok: true });

        const chatId = String(message.chat.id);
        const text = (message.text?.trim() || '') as string;
        const telegramUsername = message.from?.username;

        // Route commands
        if (text.startsWith('/start')) {
            await handleStart(chatId, text, telegramUsername);
        } else if (text.startsWith('/balance')) {
            await handleBalance(chatId, telegramUsername);
        } else if (text.startsWith('/status')) {
            await handleStatus(chatId, telegramUsername);
        } else if (text.startsWith('/plans')) {
            await handlePlans(chatId, telegramUsername);
        } else if (text.startsWith('/referrals')) {
            await handleReferrals(chatId, telegramUsername);
        } else if (text.startsWith('/notifications')) {
            await handleNotificationSettings(chatId, telegramUsername);
        } else if (text.startsWith('/stop')) {
            await handleStop(chatId, telegramUsername);
        } else if (text.startsWith('/help')) {
            await handleHelp(chatId);
        } else {
            await handleUnknown(chatId);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ ok: true }); // Always return 200 to Telegram
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /start â€” Link Telegram to account
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleStart(
    chatId: string,
    text: string,
    telegramUsername?: string
) {
    const platform = await getPlatform();

    // Try to find user by Telegram username first
    let linkedUser: any = null;

    if (telegramUsername) {
        linkedUser = await db.query.userTelegramSettings.findFirst({
            where: eq(
                userTelegramSettings.telegramUsername,
                telegramUsername.toLowerCase().replace('@', '')
            ),
            with: { user: true }
        } as any);
    }

    if (!linkedUser) {
        // User not found â€” show registration prompt
        await sendTelegramMessage(chatId, `
ðŸ‘‹ <b>Welcome to ${platform.siteName}!</b>

To connect your account, you need to:

1. Register at <a href="${platform.siteUrl}/auth/register">${platform.siteUrl}/auth/register</a>
2. Enter your Telegram username during signup
3. Come back and send /start

Already registered? Make sure your
Telegram username matches what you
entered on the website.

Need help? Visit: <a href="${platform.siteUrl}/support">${platform.siteUrl}/support</a>
    `);
        return;
    }

    // Link the account
    await db.update(userTelegramSettings)
        .set({
            telegramChatId: chatId,
            isConnected: true,
            connectedAt: new Date(),
            lastMessageAt: new Date(),
        })
        .where(eq(userTelegramSettings.userId, (linkedUser as any).userId));

    // Send welcome message using template
    const adminSettings = await db.query.telegramAdminSettings.findFirst();
    const welcomeTemplate = adminSettings?.templateWelcome ||
        getDefaultTemplate('welcome');

    const welcomeMsg = welcomeTemplate
        .replace(/{platform_name}/g, platform.siteName)
        .replace(/{platform_url}/g, platform.siteUrl)
        .replace(/{username}/g, (linkedUser as any).user?.username || 'there');

    await sendTelegramMessage(chatId, welcomeMsg);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /balance â€” Show wallet balance
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleBalance(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;
    if (!user) return sendNotLinked(chatId, platform);

    const balance = await getUserBalance(user.id);

    // Get active position locked balance
    const activePosition = await db.query.userAdPositions.findFirst({
        where: and(
            eq(userAdPositions.userId, user.id),
            eq(userAdPositions.status, 'active')
        ),
    });

    const lockedInfo = activePosition
        ? `\nðŸ”’ Locked: <b>$${activePosition.lockedBalance}</b> / $${activePosition.clickGoalSnapshot}`
        : '';

    await sendTelegramMessage(chatId, `
ðŸ’° <b>Your ${platform.siteName} Wallet</b>

Available Balance: <b>$${balance}</b>${lockedInfo}

<a href="${platform.siteUrl}/dashboard/wallet">View Full Wallet â†’</a>
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /status â€” Show daily ad status
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleStatus(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;
    if (!user) return sendNotLinked(chatId, platform);

    const position = await db.query.userAdPositions.findFirst({
        where: and(
            eq(userAdPositions.userId, user.id),
            eq(userAdPositions.status, 'active')
        ),
        with: { adPlan: true } as any
    });

    if (!position) {
        await sendTelegramMessage(chatId, `
ðŸ“Š <b>Your Status</b>

No active ad plan found.

<a href="${platform.siteUrl}/dashboard/ad-plans/buy">Browse Plans â†’</a>

â€” ${platform.siteName}
    `);
        return;
    }

    const plan = (position as any).adPlan;
    const effectiveLimit = Number(plan.dailyAds) + (position.boostedAdsPerDay || 0);
    const adsRemaining = Math.max(0, effectiveLimit - (position.adsWatchedToday || 0));
    const progress = Math.min(100, (Number(position.lockedBalance) / Number(position.clickGoalSnapshot) * 100)).toFixed(1);
    const progressBar = buildProgressBar(Number(progress));

    const nextAvailable = position.nextAdsAvailableAt
        ? `\nâ³ Next session: ${formatTimeRemaining(position.nextAdsAvailableAt)}`
        : '';

    const streakLine = (position.currentStreak || 0) > 0
        ? `\nðŸ”¥ Streak: ${position.currentStreak} days`
        : '';

    await sendTelegramMessage(chatId, `
ðŸ“Š <b>Your Status â€” ${plan.name}</b>

ðŸ“º Ads today: ${position.adsWatchedToday}/${effectiveLimit}
${adsRemaining > 0 ? `âœ… ${adsRemaining} ads remaining` : 'âœ… Session complete'}${nextAvailable}

${progressBar} ${progress}%
ðŸ’° Locked: $${position.lockedBalance} / $${position.clickGoalSnapshot}
ðŸŽ¯ Cycle #${((position as any).totalCycles || 0) + 1}${streakLine}

<a href="${platform.siteUrl}/dashboard/ad-plans">Watch Ads â†’</a>

â€” ${platform.siteName}
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /plans â€” Show active plans
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handlePlans(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;
    if (!user) return sendNotLinked(chatId, platform);

    const positions = await db.query.userAdPositions.findMany({
        where: and(
            eq(userAdPositions.userId, user.id),
            eq(userAdPositions.status, 'active')
        ),
        with: { adPlan: true } as any
    });

    if (positions.length === 0) {
        await sendTelegramMessage(chatId, `
ðŸ“‹ <b>Your Plans</b>

You have no active plans.

<a href="${platform.siteUrl}/dashboard/ad-plans/buy">Browse Plans â†’</a>

â€” ${platform.siteName}
    `);
        return;
    }

    const planLines = positions.map(p => {
        const pct = Math.min(100, (Number(p.lockedBalance) / Number(p.clickGoalSnapshot) * 100)).toFixed(0);
        return `âœ… <b>${(p as any).adPlan.name}</b> â€” ${pct}% to cycle`;
    }).join('\n');

    await sendTelegramMessage(chatId, `
ðŸ“‹ <b>Your Active Plans</b>

${planLines}

<a href="${platform.siteUrl}/dashboard/ad-plans">Manage Plans â†’</a>

â€” ${platform.siteName}
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /referrals â€” Show team stats
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleReferrals(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;
    if (!user) return sendNotLinked(chatId, platform);

    const referrals = await db.query.users.findMany({
        where: eq(users.sponsor_id, user.id)
    });

    const totalReferrals = referrals.length;

    await sendTelegramMessage(chatId, `
ðŸ‘¥ <b>Your Team</b>

Total referrals: <b>${totalReferrals}</b>

<a href="${platform.siteUrl}/dashboard/team">View Full Team â†’</a>

â€” ${platform.siteName}
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /notifications â€” Show notification settings
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleNotificationSettings(
    chatId: string,
    telegramUsername?: string
) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId, `
ðŸ”” <b>Notification Settings</b>

To manage which notifications you receive,
visit your account settings:

<a href="${platform.siteUrl}/dashboard/settings/notifications">Manage Notifications â†’</a>

â€” ${platform.siteName}
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /stop â€” Disconnect Telegram
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleStop(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;

    if (user) {
        await db.update(userTelegramSettings)
            .set({ isConnected: false, telegramChatId: null })
            .where(eq(userTelegramSettings.userId, user.id));
    }

    await sendTelegramMessage(chatId, `
âœ… Notifications stopped.

You will no longer receive messages from ${platform.siteName}.

To reconnect, send /start at any time.
  `);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// /help â€” Show all commands
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function handleHelp(chatId: string) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId, `
ðŸ“– <b>${platform.siteName} Bot Commands</b>

/start â€” Connect your account
/balance â€” View your wallet balance
/status â€” View today's ad progress
/plans â€” View your active plans
/referrals â€” View your team stats
/notifications â€” Manage notifications
/stop â€” Stop all notifications
/help â€” Show this message

â€” ${platform.siteName}
  `);
}

async function handleUnknown(chatId: string) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId,
        `â“ Unknown command. Send /help to see available commands.\n\nâ€” ${platform.siteName}`
    );
}

async function sendNotLinked(chatId: string, platform: any) {
    await sendTelegramMessage(chatId, `
âš ï¸ <b>Account Not Linked</b>

Your Telegram is not connected to a ${platform.siteName} account.

Register at:
<a href="${platform.siteUrl}/auth/register">${platform.siteUrl}/auth/register</a>

Then send /start to connect.
  `);
}

async function getUserByTelegramChatId(chatId: string) {
    const telegramSettings = await db.query.userTelegramSettings.findFirst({
        where: and(
            eq(userTelegramSettings.telegramChatId, chatId),
            eq(userTelegramSettings.isConnected, true)
        ),
        with: { user: true } as any
    });
    return telegramSettings ? (telegramSettings as any).user : null;
}

function buildProgressBar(pct: number): string {
    const filled = Math.round(pct / 10);
    const empty = 10 - filled;
    return 'â–ˆ'.repeat(filled) + 'â–‘'.repeat(empty);
}

function formatTimeRemaining(date: Date): string {
    const diff = date.getTime() - Date.now();
    if (diff <= 0) return 'Ready now';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

async function getPlatform() {
    const s = await db.query.settings.findFirst();
    return {
        siteName: s?.site_name || 'Our Platform',
        siteUrl: process.env.NEXT_PUBLIC_APP_URL || '',
    };
}
