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

// ─────────────────────────────────────────────────────────
// /start — Link Telegram to account
// ─────────────────────────────────────────────────────────
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
        // User not found — show registration prompt
        await sendTelegramMessage(chatId, `
👋 <b>Welcome to ${platform.siteName}!</b>

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

// ─────────────────────────────────────────────────────────
// /balance — Show wallet balance
// ─────────────────────────────────────────────────────────
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
        ? `\n🔓 Locked: <b>$${activePosition.lockedBalance}</b> / $${activePosition.clickGoalSnapshot}`
        : '';

    await sendTelegramMessage(chatId, `
💰 <b>Your ${platform.siteName} Wallet</b>

Available Balance: <b>$${balance}</b>${lockedInfo}

<a href="${platform.siteUrl}/dashboard/wallet">View Full Wallet →</a>
  `);
}

// ─────────────────────────────────────────────────────────
// /status — Show daily ad status
// ─────────────────────────────────────────────────────────
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
📊 <b>Your Status</b>

No active ad plan found.

<a href="${platform.siteUrl}/dashboard/ad-plans/buy">Browse Plans →</a>

— ${platform.siteName}
    `);
        return;
    }

    const plan = (position as any).adPlan;
    const effectiveLimit = Number(plan.dailyAds) + (position.boostedAdsPerDay || 0);
    const adsRemaining = Math.max(0, effectiveLimit - (position.adsWatchedToday || 0));
    const progress = Math.min(100, (Number(position.lockedBalance) / Number(position.clickGoalSnapshot) * 100)).toFixed(1);
    const progressBar = buildProgressBar(Number(progress));

    const nextAvailable = position.nextAdsAvailableAt
        ? `\n⏳ Next session: ${formatTimeRemaining(position.nextAdsAvailableAt)}`
        : '';

    const streakLine = (position.currentStreak || 0) > 0
        ? `\n🔥 Streak: ${position.currentStreak} days`
        : '';

    await sendTelegramMessage(chatId, `
📊 <b>Your Status — ${plan.name}</b>

📺 Ads today: ${position.adsWatchedToday}/${effectiveLimit}
${adsRemaining > 0 ? `✅ ${adsRemaining} ads remaining` : '✅ Session complete'}${nextAvailable}

${progressBar} ${progress}%
💰 Locked: $${position.lockedBalance} / $${position.clickGoalSnapshot}
🎯 Cycle #${((position as any).totalCycles || 0) + 1}${streakLine}

<a href="${platform.siteUrl}/dashboard/ad-plans">Watch Ads →</a>

— ${platform.siteName}
  `);
}

// ─────────────────────────────────────────────────────────
// /plans — Show active plans
// ─────────────────────────────────────────────────────────
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
📋 <b>Your Plans</b>

You have no active plans.

<a href="${platform.siteUrl}/dashboard/ad-plans/buy">Browse Plans →</a>

— ${platform.siteName}
    `);
        return;
    }

    const planLines = positions.map(p => {
        const pct = Math.min(100, (Number(p.lockedBalance) / Number(p.clickGoalSnapshot) * 100)).toFixed(0);
        return `✅ <b>${(p as any).adPlan.name}</b> — ${pct}% to cycle`;
    }).join('\n');

    await sendTelegramMessage(chatId, `
📋 <b>Your Active Plans</b>

${planLines}

<a href="${platform.siteUrl}/dashboard/ad-plans">Manage Plans →</a>

— ${platform.siteName}
  `);
}

// ─────────────────────────────────────────────────────────
// /referrals — Show team stats
// ─────────────────────────────────────────────────────────
async function handleReferrals(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;
    if (!user) return sendNotLinked(chatId, platform);

    const referrals = await db.query.users.findMany({
        where: eq(users.sponsor_id, user.id)
    });

    const totalReferrals = referrals.length;

    await sendTelegramMessage(chatId, `
👥 <b>Your Team</b>

Total referrals: <b>${totalReferrals}</b>

<a href="${platform.siteUrl}/dashboard/team">View Full Team →</a>

— ${platform.siteName}
  `);
}

// ─────────────────────────────────────────────────────────
// /notifications — Show notification settings
// ─────────────────────────────────────────────────────────
async function handleNotificationSettings(
    chatId: string,
    telegramUsername?: string
) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId, `
🔔 <b>Notification Settings</b>

To manage which notifications you receive,
visit your account settings:

<a href="${platform.siteUrl}/dashboard/settings/notifications">Manage Notifications →</a>

— ${platform.siteName}
  `);
}

// ─────────────────────────────────────────────────────────
// /stop — Disconnect Telegram
// ─────────────────────────────────────────────────────────
async function handleStop(chatId: string, telegramUsername?: string) {
    const platform = await getPlatform();
    const user = await getUserByTelegramChatId(chatId) as any;

    if (user) {
        await db.update(userTelegramSettings)
            .set({ isConnected: false, telegramChatId: null })
            .where(eq(userTelegramSettings.userId, user.id));
    }

    await sendTelegramMessage(chatId, `
✅ Notifications stopped.

You will no longer receive messages from ${platform.siteName}.

To reconnect, send /start at any time.
  `);
}

// ─────────────────────────────────────────────────────────
// /help — Show all commands
// ─────────────────────────────────────────────────────────
async function handleHelp(chatId: string) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId, `
📖 <b>${platform.siteName} Bot Commands</b>

/start — Connect your account
/balance — View your wallet balance
/status — View today's ad progress
/plans — View your active plans
/referrals — View your team stats
/notifications — Manage notifications
/stop — Stop all notifications
/help — Show this message

— ${platform.siteName}
  `);
}

async function handleUnknown(chatId: string) {
    const platform = await getPlatform();
    await sendTelegramMessage(chatId,
        `❓ Unknown command. Send /help to see available commands.\n\n— ${platform.siteName}`
    );
}

async function sendNotLinked(chatId: string, platform: any) {
    await sendTelegramMessage(chatId, `
⚠️ <b>Account Not Linked</b>

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
    return '█'.repeat(filled) + '░'.repeat(empty);
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
