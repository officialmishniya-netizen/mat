import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { followUpRules } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { FollowUpsClient } from "./FollowUpsClient";

export const metadata = {
    title: 'Automated Follow-Ups | MatClick',
    description: 'Set up automated messages to guide your referrals.',
};

export default async function FollowUpsPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // Fetch existing rules
    const rules = await db
        .select()
        .from(followUpRules)
        .where(eq(followUpRules.userId, effectiveUserId))
        .orderBy(desc(followUpRules.createdAt));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Automated Follow-Ups</h1>
                <p className="text-[#737791]">Create rules to automatically message referrals based on their actions or inactivity.</p>
            </div>

            <FollowUpsClient initialRules={rules} />
        </div>
    );
}
