import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TrainingHubClient } from "./TrainingHubClient";

export const metadata = {
    title: 'Referral Training Hub | MatClick',
    description: 'Provide resources and duplicate your success with your team.',
};

export default async function TrainingHubPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    const currentUser = await db.select().from(users).where(eq(users.id, effectiveUserId)).limit(1).then(res => res[0]);

    if (!currentUser) return <div>User not found</div>;

    // We can simulate some stats or fetch them if we had a dedicated stats table.

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Training Hub</h1>
                <p className="text-[#737791]">Share strategies and help your referrals duplicate your success.</p>
            </div>

            <TrainingHubClient currentUser={currentUser} />
        </div>
    );
}
