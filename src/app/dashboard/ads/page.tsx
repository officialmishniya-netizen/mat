import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { MousePointerClick } from "lucide-react";
import AdClickViewer from "./AdClickViewer";
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

    // 2. Fetch Settings
    const { data: settings } = await supabase.from('settings').select('*').single();

    if (settings && settings.ptc_enabled === false) {
        return (
            <div className="p-6 h-[80vh] flex items-center justify-center">
                <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-blue-100 text-center max-w-xl space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-500">
                        <MousePointerClick size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-[#151d48]">PTC Module Temporarily Offline</h2>
                    <p className="text-gray-500 font-bold leading-relaxed">
                        The Paid-To-Click system is currently undergoing scheduled maintenance or the launch counter has not yet concluded. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    // 3. Filter out ads the user has watched recently (within cooldown)
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

    return <AdClickViewer ads={availableAds as any} />;
}
