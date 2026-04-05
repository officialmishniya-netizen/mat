import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { getUserBalance, getPurchaseBalance, getTotalEarnings, getBonusTotals, getAdRewardTotal, getDailyEarnings } from "@/lib/ledger";
import { DashboardOverview } from "./DashboardOverview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Get exact balance
    const balance = await getUserBalance(effectiveUserId);
    const purchaseBalance = await getPurchaseBalance(effectiveUserId);
    const totalEarnings = await getTotalEarnings(effectiveUserId);
    const { referral: referralBonus, matching: matchingBonus } = await getBonusTotals(effectiveUserId);
    const adRewardTotal = await getAdRewardTotal(effectiveUserId);
    const dailyEarnings = await getDailyEarnings(effectiveUserId);

    // Get user profile for ad credits
    const { data: profile } = await supabase
        .from("users")
        .select("ad_credits, username")
        .eq("id", effectiveUserId)
        .single();

    // Get active matrix level count
    const { data: matrixSpots } = await supabase
        .from("user_levels")
        .select("level_id")
        .eq("user_id", effectiveUserId)
        .eq("active", true);

    // Get total matrix cycles (completed)
    const { count: matrixCycles } = await supabase
        .from("user_levels")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", effectiveUserId)
        .eq("active", false);

    // Get active ad cycle progress
    const { data: activeCycles } = await supabase
        .from("user_ad_levels")
        .select(`*, ad_levels(*)`)
        .eq("user_id", effectiveUserId)
        .eq("status", "active")
        .limit(1)
        .single();

    // Get total referrals
    const { data: referrals } = await supabase
        .from("users")
        .select("id")
        .eq("sponsor_id", effectiveUserId);

    // Fetch Recent Activity (Ledger)
    const { data: recentLedger } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false })
        .limit(10);

    // Fetch Community Pool Stats
    const { data: pools } = await supabase
        .from("community_pool")
        .select("total_locked")
        .eq("is_active", true);

    const totalPoolBalance = pools?.reduce((sum, p) => sum + parseFloat(p.total_locked || "0"), 0).toFixed(2) || "0.00";

    // Fetch Hall of Fame (Top 3 by cycles or rankings)
    const { data: topEarners } = await supabase
        .from("users")
        .select("username, ad_credits, rank")
        .order("ad_credits", { ascending: false })
        .limit(3);

    // Fetch Recent Shouts (Last 3)
    const { data: recentShouts } = await supabase
        .from("messages")
        .select("*, users(username)")
        .eq("channel_id", "public")
        .order("created_at", { ascending: false })
        .limit(3);

    const username = profile?.username || session.user.id;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const referralLink = `${baseUrl}/r/${username}`;

    return (
        <DashboardOverview
            balance={balance}
            purchaseBalance={purchaseBalance}
            totalEarnings={totalEarnings}
            referralBonus={referralBonus}
            matchingBonus={matchingBonus}
            adCredits={profile?.ad_credits || 0}
            matrixCount={matrixSpots?.length || 0}
            matrixCycles={matrixCycles || 0}
            referralCount={referrals?.length || 0}
            activeCycles={activeCycles}
            referralLink={referralLink}
            adRewardTotal={adRewardTotal}
            recentTransactions={recentLedger || []}
            communityPoolTotal={totalPoolBalance}
            topEarners={topEarners || []}
            recentShouts={recentShouts || []}
            dailyEarnings={dailyEarnings}
        />
    );
}
