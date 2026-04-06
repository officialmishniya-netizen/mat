import { NextResponse } from "next/server";
import { getLatestSimulationRun } from "@/lib/simulation/logging";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        let tableExists = false;
        try {
            const tableCheck = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'simulation_runs')`);
            tableExists = (tableCheck as any).rows[0].exists;
        } catch (e) {
            console.error("Schema check failed:", e);
        }

        if (!tableExists) {
            return NextResponse.json({
                status: 'error',
                message: 'Database schema mismatch: simulation_runs table missing. Please run migrations.'
            }, { status: 200 }); // Return 200 with error message to avoid 500 loop
        }

        const latestRun = await getLatestSimulationRun();
        return NextResponse.json(latestRun || { status: 'idle' });
    } catch (error: any) {
        console.error("SIMULATION STATUS CRITICAL ERROR:", error);
        return NextResponse.json({
            status: 'error',
            message: error.message || "Internal Server Error",
            visibleTables: []
        }, { status: 500 });
    }
}
