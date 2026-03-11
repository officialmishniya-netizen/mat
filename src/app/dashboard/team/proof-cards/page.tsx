import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users, ledger } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProofCardsClient } from "./ProofCardsClient";

export const metadata = {
    title: 'Earning Proof Cards | PTC Nexus',
    description: 'Generate shareable images to show off your earnings and invite others.',
};

export default async function ProofCardsPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    const currentUser = await db.select().from(users).where(eq(users.id, effectiveUserId)).limit(1).then(res => res[0]);

    if (!currentUser) {
        return <div>User not found</div>;
    }

    // Get total earned
    const earnings = await db
        .select({ amount: ledger.amount })
        .from(ledger)
        .where(eq(ledger.user_id, effectiveUserId));
        
    const totalEarned = earnings.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Earning Proof Cards</h1>
                <p className="text-[#737791]">Generate beautiful, shareable images of your progress to attract new referrals on social media.</p>
            </div>

            <ProofCardsClient currentUser={currentUser} totalEarned={totalEarned} />
        </div>
    );
}
