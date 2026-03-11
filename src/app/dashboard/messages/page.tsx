import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import GroupChat from "./GroupChat";
import { redirect } from "next/navigation";

export default async function MessagingPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // In a full app, this would query a dedicated `direct_messages` table.
    // For this delivery, we provide the UI structure to interact with Sponsors and Downlines.

    // Get Sponsor
    const { data: currentUser } = await supabase.from("users").select("sponsor_id, username").eq("id", effectiveUserId).single();
    let sponsor: any = null;
    if (currentUser?.sponsor_id) {
        const { data } = await supabase.from("users").select("id, username").eq("id", currentUser.sponsor_id).single();
        sponsor = data;
    }

    // Define Team Channel (Either user is leader, or user belongs to sponsor's team)
    const teamChannelId = sponsor ? `team-${sponsor.id}` : `team-${effectiveUserId}`;
    const teamChannelName = sponsor ? `Team ${sponsor.username}` : `Team ${currentUser?.username || 'Yours'}`;

    // Get Downlines
    const { data: downlines } = await supabase.from("users").select("id, username").eq("sponsor_id", effectiveUserId);

    return (
        <div className="space-y-8 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4 shrink-0">Direct Messages</h1>

            <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-lg flex overflow-hidden">

                {/* Contacts Sidebar */}
                <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                    <div className="p-4 border-b font-bold text-gray-700 bg-white shadow-sm">Your Network</div>
                    <div className="flex-1 overflow-y-auto">

                        {/* Sponsor */}
                        <div className="p-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">Upline (Sponsor)</h3>
                            {sponsor ? (
                                <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-orange-100 focus:bg-orange-100 transition-colors">
                                    <span className="font-bold text-primary">@{sponsor.username}</span>
                                </button>
                            ) : (
                                <div className="px-3 py-2 text-sm text-gray-400">No sponsor.</div>
                            )}
                        </div>

                        {/* Downlines */}
                        <div className="p-2 border-t mt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-2">Direct Downlines ({downlines?.length || 0})</h3>
                            <div className="space-y-1">
                                {downlines?.map(d => (
                                    <button key={d.id} className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-200 focus:bg-gray-200 transition-colors">
                                        <span className="font-medium text-gray-800">@{d.username}</span>
                                    </button>
                                ))}
                                {(!downlines || downlines.length === 0) && (
                                    <div className="px-3 py-2 text-sm text-gray-400">Share your referral link to build your team.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-2/3 flex flex-col bg-white">
                    <GroupChat currentUserId={effectiveUserId} channelId={teamChannelId} channelName={teamChannelName} />
                </div>

            </div>
        </div>
    );
}
