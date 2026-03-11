import { createServerSupabaseClient } from "@/lib/supabase-server";
import { addTicketMessage } from "@/lib/tickets";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        await addTicketMessage(params.id, session.user.id, content, false);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error adding ticket message:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
