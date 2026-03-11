import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ReferralPageClient } from "./ReferralPageClient";

export const metadata = {
    title: 'My Referral Page | PTC Nexus',
    description: 'Customize your public referral landing page.',
};

export default async function ReferralPageSettings() {
    const effectiveUserId = await requireImpersonationOrAuth();

    const currentUser = await db.select().from(users).where(eq(users.id, effectiveUserId)).limit(1).then(res => res[0]);

    if (!currentUser) {
        return <div>User not found</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">My Referral Page</h1>
                <p className="text-[#737791]">Customize the landing page that visitors see when they click your tracking links.</p>
            </div>

            <ReferralPageClient currentUser={currentUser} />
        </div>
    );
}
