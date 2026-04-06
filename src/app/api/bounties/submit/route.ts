import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { bounties, bountySubmissions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const { bountyId, proofText, proofImage } = await req.json();

        if (!bountyId || !proofText) {
            return NextResponse.json({ error: "Bounty ID and Proof description are required." }, { status: 400 });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const impersonateCookie = cookies().get("impersonated_user_id");
        const effectiveUserId = impersonateCookie?.value || session.user.id;

        // 1. Validate Bounty exists and is active
        const config = await db.select().from(bounties).where(eq(bounties.id, bountyId)).limit(1);

        if (config.length === 0 || !config[0].active) {
            return NextResponse.json({ error: "This bounty is inactive or does not exist." }, { status: 404 });
        }

        // 2. Prevent duplicate pending submissions
        const existing = await db.select()
            .from(bountySubmissions)
            .where(
                and(
                    eq(bountySubmissions.bountyId, bountyId),
                    eq(bountySubmissions.userId, effectiveUserId)
                )
            )
            .limit(1);

        if (existing.length > 0 && existing[0].status === 'pending') {
            return NextResponse.json({ error: "You already have a pending submission for this bounty. Please wait for admin review." }, { status: 400 });
        }

        // 3. Insert Submission
        await db.insert(bountySubmissions).values({
            bountyId,
            userId: effectiveUserId,
            proofText,
            proofImage: proofImage || null,
            status: "pending"
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Bounty Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
