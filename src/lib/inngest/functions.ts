import { inngest } from "./client";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { communityPool } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const checkMatrixCycle = inngest.createFunction(
    { id: "check-matrix-cycle" },
    { event: "matrix/cycle.check" },
    async ({ event, step }) => {
        await step.run("log-start", async () => {
            console.log(`[Background Job] Checking cycle for Spot ${event.data.spotId}`);
        });

        await step.run("trigger-rpc-cycle", async () => {
            const { data, error } = await supabase.rpc("evaluate_cycle_status", {
                p_spot_id: event.data.spotId
            });

            if (error) console.error("Inngest RPC Error:", error);
            return { success: !error };
        });

        return { status: "completed", spotId: event.data.spotId };
    }
);

// Community Pool Weekly Distribution
// Every Monday at 00:00
export const weeklyPoolDistribution = inngest.createFunction(
    { id: "weekly-pool-distribution" },
    { cron: "0 0 * * 1" }, // Every Monday at Midnight
    async ({ step }) => {
        // 1. Get Active Pool
        const pool = await step.run("get-active-pool", async () => {
            return await db.query.communityPool.findFirst({
                where: eq(communityPool.isActive, true)
            });
        });

        if (!pool) return { status: "failed", error: "No active pool found" };

        const buckets: any[] = ['top_clickers', 'loyalty', 'jackpot', 'referral_champs', 'hardship'];

        const results: any[] = [];
        for (const bucket of buckets) {
            const res = await step.run(`distribute-${bucket}`, async () => {
                const { distributePoolBucket } = await import("@/lib/communityPool");
                return await distributePoolBucket(pool.id, bucket);
            });
            results.push(res);
        }

        return { status: "completed", poolId: pool.id, results };
    }
);
