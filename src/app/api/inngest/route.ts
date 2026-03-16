import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { checkMatrixCycle, weeklyPoolDistribution } from "@/lib/inngest/functions";
import { runFullSimulation, wipeSimulationJob } from "@/lib/inngest/simulation";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        checkMatrixCycle, 
        weeklyPoolDistribution,
        runFullSimulation,
        wipeSimulationJob
    ],
});
