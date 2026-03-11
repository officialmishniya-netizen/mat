import { db } from './db';
import {
    communityPool, communityPoolLedger,
    users, ledger, adWatchLog, userAdPositions
} from './db/schema';
import { eq, and, gte, sql, desc, sum, count } from 'drizzle-orm';
import Decimal from 'decimal.js';
import { createLedgerEntry } from './ledger';
import { createNotification } from './notifications';

/**
 * Distributes funds from a specific bucket in the community pool.
 * Buckets: 'weekly_top_clickers' (25%), 'loyalty' (20%), 'jackpot' (20%), 'referral_champs' (20%), 'hardship' (15%)
 */
export async function distributePoolBucket(
    poolId: string,
    bucket: 'loyalty' | 'jackpot' | 'top_clickers' | 'referral_champs' | 'hardship'
) {
    return await db.transaction(async (tx) => {
        // 1. Calculate available funds for this bucket
        const bucketTotal = await tx.select({ total: sum(communityPoolLedger.amount) })
            .from(communityPoolLedger)
            .where(and(eq(communityPoolLedger.poolId, poolId), eq(communityPoolLedger.bucket, bucket)));

        const amountToDistribute = new Decimal(bucketTotal[0]?.total || "0");
        if (amountToDistribute.lte(0)) return { success: false, error: 'No funds available in bucket' };

        let winners: Array<{ id: string; share: Decimal }> = [];

        // 2. Logic for selecting winners based on bucket type
        switch (bucket) {
            case 'top_clickers':
                // Top 10 clickers in the last 7 days
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                const tops = await tx.select({ userId: adWatchLog.userId, clicks: count() })
                    .from(adWatchLog)
                    .where(gte(adWatchLog.createdAt, lastWeek))
                    .groupBy(adWatchLog.userId)
                    .orderBy(desc(count()))
                    .limit(10);

                // Distribute equally among top 10 for simplicity (could be weighted)
                winners = tops.map(t => ({ id: t.userId, share: amountToDistribute.div(tops.length) }));
                break;

            case 'loyalty':
                // All active users who have completed at least 5 cycles
                // Placeholder: simple distribution to all active users for now
                const loyalists = await tx.select({ id: users.id })
                    .from(users)
                    .limit(100);
                winners = loyalists.map(l => ({ id: l.id, share: amountToDistribute.div(loyalists.length) }));
                break;

            case 'jackpot':
                // Single random winner from all users who cycled in the last 24h
                const last24h = new Date();
                last24h.setHours(last24h.getHours() - 24);
                const cyclers = await tx.select({ userId: userAdPositions.userId })
                    .from(userAdPositions)
                    .where(and(eq(userAdPositions.status, 'cycled'), gte(userAdPositions.updatedAt, last24h)));

                if (cyclers.length > 0) {
                    const winner = cyclers[Math.floor(Math.random() * cyclers.length)];
                    winners = [{ id: winner.userId, share: amountToDistribute }];
                }
                break;

            case 'referral_champs':
                // Top 5 referrers by volume/count
                const referrers = await tx.select({ sponsorId: users.sponsor_id, directs: count() })
                    .from(users)
                    .where(sql`${users.sponsor_id} IS NOT NULL`)
                    .groupBy(users.sponsor_id)
                    .orderBy(desc(count()))
                    .limit(5);
                winners = referrers.map(r => ({ id: r.sponsorId!, share: amountToDistribute.div(referrers.length) }));
                break;

            case 'hardship':
                // Used for system stability (stays in system or paid to admin account)
                break;
        }

        // 3. Execute Payouts
        for (const winner of winners) {
            await createLedgerEntry(winner.id, winner.share.toFixed(2), 'surprise_box_reward', `pool_${bucket}`);
            await createNotification(
                winner.id,
                'earning',
                'Community Pool Win!',
                `Congratulations! You received a share from the ${bucket} pool.`,
                winner.share.toFixed(2)
            );
        }

        // 4. Record the distribution in the ledger (as a negative entry to zero out the bucket)
        await tx.insert(communityPoolLedger).values({
            poolId,
            amount: amountToDistribute.negated().toFixed(4),
            type: 'distribution',
            bucket,
            referenceId: `dist_${Date.now()}`
        });

        return { success: true, winnerCount: winners.length, totalDistributed: amountToDistribute.toFixed(2) };
    });
}
