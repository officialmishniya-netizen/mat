import { NextResponse } from "next/server";
import { getLatestSimulationRun } from "@/lib/simulation/logging";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        const latestRun = await getLatestSimulationRun();
        return NextResponse.json(latestRun || { status: 'idle' });
    } catch (error: any) {
        let tableList: any[] = [];
        try {
            // Check if DB is accessible and tables exist
            const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
            tableList = (result as any).rows || [];
        } catch (e) {
            console.error("DB Connectivity Error in Status Route:", e);
        }

        console.error("FULL SIMULATION STATUS ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json({
            error: error.message || "Unknown error",
            code: error.code || "No code",
            detail: error.detail || "No details",
            hint: error.hint || "No hint",
            query: error.query || "No query captured",
            visibleTables: tableList
        }, { status: 500 });
    }
}
