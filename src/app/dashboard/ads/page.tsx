import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import PTCViewer from "./PTCViewer";
import { redirect } from "next/navigation";

export default async function UserAdsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // 1. Fetch Ads that are active
    const { data: ads } = await supabase
        .from("ads")
        .select("*")
        .eq("active", true);

    if (!ads) return <div className="p-8 text-center">Error loading ads.</div>;

    // 2. Filter out ads the user has watched recently (within cooldown)
    const availableAds: any[] = [];

    for (const ad of ads) {
        const { data: recentViews } = await supabase
            .from("ad_views")
            .select("completed_at")
            .eq("user_id", effectiveUserId)
            .eq("ad_id", ad.id)
            .order("completed_at", { ascending: false })
            .limit(1);

        const lastView = recentViews && recentViews.length > 0 ? new Date(recentViews[0].completed_at) : null;
        const now = new Date();

        if (!lastView) {
            availableAds.push(ad);
        } else {
            const secondsSinceLastView = (now.getTime() - lastView.getTime()) / 1000;
            if (secondsSinceLastView >= ad.cooldown) {
                availableAds.push(ad);
            }
        }
    }

    return <PTCViewer ads={availableAds as any} />;
}
