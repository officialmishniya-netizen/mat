"use server";

import { db } from "@/lib/db";
import { adLevels, userAdLevels, ledger, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createServerSupabaseClient as createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

/**
 * PURCHASE PTC AD LEVEL
 * Handles deducting funds and granting the level.
 * Triggers free Matrix level if configured.
 */
export async function buyAdLevelAction(levelId: number) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Unauthorized");

        const userId = session.user.id;

        // 0. Check Global Toggle
        const { data: settings } = await supabase.from('settings').select('purchases_enabled').single();
        if (settings && !settings.purchases_enabled) {
            throw new Error("Global Level Purchases are currently disabled by the administrator.");
        }

        // 1. Fetch Level Details
        const level = await db.query.adLevels.findFirst({
            where: eq(adLevels.id, levelId)
        });
        if (!level) throw new Error("Ad Level not found");

        const price = parseFloat(level.price as string);

        return await db.transaction(async (tx) => {
            // 2. Check Balance
            const balanceResult = await tx.select({
                total: sql<string>`SUM(amount)`
            }).from(ledger).where(eq(ledger.user_id, userId));

            const balance = parseFloat(balanceResult[0]?.total || "0");
            if (balance < price) {
                throw new Error(`Insufficient balance. Required: $${price.toFixed(2)}`);
            }

            // 3. Deduct Funds
            await tx.insert(ledger).values({
                user_id: userId,
                amount: (-price).toString(),
                type: 'ptc_purchase',
                reference_id: levelId.toString()
            });

            // 4. Grant PTC Level
            await tx.insert(userAdLevels).values({
                user_id: userId,
                ad_level_id: levelId,
                clicks_completed: 0,
                status: 'active'
            });

            // 5. CROSS-PLATFORM REWARD: Free Matrix Level
            if (level.free_matrix_level_id) {
                // Trigger the Matrix purchase RPC directly via SQL
                // This ensures consistency with the matrix placement logic
                await tx.execute(sql`SELECT buy_matrix_level(${userId}, ${level.free_matrix_level_id})`);
            }

            // 6. Referral Commission (Optional, simple implementation)
            const userProfile = await tx.select({ sponsorId: users.sponsor_id }).from(users).where(eq(users.id, userId)).limit(1);
            if (userProfile[0]?.sponsorId) {
                const commission = price * 0.10; // 10% direct sponsor bonus for PTC
                await tx.insert(ledger).values({
                    user_id: userProfile[0].sponsorId,
                    amount: commission.toString(),
                    type: 'referral_bonus_ptc',
                    reference_id: userId
                });
            }

            return { success: true };
        });

    } catch (error: any) {
        console.error("PTC PURCHASE ERROR:", error);
        return { success: false, error: error.message };
    } finally {
        revalidatePath("/dashboard");
    }
}
