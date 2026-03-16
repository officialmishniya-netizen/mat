import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, config } = body;

        if (action === "run") {
            await inngest.send({
                name: "simulation/run.full",
                data: config || {}
            });
            return NextResponse.json({ success: true, message: "Simulation job dispatched." });
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
