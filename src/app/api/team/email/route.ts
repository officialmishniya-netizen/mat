import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { teamEmails, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Fetch email history for this user
    const emails = await db
        .select()
        .from(teamEmails)
        .where(eq(teamEmails.senderId, session.user.id))
        .orderBy(desc(teamEmails.createdAt));
        
    return NextResponse.json({ emails });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const body = await req.json();
        const { subject, body: emailBody, recipientFilter, scheduledAt } = body;
        
        if (!subject || !emailBody) {
            return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
        }
        
        // Example logic:
        // In a real system, if scheduledAt is far in the future, we set status='scheduled'
        // If it's now, we send it (e.g., via SendGrid/Resend) and set status='sent'.
        // For this demo, we just record it in the database.
        
        const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
        const status = isScheduled ? 'scheduled' : 'sent';
        
        const [newEmail] = await db.insert(teamEmails).values({
            senderId: session.user.id,
            subject,
            body: emailBody,
            recipientFilter: recipientFilter || 'all',
            status,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            sentAt: isScheduled ? null : new Date()
        }).returning();
        
        return NextResponse.json({ success: true, email: newEmail });
        
    } catch (error: any) {
        console.error("Error saving team email:", error);
        return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
    }
}
