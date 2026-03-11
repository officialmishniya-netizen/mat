import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { DashboardNav } from "./DashboardNav";
import { TopBar } from "./TopBar";
import { getDailyAdViews, getUserAdLimit } from "@/lib/ads";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Get real authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    // 2. Check for impersonation to get effective target user
    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // 3. Fetch effective user profile
    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", effectiveUserId)
        .single();

    if (!user) {
        return <div>Profile error: Profile not found in database.</div>;
    }

    const isImpersonating = effectiveUserId !== session.user.id;

    // 4. Fetch additional data for TopBar
    const dailyViews = await getDailyAdViews(effectiveUserId);
    const dailyLimit = await getUserAdLimit(effectiveUserId);

    // 5. Fetch unread direct messages count
    const { count: unreadMessagesCount } = await supabase
        .from("direct_messages")
        .select("*", { count: 'exact', head: true })
        .eq("recipient_id", effectiveUserId)
        .eq("is_read", false);

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col md:flex-row">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden">
                <div className="flex flex-col h-full pt-5">
                    <div className="flex items-center flex-shrink-0 px-8 mb-6">
                        <Link href="/dashboard" className="block w-full">
                            <img src="/logo.PNG" alt="Logo" className="h-10 w-auto object-contain" />
                        </Link>
                    </div>

                    <div className="px-6 mb-6 shrink-0">
                        <div className="p-5 bg-[#151d48] rounded-[2.5rem] shadow-xl shadow-blue-900/20 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform">
                                <div className="w-12 h-12 bg-white rounded-full"></div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Active Account</p>
                            <h2 className="font-black text-lg truncate">@{user.username}</h2>
                            <p className="text-[10px] font-bold text-blue-300 uppercase mt-2 bg-white/10 inline-block px-2 py-0.5 rounded-lg border border-white/10">{user.role}</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <DashboardNav userRole={user.role} unreadMessagesCount={unreadMessagesCount || 0} />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Warning Banner for Impersonation */}
                {isImpersonating && (
                    <div className="bg-red-600 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest flex justify-center items-center space-x-4 z-50">
                        <span>âš ï¸ Impersonating {user.username}</span>
                        <form action={async () => { "use server"; const { stopImpersonation } = await import("@/app/actions/impersonate"); await stopImpersonation(); }}>
                            <button className="bg-white text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-100 font-bold transition-colors">Stop</button>
                        </form>
                    </div>
                )}

                <TopBar user={user} dailyViews={dailyViews} dailyLimit={dailyLimit} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none custom-scrollbar">
                    <div className="py-6 px-4 sm:px-6 lg:px-10">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    );
}
