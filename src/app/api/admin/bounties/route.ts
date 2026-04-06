import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import { bounties, bountySubmissions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createLedgerEntry } from "@/lib/ledger";
import { toMoney } from "@/lib/money";

export async function POST(req: Request) {
    try {
        const { action, payload } = await req.json();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        // Verify Admin
        const user = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1);
        if (!user.length || user[0].role !== "admin") {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        if (action === "create_bounty") {
            const { title, description, rewardAmount, maxSubmissions } = payload;
            await db.insert(bounties).values({
                title,
                description,
                rewardAmount: toMoney(rewardAmount).toFixed(4),
                maxSubmissions: Number(maxSubmissions) || 100,
                active: true
            });
            return NextResponse.json({ success: true });
        }

        if (action === "review_submission") {
            const { submissionId, status } = payload; // status = 'approved' | 'rejected'

            const submission = await db.select().from(bountySubmissions).where(eq(bountySubmissions.id, submissionId)).limit(1);
            if (!submission.length) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

            if (submission[0].status !== 'pending') return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

            // Atomic transition
            await db.transaction(async (tx) => {
                await tx.update(bountySubmissions).set({
                    status,
                    reviewedAt: new Date()
                }).where(eq(bountySubmissions.id, submissionId));

                if (status === 'approved') {
                    const bounty = await tx.select().from(bounties).where(eq(bounties.id, submission[0].bountyId)).limit(1);
                    if (bounty.length) {
                        // Create ledger entry to pay the user
                        await createLedgerEntry(submission[0].userId, bounty[0].rewardAmount, "bounty_reward", `Bounty_${bounty[0].id}`);
                    }
                }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Admin Bounty Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
