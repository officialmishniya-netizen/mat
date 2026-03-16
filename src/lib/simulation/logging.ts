import { db } from "@/lib/db";
import { simulationRuns } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * SIMULATION LOGGING UTILITIES
 */

export async function createSimulationRun(config: any) {
    const [run] = await db.insert(simulationRuns).values({
        config,
        status: 'running',
        logs: [],
    }).returning({ id: simulationRuns.id });
    return run.id;
}

export async function appendSimulationLog(runId: string, message: string, type: 'info' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    
    await db.update(simulationRuns)
        .set({
            logs: sql`logs || ${JSON.stringify([logEntry])}::jsonb`,
            updatedAt: new Date()
        })
        .where(eq(simulationRuns.id, runId));
}

export async function finishSimulationRun(runId: string, status: 'completed' | 'failed', report?: any) {
    await db.update(simulationRuns)
        .set({
            status,
            report,
            updatedAt: new Date()
        })
        .where(eq(simulationRuns.id, runId));
}

export async function getLatestSimulationRun() {
    return await db.query.simulationRuns.findFirst({
        orderBy: (runs, { desc }) => [desc(runs.createdAt)]
    });
}
