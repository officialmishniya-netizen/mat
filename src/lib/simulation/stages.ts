import { db } from "@/lib/db";
import { users, ledger, matrixPositions, adWatchLog, userAdPositions, ads, adPlans, adLevels, userAdLevels } from "@/lib/db/schema";
import { generateSimUsers, SIM_PREFIX } from "./engine";
import { eq, sql, and, desc } from "drizzle-orm";
import { createLedgerEntry } from "@/lib/ledger";

/**
 * SIMULATION STAGES
 * High-level orchestration of platform activities.
 */

/**
 * Stage 1: Populate & Tree Generation
 * Creates a hierarchical referral network.
 */
export async function stagePopulateTree(breadth: number, depth: number) {
    console.log(`Starting Tree Generation: breadth=${breadth}, depth=${depth}`);

    // Create Root
    const [root] = await generateSimUsers(1);
    let currentLevel: any[] = [root];

    for (let d = 0; d < depth; d++) {
        const nextLevel: any[] = [];
        for (const sponsor of currentLevel) {
            const referrals = await generateSimUsers(breadth, sponsor.username);
            nextLevel.push(...referrals);
        }
        currentLevel = nextLevel;
    }

    return { root, totalCreated: (Math.pow(breadth, depth + 1) - 1) / (breadth - 1) || breadth * depth };
}

/**
 * Stage 2: Mass Funding
 * Inject USDT into all sim users.
 */
export async function stageMassFund(amount: number) {
    const simUsers = await db.select({ id: users.id }).from(users).where(sql`username LIKE ${SIM_PREFIX} || '%'`);

    for (const user of simUsers) {
        await createLedgerEntry(user.id, amount, 'deposit', 'SIM_AUTO_FUND');
    }

    return { fundedCount: simUsers.length, totalInjected: simUsers.length * amount };
}

/**
 * Stage 3: Matrix Mass-Buy
 * All sim users buy a specific level.
 */
export async function stageMatrixMassBuy(levelId: number) {
    const simUsers = await db.select({ id: users.id }).from(users).where(sql`username LIKE ${SIM_PREFIX} || '%'`);

    const results: any[] = [];
    for (const user of simUsers) {
        try {
            // Using the RPC from supabase_rpc.sql
            // Note: We need a way to call pg functions from drizzle or supabase client
            // Since we are in an edge/node env, we use db.execute
            await db.execute(sql`SELECT buy_matrix_level(${user.id}, ${levelId})`);
            results.push({ userId: user.id, success: true });
        } catch (e) {
            results.push({ userId: user.id, success: false, error: (e as Error).message });
        }
    }

    return {
        attempted: simUsers.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
    };
}

/**
 * Stage 4: Ad Velocity Simulation
 * Simulates ad watching. 
 * uses simplified logic to bypass timers and signatures for speed.
 */
export async function stageSimulateAdTraffic(watchesPerUser: number) {
    const simUsers = await db.select({ id: users.id }).from(users).where(sql`username LIKE ${SIM_PREFIX} || '%'`);
    const [sampleAd] = await db.select().from(ads).where(eq(ads.active, true)).limit(1);

    if (!sampleAd) return { error: "No active ads to watch." };

    for (const user of simUsers) {
        for (let i = 0; i < watchesPerUser; i++) {
            // Simulate the transaction logic from ads/verify
            await db.transaction(async (tx) => {
                const [pos] = await tx.select()
                    .from(userAdPositions)
                    .where(and(eq(userAdPositions.userId, user.id), eq(userAdPositions.status, 'active')))
                    .limit(1);

                if (!pos) return;

                const earnedAmount = sampleAd.reward;
                const lockedBalanceAfter = (parseFloat(pos.lockedBalance || "0") + parseFloat(earnedAmount)).toString();

                await tx.insert(adWatchLog).values({
                    userId: user.id,
                    adId: sampleAd.id,
                    earnedAmount,
                    lockedBalanceBefore: pos.lockedBalance || "0",
                    lockedBalanceAfter,
                    ipAddress: "127.0.0.1"
                });

                await tx.update(userAdPositions)
                    .set({
                        adsWatchedToday: (pos.adsWatchedToday || 0) + 1,
                        lockedBalance: lockedBalanceAfter,
                        lastAdWatchedAt: new Date()
                    })
                    .where(eq(userAdPositions.id, pos.id));
            });
        }
    }

    return { usersInvolved: simUsers.length, totalWatches: simUsers.length * watchesPerUser };
}

/**
 * Stage 5: PTC Mass-Buy
 * All sim users buy a specific ad level.
 */
export async function stagePtcMassBuy(levelId: number) {
    const simUsers = await db.select({ id: users.id }).from(users).where(sql`username LIKE ${SIM_PREFIX} || '%'`);

    const results: any[] = [];
    for (const user of simUsers) {
        try {
            // We use the new server action logic (directly via DB for speed in simulation)
            await db.transaction(async (tx) => {
                const level = await tx.query.adLevels.findFirst({ where: eq(adLevels.id, levelId) });
                if (!level) throw new Error("Ad level not found");

                await tx.insert(userAdLevels).values({
                    user_id: user.id,
                    ad_level_id: levelId,
                    status: 'active'
                });

                // Cross-Reward Trigger
                if (level.free_matrix_level_id) {
                    await tx.execute(sql`SELECT buy_matrix_level(${user.id}, ${level.free_matrix_level_id})`);
                }
            });
            results.push({ userId: user.id, success: true });
        } catch (e) {
            results.push({ userId: user.id, success: false, error: (e as Error).message });
        }
    }

    return {
        attempted: simUsers.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
    };
}
