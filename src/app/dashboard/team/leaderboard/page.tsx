import { requireImpersonationOrAuth } from "@/app/actions/impersonate";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { LeaderboardClient } from "./LeaderboardClient";

export const metadata = {
    title: 'Team Leaderboard | PTC Nexus',
    description: 'See the top referrers and earners in the PTC Nexus community.',
};

export default async function LeaderboardPage() {
    const effectiveUserId = await requireImpersonationOrAuth();

    // In a real app we'd do a proper GROUP BY. Drizzle ORM group_by is supported.
    // Let's execute a raw query or simple aggregation for top referrers
    
    // We'll just fetch all users for now and compute in memory since it's a demo, 
    // or use a simple query if we assume small dataset. 
    // For large scale, we should create a materialized view or perform an aggregated query:
    const allUsers = await db.select({
        id: users.id,
        username: users.username,
        sponsor_id: users.sponsor_id,
        rank: users.rank
    }).from(users);

    const referralCounts: Record<string, number> = {};
    allUsers.forEach(u => {
        if (u.sponsor_id) {
            referralCounts[u.sponsor_id] = (referralCounts[u.sponsor_id] || 0) + 1;
        }
    });

    const topReferrers = Object.entries(referralCounts)
        .map(([sponsorId, refCount]) => {
            const sponsor = allUsers.find(u => u.id === sponsorId);
            return {
                id: sponsorId,
                username: sponsor?.username || 'Unknown',
                referrals: refCount,
                rank: sponsor?.rank || 'Member',
                isCurrentUser: sponsorId === effectiveUserId
            };
        })
        .sort((a, b) => b.referrals - a.referrals)
        .slice(0, 50); // Top 50

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#151d48]">Global Leaderboard</h1>
                <p className="text-[#737791]">See who's building the biggest teams on PTC Nexus. Compete for the top spot!</p>
            </div>

            <LeaderboardClient initialLeaderboard={topReferrers} />
        </div>
    );
}
