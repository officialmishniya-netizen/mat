import { db } from '../db';
import {
    userTelegramSettings, telegramBroadcasts,
    userAdPositions
} from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { sendTelegramMessage } from './bot';

export async function sendBroadcast(
    broadcastId: string
): Promise<void> {
    const broadcast = await db.query.telegramBroadcasts.findFirst({
        where: eq(telegramBroadcasts.id, broadcastId)
    });
    if (!broadcast) return;

    // Update status
    await db.update(telegramBroadcasts)
        .set({ status: 'sending', startedAt: new Date() })
        .where(eq(telegramBroadcasts.id, broadcastId));

    // Get target users
    const targetUsers = await getTargetUsers(
        broadcast.targetType,
        broadcast.targetConfig as any
    );

    // Get platform name
    const settings = await db.query.settings.findFirst();
    const platformName = settings?.site_name || 'Our Platform';

    let sent = 0;
    let failed = 0;

    // Send in batches of 30 (Telegram rate limit: 30 messages/second)
    for (let i = 0; i < targetUsers.length; i += 30) {
        const batch = targetUsers.slice(i, i + 30);

        await Promise.all(batch.map(async (user) => {
            const message = broadcast.message
                .replace(/{platform_name}/g, platformName)
                .replace(/{username}/g, user.username || 'Member');

            const result = await sendTelegramMessage(
                user.telegramChatId!, message
            );

            if (result.success) sent++;
            else failed++;
        }));

        // Wait 1 second between batches
        if (i + 30 < targetUsers.length) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Update broadcast record
    await db.update(telegramBroadcasts).set({
        status: 'completed',
        totalSent: sent,
        totalFailed: failed,
        completedAt: new Date(),
    }).where(eq(telegramBroadcasts.id, broadcastId));
}

async function getTargetUsers(
    targetType: string,
    config: any
): Promise<Array<{ id: string; username: string; telegramChatId: string }>> {
    // Get all connected users first
    const connected = await db.query.userTelegramSettings.findMany({
        where: and(
            eq(userTelegramSettings.isConnected, true),
        ),
        with: { user: true } as any
    });

    let filtered = connected.filter(s =>
        s.telegramChatId &&
        (s as any).user?.notifySystemAnnouncement !== false
    );

    switch (targetType) {
        case 'all':
            break;

        case 'active_only':
            // Only users with active positions
            const activeUserIds = (await db.query.userAdPositions.findMany({
                where: eq(userAdPositions.status, 'active'),
                columns: { userId: true }
            })).map(p => p.userId);

            filtered = filtered.filter(s =>
                activeUserIds.includes(s.userId)
            );
            break;

        case 'plan_tier':
            const planPositions = await db.query.userAdPositions.findMany({
                where: and(
                    eq(userAdPositions.adPlanId, config.planId),
                    eq(userAdPositions.status, 'active')
                ),
                columns: { userId: true }
            });
            const planUserIds = planPositions.map(p => p.userId);
            filtered = filtered.filter(s => planUserIds.includes(s.userId));
            break;

        case 'specific_users':
            filtered = filtered.filter(s =>
                config.userIds?.includes(s.userId)
            );
            break;
    }

    return filtered.map(s => ({
        id: s.userId,
        username: (s as any).user?.username || '',
        telegramChatId: s.telegramChatId!,
    }));
}
