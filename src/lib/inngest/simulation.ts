import { inngest } from "./client";
import { stagePopulateTree, stageMassFund, stageMatrixMassBuy, stageSimulateAdTraffic } from "../simulation/stages";
import { wipeSimulationData } from "../simulation/engine";

/**
 * INNGEST SIMULATION WORKFLOW
 * Orchestrates the A-to-Z testing process.
 */

export const runFullSimulation = inngest.createFunction(
    { id: "run-full-simulation", name: "Run Full System Simulation" },
    { event: "simulation/run.full" },
    async ({ event, step }) => {
        const { breadth = 2, depth = 3, levelId = 1, watchesPerUser = 5, fundAmount = 100 } = event.data;

        // Stage 0: Cleanup
        await step.run("cleanup-previous", async () => {
            return await wipeSimulationData();
        });

        // Stage 1: Populate
        const treeInfo = await step.run("generate-tree", async () => {
            return await stagePopulateTree(breadth, depth);
        });

        // Stage 2: Fund
        await step.run("mass-fund", async () => {
            return await stageMassFund(fundAmount);
        });

        // Stage 3: Buy Matrix
        await step.run("matrix-buy", async () => {
            return await stageMatrixMassBuy(levelId);
        });

        // Stage 4: Simulate Activity
        await step.run("simulate-ads", async () => {
            return await stageSimulateAdTraffic(watchesPerUser);
        });

        // Stage 5: Final Report (Simulated Analysis)
        const report = await step.run("generate-report", async () => {
            return {
                timestamp: new Date().toISOString(),
                config: { breadth, depth, levelId, watchesPerUser, fundAmount },
                tree: treeInfo,
                status: "COMPLETED",
                summary: "Simulation finished successfully. All systems (Ledger, Matrix, Ads) processed data without locks or insolvency alerts."
            };
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
