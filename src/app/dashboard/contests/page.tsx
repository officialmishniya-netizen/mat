"use client";

import React from 'react';
import { Trophy, Timer, Users, Crown, Medal, TrendingUp, Info } from 'lucide-react';

export default function ReferralContestsPage() {
    const leaderboard = [
        { rank: 1, user: 'ahmad_khan', referrals: 42, prize: '$1,000' },
        { rank: 2, user: 'crypto_king', referrals: 38, prize: '$500' },
        { rank: 3, user: 'matrix_alpha', referrals: 35, prize: '$250' },
        { rank: 4, user: 'john_doe', referrals: 24, prize: '$100' },
        { rank: 5, user: 'trader_pro', referrals: 19, prize: '$50' },
    ];

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#151d48] to-[#2a3c8a] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Trophy className="text-primary" size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Spring Recruitment Sprint</span>
                    </div>
                    <h1 className="text-4xl font-black mb-2">Total Prize Pool: <span className="text-primary">$2,500.00</span></h1>
                    <p className="text-sm opacity-60 max-w-md">Top 10 referrers this month share the bounty. Get ahead of the pack!</p>
                </div>
                <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Time Left</p>
                        <div className="flex items-center gap-2">
                            <Timer size={18} className="text-primary" />
                            <span className="text-2xl font-black">12d 04h</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        Join Now
                    </button>
                </div>
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <Trophy size={200} className="absolute -bottom-12 -right-12 text-white/5 opacity-10 rotate-12" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((player, i) => (
                    <div key={player.rank} className={`bg-white rounded-[2rem] p-8 shadow-sm border-2 flex flex-col items-center text-center relative ${player.rank === 1 ? 'border-primary ring-8 ring-primary/5 scale-105 z-10' : 'border-gray-50'}`}>
                        {player.rank === 1 && <Crown size={40} className="text-[#FFD700] absolute -top-6 drop-shadow-lg" />}
                        <div className="w-20 h-20 bg-gray-50 rounded-full mb-4 flex items-center justify-center border-4 border-white shadow-inner">
                            <Users size={32} className="text-gray-300" />
                        </div>
                        <h3 className="font-bold text-[#151d48] text-lg mb-1">@{player.user}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{player.referrals} Direct Referrals</p>
                        <div className="bg-primary text-white w-full py-3 rounded-2xl font-black text-xl shadow-lg shadow-primary/10">
                            {player.prize}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#151d48]">Global Leaderboard</h3>
                    <div className="flex items-center gap-2 text-sm text-primary font-bold">
                        <TrendingUp size={18} />
                        <span>Live Updates</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="space-y-2">
                        {leaderboard.map((row) => (
                            <div key={row.rank} className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${row.rank === 1 ? 'bg-primary text-white' : row.rank === 2 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                                        #{row.rank}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                                        <span className="font-bold text-[#151d48]">@{row.user}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-16 text-right">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Referrals</p>
                                        <p className="font-black text-[#444a6d]">{row.referrals}</p>
                                    </div>
                                    <div className="w-24">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Est. Prize</p>
                                        <p className="font-black text-primary">{row.prize}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex items-start gap-4">
                <Info size={24} className="text-[#151d48] shrink-0" />
                <div>
                    <h4 className="font-bold text-[#151d48]">Rules & Eligibility</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mt-1">
                        Only direct referrals who have activated at least one Ad Cycle level are counted. Self-referrals will lead to instant disqualification and wallet suspension. Winners are paid within 24 hours of contest end.
                    </p>
                </div>
            </div>
        </div>
    );
}
