import { db } from '../db';
import {
    userTelegramSettings, telegramAdminSettings,
    telegramNotificationLog, users, settings
} from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';

// ─────────────────────────────────────────────
// GET PLATFORM SETTINGS (never hardcode name)
// ─────────────────────────────────────────────
async function getPlatformSettings() {
    const siteSettings = await db.query.settings.findFirst();
    return {
        siteName: siteSettings?.site_name || 'Our Platform',
        siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
        botUsername: siteSettings?.telegram_bot_username || '',
    };
}

// ─────────────────────────────────────────────
// SEND TELEGRAM MESSAGE (core function)
// ─────────────────────────────────────────────
export async function sendTelegramMessage(
    chatId: string,
    message: string,
    options?: {
        parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
        replyMarkup?: object;        // inline keyboard buttons
        disablePreview?: boolean;
    }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return { success: false, error: 'bot_token_not_configured' };

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: options?.parseMode || 'HTML',
                    disable_web_page_preview: options?.disablePreview ?? true,
                    reply_markup: options?.replyMarkup,
                }),
            }
        );

        const data = await response.json();

        if (data.ok) {
            return { success: true, messageId: data.result.message_id };
        } else {
            // User blocked the bot or chat not found
            if (data.error_code === 403 || data.error_code === 400) {
                // Mark user as disconnected
                await db.update(userTelegramSettings)
                    .set({ isConnected: false, telegramChatId: null })
                    .where(eq(userTelegramSettings.telegramChatId, chatId));
            }
            return { success: false, error: data.description };
        }
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

// ─────────────────────────────────────────────
// SEND NOTIFICATION TO USER (main entry point)
// Called from every server action
// ─────────────────────────────────────────────
export async function notifyUser(
    userId: string,
    eventType: NotificationEventType,
    variables: Record<string, string | number>
): Promise<void> {
    try {
        // 1. Get admin global settings
        const adminSettings = await db.query.telegramAdminSettings.findFirst();
        if (!adminSettings) return;

        // 2. Check global kill switch for this event
        const globalKey = `global${toPascalCase(eventType)}` as keyof typeof adminSettings;
        if (adminSettings[globalKey] === false) return;

        // 3. Get user telegram settings
        const userSettings = await db.query.userTelegramSettings.findFirst({
            where: eq(userTelegramSettings.userId, userId)
        });

        if (!userSettings?.isConnected || !userSettings.telegramChatId) return;

        // 4. Check user's personal toggle for this event
        const userKey = `notify${toPascalCase(eventType)}` as keyof typeof userSettings;
        if (userSettings[userKey] === false) return;

        // 5. Check quiet hours
        if (userSettings.quietHoursEnabled) {
            const isQuiet = await checkQuietHours(userSettings);
            if (isQuiet) return;
        }

        // 6. Check rate limit
        if (adminSettings.globalRateLimitEnabled) {
            const recentCount = await getRecentMessageCount(
                userId,
                adminSettings.globalMaxMessagesPerUserPerHour || 10
            );
            if (recentCount >= (adminSettings.globalMaxMessagesPerUserPerHour || 10)) return;
        }

        // 7. Get platform name (never hardcoded)
        const platform = await getPlatformSettings();

        // 8. Build message from template
        const templateKey = `template${toPascalCase(eventType)}` as keyof typeof adminSettings;
        const template = (adminSettings[templateKey] as string) ||
            getDefaultTemplate(eventType);

        const message = interpolateTemplate(template, {
            ...variables,
            platform_name: platform.siteName,
            platform_url: platform.siteUrl,
        });

        // 9. Send message
        const result = await sendTelegramMessage(
            userSettings.telegramChatId,
            message
        );

        // 10. Log it
        await db.insert(telegramNotificationLog).values({
            userId,
            telegramChatId: userSettings.telegramChatId,
            eventType,
            messageText: message,
            telegramMessageId: result.messageId,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error,
        });

        // 11. Update last message time
        if (result.success) {
            await db.update(userTelegramSettings)
                .set({ lastMessageAt: new Date() })
                .where(eq(userTelegramSettings.userId, userId));
        }
    } catch (error) {
        console.error('Telegram notification error:', error);
    }
}

// ─────────────────────────────────────────────
// TEMPLATE INTERPOLATION
// Replaces {variable_name} with actual values
// ─────────────────────────────────────────────
function interpolateTemplate(
    template: string,
    variables: Record<string, string | number>
): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
}

// ─────────────────────────────────────────────
// DEFAULT MESSAGE TEMPLATES
// Used when admin hasn't customized yet
// All use {platform_name} never hardcoded
// ─────────────────────────────────────────────
export function getDefaultTemplate(eventType: NotificationEventType): string {
    const templates: Record<NotificationEventType, string> = {

        cycle_complete: `🎉 <b>Cycle Complete!</b>

💰 Payout: <b>\${'{payout}'}</b> → Your Wallet
📋 Plan: {plan_name}
🔁 Cycle #{cycle_number}
👥 Sponsor Bonus: {sponsor_bonus} sent
🌊 Pool Contribution: {pool_contribution}

{spin_line}

<a href="{platform_url}/dashboard/ad-plans">Open {platform_name} →</a>`,

        spin_wheel_ready: `🎡 <b>Your Spin Wheel is Ready!</b>

Your {plan_name} just cycled.
Spin now to boost your payout!

⚡ Don't wait — spin events may be active.

<a href="{platform_url}/dashboard/ad-plans/spin/{position_id}">Spin Now →</a>

— {platform_name}`,

        withdrawal_submitted: `📤 <b>Withdrawal Submitted</b>

Amount: <b>{amount}</b>
Method: {method}
Status: ⏳ Pending Review

You'll be notified when it's approved.

— {platform_name}`,

        withdrawal_approved: `✅ <b>Withdrawal Approved!</b>

Amount: <b>{amount}</b>
Method: {method}
Estimated arrival: {eta}

Your payment is being processed.

— {platform_name}`,

        withdrawal_paid: `💸 <b>Payment Sent!</b>

Amount: <b>{amount}</b>
Transaction ID: <code>{txn_id}</code>
Method: {method}

Your withdrawal has been paid. ✅

<a href="{platform_url}/dashboard/wallet">View Wallet →</a>

— {platform_name}`,

        withdrawal_rejected: `❌ <b>Withdrawal Rejected</b>

Amount: {amount}
Reason: {reason}

Your balance has been refunded.
Please contact support if you have questions.

<a href="{platform_url}/dashboard/wallet">View Wallet →</a>

— {platform_name}`,

        ads_ready: `🎯 <b>Your Ads Are Ready!</b>

Your 24-hour session has reset.
{ads_available} ads available to watch.
Potential earn today: <b>{potential_earn}</b>

🔒 Locked balance: {locked_balance} / {click_goal}
{progress_bar} {progress_pct}% to cycle

<a href="{platform_url}/dashboard/ad-plans">Watch Ads Now →</a>

— {platform_name}`,

        referral_joined: `👥 <b>New Team Member!</b>

<b>{referral_username}</b> just joined {platform_name}
under your referral link.

Once they start cycling, you'll earn
matching bonuses automatically.

<a href="{platform_url}/dashboard/team">View Your Team →</a>

— {platform_name}`,

        referral_cycled: `💎 <b>Team Bonus Earned!</b>

<b>{referral_username}</b> just completed a cycle.

You earned: <b>{bonus_amount}</b> matching bonus
Credited to your wallet automatically. ✅

Total team bonuses: {total_team_bonus}

— {platform_name}`,

        spin_bonus_won: `🎰 <b>Spin Win!</b>

You landed on: <b>{slice_label}</b>
Bonus earned: <b>{bonus_amount}</b>

{extra_line}

Total this cycle: {total_payout}

— {platform_name}`,

        badge_unlocked: `🏆 <b>Badge Unlocked!</b>

You earned: <b>{badge_name}</b>
Category: {badge_category}
Rarity: {badge_rarity}

{badge_perk_line}

<a href="{platform_url}/dashboard/achievements">View Achievements →</a>

— {platform_name}`,

        pool_jackpot_won: `🎰 <b>JACKPOT! You Won!</b>

🎉 Congratulations!
You won the Community Pool Jackpot!

Prize: <b>{jackpot_amount}</b>
Credited to your wallet now. ✅

<a href="{platform_url}/dashboard/wallet">View Wallet →</a>

— {platform_name}`,

        pool_distribution: `🌊 <b>Pool Reward!</b>

You received a Community Pool distribution.

Type: {distribution_type}
Amount: <b>{amount}</b>

Keep watching ads to stay eligible
for the next distribution!

— {platform_name}`,

        dead_star_warning: `⚠️ <b>Action Required</b>

Your {plan_name} position has been
inactive for {days_inactive} days.

In {days_until_dead} days it will enter
Dead Star status.

To reactivate: watch ads or pay the
revival fee ({revival_fee}).

<a href="{platform_url}/dashboard/ad-plans">Reactivate Now →</a>

— {platform_name}`,

        contest_rank_update: `🏅 <b>Contest Update</b>

{contest_name}
Your current rank: <b>#{your_rank}</b>
Your score: {your_score}
Leader: {leader_score}

Time remaining: {time_remaining}

<a href="{platform_url}/dashboard/contests">View Leaderboard →</a>

— {platform_name}`,

        flash_sale_live: `⚡ <b>Flash Sale Live!</b>

{sale_name}
Discount: <b>{discount_pct}% OFF</b>
Ends in: {ends_in}

Don't miss out on boosters and
power-ups at discounted prices!

<a href="{platform_url}/dashboard/marketplace">Shop Now →</a>

— {platform_name}`,

        spin_event_active: `🎡 <b>Special Spin Event!</b>

<b>{event_name}</b> is now active!

{event_description}
Ends: {ends_at}

Cycle now to take advantage!

<a href="{platform_url}/dashboard/ad-plans">Go to Ad Plans →</a>

— {platform_name}`,

        matrix_cycle: `🔷 <b>Matrix Cycle Complete!</b>

Level: {matrix_level}
Payout: <b>{cycle_reward}</b>
Matching Bonus Sent: {matching_bonus}

Position #{position_number} in your matrix.

<a href="{platform_url}/dashboard/matrix">View Matrix →</a>

— {platform_name}`,

        matching_bonus: `💰 <b>Matching Bonus!</b>

Your downline member cycled.
You earned: <b>{bonus_amount}</b>

From: {member_username} (Level {level})
Plan: {plan_name}

Total matching earned: {total_matching}

— {platform_name}`,

        login_streak: `🔥 <b>{streak_days}-Day Streak!</b>

You've been active for {streak_days}
consecutive days on {platform_name}.

{streak_reward_line}

Keep it up!

— {platform_name}`,

        system_announcement: `📢 <b>Announcement from {platform_name}</b>

{announcement_text}

— {platform_name} Team`,

        welcome: `👋 <b>Welcome to {platform_name}!</b>

Hi {username}! Your Telegram notifications
are now active. ✅

You'll receive alerts for:
• 💰 Cycle payouts
• 🎡 Spin wheel ready
• 💸 Withdrawal updates
• 👥 Team bonuses
• 🏆 Achievements & more

Manage your notification preferences
in your account settings.

<a href="{platform_url}/dashboard">Open Dashboard →</a>

— {platform_name} Team`,
    };

    return templates[eventType] || `📬 New notification from {platform_name}`;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function toPascalCase(str: string): string {
    return str.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

async function checkQuietHours(settings: any): Promise<boolean> {
    if (!settings.quietHoursEnabled) return false;
    const now = new Date();
    // Convert to user timezone
    const hour = parseInt(
        new Intl.DateTimeFormat('en', {
            hour: 'numeric', hour12: false,
            timeZone: settings.timezone || 'UTC'
        }).format(now)
    );
    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;
    if (start <= end) return hour >= start && hour < end;
    return hour >= start || hour < end; // overnight window
}

async function getRecentMessageCount(
    userId: string,
    windowHours: number
): Promise<number> {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    const logs = await db.query.telegramNotificationLog.findMany({
        where: and(
            eq(telegramNotificationLog.userId, userId),
            gte(telegramNotificationLog.sentAt, since),
            eq(telegramNotificationLog.status, 'sent')
        )
    });
    return logs.length;
}

export type NotificationEventType =
    | 'cycle_complete'
    | 'spin_wheel_ready'
    | 'withdrawal_submitted'
    | 'withdrawal_approved'
    | 'withdrawal_paid'
    | 'withdrawal_rejected'
    | 'ads_ready'
    | 'referral_joined'
    | 'referral_cycled'
    | 'spin_bonus_won'
    | 'badge_unlocked'
    | 'pool_jackpot_won'
    | 'pool_distribution'
    | 'dead_star_warning'
    | 'contest_rank_update'
    | 'flash_sale_live'
    | 'spin_event_active'
    | 'matrix_cycle'
    | 'matching_bonus'
    | 'login_streak'
    | 'system_announcement'
    | 'welcome';
