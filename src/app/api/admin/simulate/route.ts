import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, config } = body;

        // Check for table existence if running a simulation
        if (action === "run") {
            try {
                const tableCheck = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'simulation_runs')`);
                if (!(tableCheck as any).rows[0].exists) {
                    return NextResponse.json({ error: "Database schema mismatch: simulation_runs table missing." }, { status: 400 });
                }
            } catch (e) {
                console.error("Simulation Pre-check Failed:", e);
            }

            try {
                await inngest.send({
                    name: "simulation/run.full",
                    data: config || {}
                });
                return NextResponse.json({ success: true, message: "Simulation job dispatched." });
            } catch (inngestError: any) {
                console.error("INNGEST SEND ERROR:", inngestError);
                return NextResponse.json({ error: "Failed to dispatch Inngest job: " + inngestError.message }, { status: 500 });
            }
        }

        if (action === "wipe") {
            await inngest.send({
                name: "simulation/wipe",
                data: {}
            });
            return NextResponse.json({ success: true, message: "Wipe job dispatched." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("SIMULATE ROUTE CRITICAL ERROR:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
