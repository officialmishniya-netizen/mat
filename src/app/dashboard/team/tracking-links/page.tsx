import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { trackingLinks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { TrackingLinksClient } from "./TrackingLinksClient";

export const metadata = {
    title: 'Tracking Links | PTC Nexus',
    description: 'Generate and track affiliate links for your marketing campaigns.',
};

export default async function TrackingLinksPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // Fetch tracking links
    const links = await db
        .select()
        .from(trackingLinks)
        .where(eq(trackingLinks.userId, effectiveUserId))
        .orderBy(desc(trackingLinks.createdAt));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Tracking Links</h1>
                <p className="text-[#737791]">Generate unique links for different campaigns and track their performance.</p>
            </div>

            <TrackingLinksClient initialLinks={links} />
        </div>
    );
}
