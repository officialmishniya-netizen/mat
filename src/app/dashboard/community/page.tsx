import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
    Award,
    TrendingUp,
    Users,
    Zap,
    Trophy,
    ArrowRight,
    Star,
    Crown,
    Medal
} from "lucide-react";
import Link from "next/link";

export default async function CommunityPage() {
    const supabase = await createServerSupabaseClient();

    // Mock data for top earners
    const topEarners = [
        { id: 1, name: "Jesse Thomas", username: "jesset", earnings: "12,450.00", growth: "+24%", rank: 1 },
        { id: 2, name: "Thisal Mathiya", username: "thisal_m", earnings: "9,120.50", growth: "+18%", rank: 2 },
        { id: 3, name: "Sarah Connor", username: "sarahc", earnings: "8,980.00", growth: "+15%", rank: 3 },
        { id: 4, name: "John Wick", username: "babayaga", earnings: "7,540.20", growth: "+12%", rank: 4 },
        { id: 5, name: "Ellen Ripley", username: "ripley", earnings: "6,210.00", growth: "+10%", rank: 5 },
    ];

    // Mock data for top recruiters
    const topRecruiters = [
        { id: 6, name: "Marcus Aurelius", username: "stoic", referrals: 450, rank: 1 },
        { id: 7, name: "Lucius Fox", username: "fox_tech", referrals: 380, rank: 2 },
        { id: 8, name: "Peter Parker", username: "spidey", referrals: 310, rank: 3 },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Hero Header */}
            <div className="relative bg-[#151d48] rounded-[3rem] p-12 overflow-hidden text-white shadow-2xl shadow-blue-900/40">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <Trophy size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/10 backdrop-blur-md">
                        <Star size={14} className="fill-current" />
                        <span>Global Rewards Program</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-4">Community Hall of Fame</h1>
                    <p className="text-xl text-blue-200 font-medium leading-relaxed">Recognizing our top performers and visionaries who are building the future of the ultimate matrix.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Earners Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                <Award size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-[#151d48]">Top Earners</h2>
                        </div>
                        <span className="text-xs font-black text-[#737791] uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">All-time</span>
                    </div>

                    <div className="space-y-4">
                        {topEarners.map((user) => (
                            <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group flex items-center justify-between relative overflow-hidden">
                                {user.rank === 1 && (
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                )}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner ${user.rank === 1 ? 'bg-gradient-to-br from-primary to-orange-600' :
                                                user.rank === 2 ? 'bg-gray-400' :
                                                    user.rank === 3 ? 'bg-orange-400' : 'bg-blue-900/20 text-blue-900'
                                            }`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {user.rank <= 3 && (
                                            <div className="absolute -top-3 -left-3">
                                                {user.rank === 1 && <Crown className="text-yellow-400 drop-shadow-md" size={32} />}
                                                {user.rank === 2 && <Medal className="text-gray-300 drop-shadow-md" size={28} />}
                                                {user.rank === 3 && <Medal className="text-orange-300 drop-shadow-md" size={28} />}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-[#151d48]">@{user.username}</h3>
                                        <p className="text-sm font-medium text-[#737791]">{user.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Earnings</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xl font-black text-green-600">${user.earnings}</span>
                                            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md font-black">{user.growth}</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                                        <TrendingUp size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats (Top Recruiters & Quick Stats) */}
                <div className="space-y-8">
                    {/* Top Recruiters Card */}
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-fit">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                <Users size={20} />
                            </div>
                            <h2 className="text-xl font-black text-[#151d48]">Top Recruiters</h2>
                        </div>

                        <div className="space-y-6">
                            {topRecruiters.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-[#151d48]">
                                            #{user.rank}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[#151d48]">@{user.username}</p>
                                            <p className="text-[10px] font-bold text-[#737791] uppercase tracking-wider">{user.referrals} Partners</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 scale-0 group-hover:scale-100 transition-transform">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 py-4 bg-[#151d48] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 hover:secondary transition-all">
                            View Full List
                        </button>
                    </div>

                    {/* Community Stats */}
                    <div className="bg-gradient-to-br from-primary to-orange-600 p-8 rounded-[3rem] text-white shadow-xl shadow-primary/30 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 p-6 opacity-10">
                            <Zap size={80} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight mb-6">Network Health</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Community Earnings</span>
                                    <span className="font-black">$2.4M</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full w-[85%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Matrix Cycles Completed</span>
                                    <span className="font-black">128,450</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full w-[72%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
