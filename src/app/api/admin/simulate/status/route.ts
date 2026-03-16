import { NextResponse } from "next/server";
import { getLatestSimulationRun } from "@/lib/simulation/logging";

export async function GET() {
    try {
        const latestRun = await getLatestSimulationRun();
        return NextResponse.json(latestRun || { status: 'idle' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
