import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { teamEmails } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { EmailComposerClient } from "./EmailComposerClient";

export const metadata = {
    title: 'Email My Team | PTC Nexus',
    description: 'Compose and send bulk emails to your referrals.',
};

export default async function EmailMyTeamPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // Fetch email history
    const history = await db
        .select()
        .from(teamEmails)
        .where(eq(teamEmails.senderId, effectiveUserId))
        .orderBy(desc(teamEmails.createdAt));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Email My Team</h1>
                <p className="text-[#737791]">Engage your downline with scheduled announcements and training.</p>
            </div>

            <EmailComposerClient initialHistory={history} />
        </div>
    );
}
