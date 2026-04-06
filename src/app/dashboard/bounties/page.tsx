import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { bounties, bountySubmissions } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Star, CheckCircle2, Clock } from "lucide-react";
import BountyCard from "./BountyCard";

export const metadata = {
    title: "Micro-Jobs & Bounties",
};

export default async function BountiesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    // Fetch Active Bounties
    const activeBounties = await db.select().from(bounties).where(eq(bounties.active, true)).orderBy(desc(bounties.createdAt));

    // Fetch User Submissions
    const userSubmissions = await db.select().from(bountySubmissions).where(eq(bountySubmissions.userId, effectiveUserId));

    // Map submissions by bountyId for easy checking
    const submissionMap = new Map();
    userSubmissions.forEach(sub => {
        submissionMap.set(sub.bountyId, sub);
    });

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">Micro-Jobs & Bounties</h1>
                <p className="text-[#737791] font-medium text-sm mt-1">Complete tasks to instantly receive ledger rewards!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBounties.map(bounty => {
                    const submission = submissionMap.get(bounty.id);
                    return <BountyCard key={bounty.id} bounty={bounty} submission={submission} />
                })}
            </div>

            {activeBounties.length === 0 && (
                <div className="text-center py-20">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">No active bounties right now</h3>
                </div>
            )}
        </div>
    );
}
