import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { directMessages, users } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch all messages where user is sender or recipient
    // Including basic user info for sender/recipient
    const messages = await db
        .select({
            id: directMessages.id,
            content: directMessages.content,
            isRead: directMessages.isRead,
            createdAt: directMessages.createdAt,
            senderId: directMessages.senderId,
            recipientId: directMessages.recipientId,
            // Simple subqueries or joins could grab names, but for a quick implementation 
            // we will just pull the raw messages and group them on the client, 
            // or do a join here. Let's do a join to get sender/recipient usernames if needed,
            // but for simplicity, returning raw messages is step 1.
        })
        .from(directMessages)
        .where(
            or(
                eq(directMessages.senderId, userId),
                eq(directMessages.recipientId, userId)
            )
        )
        .orderBy(desc(directMessages.createdAt));
        
    return NextResponse.json({ messages });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const senderId = session.user.id;
    
    try {
        const body = await req.json();
        const { recipientId, content } = body;
        
        if (!recipientId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify hierarchy
        const isRelated = await db
            .select({ id: users.id })
            .from(users)
            .where(
                or(
                    and(eq(users.id, recipientId), eq(users.sponsor_id, senderId)),
                    and(eq(users.id, senderId), eq(users.sponsor_id, recipientId))
                )
            )
            .limit(1);

        if (isRelated.length === 0) {
            return NextResponse.json({ error: "Cannot message this user. Must be your sponsor or referral." }, { status: 403 });
        }
        
        const [newMessage] = await db.insert(directMessages).values({
            senderId,
            recipientId,
            content,
            isRead: false
        }).returning();
        
        return NextResponse.json({ success: true, message: newMessage });
        
    } catch (error: any) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
