import { NextResponse } from "next/server";
import { getLatestSimulationRun } from "@/lib/simulation/logging";

export async function GET() {
    try {
        const latestRun = await getLatestSimulationRun();
        return NextResponse.json(latestRun || { status: 'idle' });
    } catch (error: any) {
        let tableList: any[] = [];
        try {
            tableList = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        } catch (e) {}

        console.error("FULL DB ERROR:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
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
