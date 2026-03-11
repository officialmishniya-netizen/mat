import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import { trackingLinks, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const links = await db
        .select()
        .from(trackingLinks)
        .where(eq(trackingLinks.userId, session.user.id))
        .orderBy(desc(trackingLinks.createdAt));
        
    return NextResponse.json({ links });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    try {
        const body = await req.json();
        const { name } = body;
        
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        
        // Fetch user data to build generic destination url if needed
        const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1).then(res => res[0]);
        
        // Generate a random slug
        const randomString = Math.random().toString(36).substring(2, 8);
        const slug = `${user.username}-${randomString}`;
        
        // By default, let's track clicks to /ref/[username], but the actual link is /t/[slug]
        const destinationUrl = `/ref/${user.username}`;
        
        const [newLink] = await db.insert(trackingLinks).values({
            userId: session.user.id,
            name,
            slug,
            destinationUrl,
            clicks: 0
        }).returning();
        
        return NextResponse.json({ success: true, link: newLink });
        
    } catch (error: any) {
        console.error("Error creating tracking link:", error);
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }
}
