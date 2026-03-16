import { NextResponse } from "next/server";
import { getLatestSimulationRun } from "@/lib/simulation/logging";

export async function GET() {
    try {
        const latestRun = await getLatestSimulationRun();
        return NextResponse.json(latestRun || { status: 'idle' });
    } catch (error: any) {
        console.error("Simulation Status Error:", error);
        return NextResponse.json({ 
            error: error.message,
            detail: error.detail || error.hint || "No further details",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
