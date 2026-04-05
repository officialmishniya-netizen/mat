"use client";

import React from 'react';
import { Award, Star, Zap, ShieldCheck, Target, Lock, Crown, CheckCircle2, MousePointer2 } from 'lucide-react';

export default function AchievementsPage() {
    const badges = [
        { id: 1, name: 'First Click', description: 'Watch your first MatClick ad cycle.', status: 'earned', icon: MousePointer2, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 2, name: 'Matrix pioneer', description: 'Enter the Phase 1 Matrix.', status: 'earned', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
        { id: 3, name: 'Team Builder', description: 'Refer 5 active users.', status: 'in-progress', progress: 80, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 4, name: 'Diamond Earner', description: 'Earn $1,000 from cycles.', status: 'locked', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Badges & Achievements</h1>
                    <p className="text-gray-500 text-sm mt-1">Unlock rewards and premium status by hitting platform milestones.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Rank</p>
                        <p className="text-xl font-black text-[#151d48]">#1,240</p>
                    </div>
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Award size={24} />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {badges.map((badge) => (
                    <div key={badge.id} className={`group bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative transition-all hover:shadow-xl ${badge.status === 'locked' ? 'opacity-60 grayscale' : ''}`}>
                        <div className={`w-20 h-20 rounded-3xl ${badge.bg} ${badge.color} mb-6 flex items-center justify-center relative overflow-hidden`}>
                            {badge.status === 'earned' && (
                                <div className="absolute top-0 right-0 p-1.5 bg-green-500 text-white rounded-bl-xl shadow-lg animate-in zoom-in duration-500">
                                    <CheckCircle2 size={12} />
                                </div>
                            )}
                            <badge.icon size={32} />
                        </div>

                        <h3 className="font-bold text-[#151d48] mb-2">{badge.name}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6">{badge.description}</p>

                        {badge.status === 'in-progress' && (
                            <div className="w-full space-y-2 mb-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#737791]">
                                    <span>Progress</span>
                                    <span>{badge.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${badge.progress}%` }} />
                                </div>
                            </div>
                        )}

                        {badge.status === 'locked' ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400">
                                <Lock size={12} />
                                <span>Locked</span>
                            </div>
                        ) : badge.status === 'earned' ? (
                            <span className="text-[10px] font-black uppercase text-green-500">Completed</span>
                        ) : (
                            <span className="text-[10px] font-black uppercase text-primary">In Progress</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-[#151d48] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-32 h-32 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shrink-0">
                        <Target size={64} className="text-primary animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black">Upgrade to <span className="text-primary">VIP Status</span></h2>
                        <p className="text-gray-400 max-w-xl leading-relaxed">
                            Complete all "Team Builder" milestones to unlock the VIP status. VIP members get 5% reduced withdrawal fees and exclusive high-yield investment pools.
                        </p>
                        <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            View All VIP Perks
                        </button>
                    </div>
                </div>
                <Award size={300} className="absolute -bottom-24 -right-24 text-white/5 opacity-10 rotate-12" />
            </div>
        </div>
    );
}
