import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { spinWheelConfigs, spinWheelSlices, userAdPositions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { SpinWheelClient } from "./SpinWheelClient";
import { Sparkles, Trophy, Zap, Info } from "lucide-react";

export const metadata = {
    title: "Rewards Spin Wheel | PTC Nexus"
};

export default async function SpinWheelPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const userId = await getEffectiveUserId(session.user.id);

    // 1. Fetch Active Config & Slices
    const config = await db.query.spinWheelConfigs.findFirst({
        where: eq(spinWheelConfigs.isActive, true)
    });

    if (!config) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <Zap size={48} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Wheel Maintenance</h1>
                    <p className="text-gray-500 font-medium">The rewards wheel is currently being reloaded. Check back soon!</p>
                </div>
            </div>
        );
    }

    const slices = (await db.query.spinWheelSlices.findMany({
        where: eq(spinWheelSlices.configId, config.id)
    })).sort((a, b) => a.id.localeCompare(b.id));

    // 2. Get User Stats (Free Spins)
    const userPos = await db.query.userAdPositions.findFirst({
        where: and(eq(userAdPositions.userId, userId), eq(userAdPositions.status, 'active'))
    });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-[#151d48] tracking-tighter flex items-center gap-3">
                        Rewards Wheel <Sparkles className="text-primary animate-pulse" />
                    </h1>
                    <p className="text-[#737791] font-black text-sm mt-2 uppercase tracking-[0.2em]">Test your luck for ultimate multipliers</p>
                </div>

                <div className="bg-[#151d48] text-white px-8 py-4 rounded-[2rem] shadow-xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Free Spins Available</p>
                        <p className="text-lg font-black tracking-tight">{userPos?.spinWheelAvailable ? "1 READY" : "0 (Earned Daily)"}</p>
                    </div>
                </div>
            </div>

            {/* Main Content: The Wheel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <SpinWheelClient
                        config={config}
                        slices={slices}
                        userId={userId}
                    />
                </div>

                {/* Sidebar: Info & Prizes */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#151d48] rounded-[3rem] p-8 text-white">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Info size={20} className="text-blue-400" /> How to Play
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs">1</div>
                                <p className="text-blue-100 text-sm font-medium">Earn 1 <span className="text-white font-bold">Free Spin</span> every time you complete your daily ad goal.</p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs">2</div>
                                <p className="text-blue-100 text-sm font-medium">Extra spins can be purchased for <span className="text-white font-bold">${parseFloat(config.basePrice || "2.50").toFixed(2)}</span> per spin.</p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-black text-xs">3</div>
                                <p className="text-blue-100 text-sm font-medium">Spin to win <span className="text-white font-bold">Cash</span>, <span className="text-white font-bold">AP</span>, or <span className="text-white font-bold">Cycle Multipliers</span>.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex-1">
                        <h4 className="text-lg font-black text-[#151d48] mb-6 tracking-tight">Slice Probabilities</h4>
                        <div className="space-y-3">
                            {slices.sort((a, b) => (b.weight || 0) - (a.weight || 0)).map((slice) => (
                                <div key={slice.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.colorHex || '#primary' }}></div>
                                        <span className="text-sm font-bold text-[#151d48]">{slice.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {Math.round((slice.weight || 100) / slices.reduce((s, x) => s + (x.weight || 100), 0) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
