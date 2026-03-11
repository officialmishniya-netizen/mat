import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users, trackingLinks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Send, ExternalLink, Activity, ArrowRight, Zap, Megaphone } from "lucide-react";
import Link from "next/link";
import { InviteTableClient } from "./InviteTableClient";

export const metadata = {
    title: 'Invite Manager | PTC Nexus',
    description: 'Track your funnel and manage recent signups.',
};

export default async function InviteManagerPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // Fetch tracking links to calculate total clicks (Top of Funnel)
    const links = await db.select().from(trackingLinks).where(eq(trackingLinks.userId, effectiveUserId));
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0) || 0; // fallback 0

    // Fetch total referrals (Middle of Funnel)
    const referrals = await db
        .select({
            id: users.id,
            username: users.username,
            fullName: users.full_name,
            email: users.email,
            rank: users.rank,
            createdAt: users.created_at,
        })
        .from(users)
        .where(eq(users.sponsor_id, effectiveUserId))
        .orderBy(desc(users.createdAt));
        
    const totalSignups = referrals.length;

    // Active Members (Bottom of Funnel)
    const activeSignups = referrals.filter(r => r.rank === 'Active Member' || r.rank === 'Leader').length;

    // Calculate conversions
    const signupConversion = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : "0.0";
    const activeConversion = totalSignups > 0 ? ((activeSignups / totalSignups) * 100).toFixed(1) : "0.0";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Invite Manager</h1>
                    <p className="text-[#737791]">Track your promotion funnel and follow up with leads.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/team/tracking-links">
                        <Button variant="outline" className="rounded-xl border-gray-200">
                            <Plus className="w-4 h-4 mr-2" />
                            New Tracking Link
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Funnel Visualization */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-[#151d48] mb-6">Your Promotion Funnel</h3>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    
                    {/* Stage 1: Clicks */}
                    <div className="flex-1 flex flex-col items-center text-center w-full relative">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-3 shadow-md shadow-blue-900/5 border-4 border-white z-10 relative">
                            <ExternalLink className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Total Clicks</h4>
                        <p className="text-2xl font-black text-blue-600 my-1">{totalClicks}</p>
                        <p className="text-xs text-gray-500">From all tracking links</p>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden md:flex flex-col items-center justify-center px-4 w-32 shrink-0">
                        <div className="text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg mb-2">
                            {signupConversion}% Convert
                        </div>
                        <div className="w-full h-1 bg-gray-100 relative rounded-full">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                        </div>
                    </div>

                    {/* Stage 2: Signups */}
                    <div className="flex-1 flex flex-col items-center text-center w-full relative">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-3 shadow-md shadow-orange-900/5 border-4 border-white z-10 relative">
                            <Megaphone className="w-8 h-8 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Free Signups</h4>
                        <p className="text-2xl font-black text-orange-600 my-1">{totalSignups}</p>
                        <p className="text-xs text-gray-500">Total referrals recorded</p>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden md:flex flex-col items-center justify-center px-4 w-32 shrink-0">
                        <div className="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg mb-2">
                            {activeConversion}% Upgrade
                        </div>
                        <div className="w-full h-1 bg-gray-100 relative rounded-full">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                        </div>
                    </div>

                    {/* Stage 3: Active */}
                    <div className="flex-1 flex flex-col items-center text-center w-full relative">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-3 shadow-md shadow-green-900/5 border-4 border-white z-10 relative">
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-800">Active Members</h4>
                        <p className="text-2xl font-black text-green-600 my-1">{activeSignups}</p>
                        <p className="text-xs text-gray-500">Purchased level or ad pack</p>
                    </div>

                </div>
            </div>

            {/* Invite Table with Follow-up actions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-black text-[#151d48]">Recent Signups & Follow-ups</h3>
                    <p className="text-sm text-gray-500">Engage with your new referrals to help them get started.</p>
                </div>
                
                <InviteTableClient referrals={referrals} />

            </div>
        </div>
    );
}
