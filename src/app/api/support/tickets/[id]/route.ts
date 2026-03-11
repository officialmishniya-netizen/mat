import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createTicket } from "@/lib/tickets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { subject, content, priority } = await req.json();

        if (!subject || !content) {
            return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
        }

        const ticket = await createTicket(session.user.id, subject, content, priority);

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error("Error creating ticket:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
