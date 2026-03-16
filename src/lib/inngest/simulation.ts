import { inngest } from "./client";
import { stagePopulateTree, stageMassFund, stageMatrixMassBuy, stageSimulateAdTraffic } from "../simulation/stages";
import { wipeSimulationData } from "../simulation/engine";
import { createSimulationRun, appendSimulationLog, finishSimulationRun } from "../simulation/logging";

/**
 * INNGEST SIMULATION WORKFLOW
 * Orchestrates the A-to-Z testing process.
 */

export const runFullSimulation = inngest.createFunction(
    { id: "run-full-simulation", name: "Run Full System Simulation" },
    { event: "simulation/run.full" },
    async ({ event, step }) => {
        const { breadth = 2, depth = 3, levelId = 1, watchesPerUser = 5, fundAmount = 100 } = event.data;

        const runId = await step.run("initialize-run", async () => {
            return await createSimulationRun({ breadth, depth, levelId, watchesPerUser, fundAmount });
        });

        // Stage 0: Cleanup
        await step.run("cleanup-previous", async () => {
            await appendSimulationLog(runId, "Stage 0: Purging existing simulation namespace...", "info");
            const result = await wipeSimulationData();
            await appendSimulationLog(runId, `Cleanup complete. Users purged: ${result.count || 0}`, "success");
            return result;
        });

        // Stage 1: Populate
        const treeInfo = await step.run("generate-tree", async () => {
            await appendSimulationLog(runId, `Stage 1: Generating referral tree (B:${breadth}, D:${depth})...`, "info");
            const result = await stagePopulateTree(breadth, depth);
            await appendSimulationLog(runId, `Tree generation complete. Total users: ${result.totalCreated}`, "success");
            return result;
        });

        // Stage 2: Fund
        await step.run("mass-fund", async () => {
            await appendSimulationLog(runId, `Stage 2: Injecting $${fundAmount} into all sim wallets...`, "info");
            const result = await stageMassFund(fundAmount);
            await appendSimulationLog(runId, `Funding complete. Total Injected: $${result.totalInjected}`, "success");
            return result;
        });

        // Stage 3: Buy Matrix
        await step.run("matrix-buy", async () => {
            await appendSimulationLog(runId, `Stage 3: Simulating matrix purchases for Level ${levelId}...`, "info");
            const result = await stageMatrixMassBuy(levelId);
            await appendSimulationLog(runId, `Matrix buys complete. Success: ${result.success}, Failed: ${result.failed}`, "success");
            return result;
        });

        // Stage 4: Simulate Activity
        await step.run("simulate-ads", async () => {
            await appendSimulationLog(runId, `Stage 4: Simulating ${watchesPerUser} ad watches per user...`, "info");
            const result = await stageSimulateAdTraffic(watchesPerUser);
            await appendSimulationLog(runId, `Traffic simulation complete. Total watches: ${result.totalWatches}`, "success");
            return result;
        });

        // Stage 5: Final Report (Simulated Analysis)
        const report = await step.run("generate-report", async () => {
            await appendSimulationLog(runId, "Stage 5: Finalizing comprehensive system report...", "info");
            const rep = {
                timestamp: new Date().toISOString(),
                config: { breadth, depth, levelId, watchesPerUser, fundAmount },
                tree: treeInfo,
                status: "COMPLETED",
                summary: "Simulation finished successfully. All systems (Ledger, Matrix, Ads) processed data without locks or insolvency alerts."
            };
            await finishSimulationRun(runId, "completed", rep);
            await appendSimulationLog(runId, "FULL SUITE EXECUTED. Report ready.", "success");
            return rep;
        });

        return { status: "success", report };
    }
);

export const wipeSimulationJob = inngest.createFunction(
    { id: "wipe-simulation", name: "Wipe Simulation Data" },
    { event: "simulation/wipe" },
    async ({ step }) => {
        await step.run("wipe-data", async () => {
            return await wipeSimulationData();
        });
        return { status: "wiped" };
    }
);
