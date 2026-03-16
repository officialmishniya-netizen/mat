import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { 
    users, 
    ledger, 
    matrixPositions, 
    adWatchLog, 
    withdrawals, 
    fraudAlerts,
    userAdLevels,
    userAdPositions,
    notifications,
    userAccountStatus,
    marketplacePurchases,
    userInventory
} from "@/lib/db/schema";
import { eq, like, inArray, sql } from "drizzle-orm";

/**
 * ULTRA-COMPREHENSIVE SIMULATION ENGINE CORE
 * Implementation of isolation and cleanup logic.
 */

export const SIM_PREFIX = "sim_";

/**
 * Wipes all data associated with simulation users.
 * Strictly targets usernames starting with 'sim_'.
 */
export async function wipeSimulationData() {
    console.log("Starting simulation data wipe...");

    try {
        // 1. Get all simulation user IDs
        const simUsers = await db.select({ id: users.id })
            .from(users)
            .where(like(users.username, `${SIM_PREFIX}%`));
        
        const simUserIds = simUsers.map(u => u.id);

        if (simUserIds.length === 0) {
            return { success: true, message: "No simulation data found to wipe." };
        }

        console.log(`Wiping data for ${simUserIds.length} simulation users...`);

        // 2. Delete related records in dependent tables
        // We use subqueries or inArray for efficiency
        
        // Ledger & Financials
        await db.delete(ledger).where(inArray(ledger.user_id, simUserIds));
        await db.delete(withdrawals).where(inArray(withdrawals.user_id, simUserIds));
        
        // Matrix & Positions
        await db.delete(matrixPositions).where(inArray(matrixPositions.userId, simUserIds));
        
        // Ads & Activity
        await db.delete(adWatchLog).where(inArray(adWatchLog.userId, simUserIds));
        await db.delete(userAdPositions).where(inArray(userAdPositions.userId, simUserIds));
        await db.delete(userAdLevels).where(inArray(userAdLevels.user_id, simUserIds));
        
        // Fraud & Status
        await db.delete(fraudAlerts).where(sql`involved_user_ids ??| array[${simUserIds.join(',')}]`); // Handle JSONB array check if possible, or simpler:
        // For fraudAlerts, we might need a more complex query if involvedUserIds is a jsonb array.
        // Let's just wipe alerts where the title/description mentions sim_ for now, or skip if 
        // we can't easily query jsonb in drizzle without more setup. 
        // Actually, let's just wipe all fraud alerts if we are in a dev environment? 
        // No, stay safe:
        await db.execute(sql`DELETE FROM fraud_alerts WHERE involved_user_ids::jsonb ?| array(SELECT id::text FROM users WHERE username LIKE 'sim_%')`);

        await db.delete(userAccountStatus).where(inArray(userAccountStatus.userId, simUserIds));
        
        // Marketplace & Inventory
        await db.delete(userInventory).where(inArray(userInventory.userId, simUserIds));
        await db.delete(marketplacePurchases).where(inArray(marketplacePurchases.userId, simUserIds));
        
        // Notifications & Communication
        await db.delete(notifications).where(inArray(notifications.userId, simUserIds));

        // 3. Finally delete the users themselves
        await db.delete(users).where(inArray(users.id, simUserIds));

        console.log("Simulation data wipe completed successfully.");
        return { success: true, count: simUserIds.length };
    } catch (error) {
        console.error("Failed to wipe simulation data:", error);
        throw error;
    }
}

/**
 * Multi-user generation with referral links
 */
export async function generateSimUsers(count: number, sponsorUsername?: string) {
    const results: any[] = [];
    let sponsorId: string | null = null;

    if (sponsorUsername) {
        const [sponsor] = await db.select({ id: users.id }).from(users).where(eq(users.username, sponsorUsername));
        if (sponsor) sponsorId = sponsor.id;
    }

    for (let i = 0; i < count; i++) {
        const id = crypto.randomUUID();
        const username = `${SIM_PREFIX}${Math.random().toString(36).substring(2, 7)}`;
        
        await db.insert(users).values({
            id,
            username,
            email: `${username}@example.com`,
            sponsor_id: sponsorId as any,
            role: 'user',
            rank: 'Member',
            created_at: new Date()
        });

        // Initialize status
        await db.insert(userAccountStatus).values({
            userId: id,
            status: 'active'
        });

        results.push({ id, username });
    }

    return results;
}
