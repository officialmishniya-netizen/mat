import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bounties, bountySubmissions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminBountyClient from "./AdminBountyClient";

export const metadata = {
    title: "Micro-Jobs Management",
};

export default async function AdminBountiesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/admin/login');

    // Fetch Active Bounties
    const allBounties = await db.select().from(bounties).orderBy(desc(bounties.createdAt));

    // Fetch Pending Submissions
    const pendingSubmissions = await db.select({
        id: bountySubmissions.id,
        bountyId: bountySubmissions.bountyId,
        proofText: bountySubmissions.proofText,
        proofImage: bountySubmissions.proofImage,
        createdAt: bountySubmissions.createdAt,
        user: {
            id: users.id,
            username: users.username,
        },
        bountyTitle: bounties.title,
        rewardAmount: bounties.rewardAmount
    })
        .from(bountySubmissions)
        .innerJoin(users, eq(bountySubmissions.userId, users.id))
        .innerJoin(bounties, eq(bountySubmissions.bountyId, bounties.id))
        .where(eq(bountySubmissions.status, 'pending'))
        .orderBy(desc(bountySubmissions.createdAt));

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-[#151d48] tracking-tight">Micro-Jobs & Bounties</h1>
                <p className="text-gray-500 font-medium mt-1">Review user submissions and manage active tasks.</p>
            </div>
            <AdminBountyClient bounties={allBounties} pendingSubmissions={pendingSubmissions} />
        </div>
    );
}
