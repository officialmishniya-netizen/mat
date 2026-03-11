import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { followUpRules } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const rules = await db
        .select()
        .from(followUpRules)
        .where(eq(followUpRules.userId, session.user.id))
        .orderBy(desc(followUpRules.createdAt));
        
    return NextResponse.json({ rules });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const body = await req.json();
        const { name, condition, actionType, templateId, delayDays, isActive } = body;
        
        if (!name || !condition || !actionType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const [newRule] = await db.insert(followUpRules).values({
            userId: session.user.id,
            name,
            triggerType: condition,
            actionType,
            templateBody: templateId || "Default message",
            delayHours: (delayDays || 1) * 24,
            isActive: isActive !== undefined ? isActive : true
        }).returning();
        
        return NextResponse.json({ success: true, rule: newRule });
        
    } catch (error: any) {
        console.error("Error creating follow-up rule:", error);
        return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }
}
