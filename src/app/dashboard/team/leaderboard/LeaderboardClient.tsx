"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Copy, Trophy, Medal, Star, Target, Crown } from "lucide-react";

export function LeaderboardClient({ initialLeaderboard }: { initialLeaderboard: any[] }) {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        // Trigger entrance animations
        setTimeout(() => setAnimated(true), 100);
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-8 h-8 text-yellow-500 drop-shadow-md" />;
            case 1: return <Medal className="w-7 h-7 text-gray-400 drop-shadow-md" />;
            case 2: return <Medal className="w-7 h-7 text-amber-700 drop-shadow-md" />;
            default: return <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">{index + 1}</div>;
        }
    };

    const getRowStyle = (index: number, isCurrentUser: boolean) => {
        let base = `relative bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-500 ${animated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;
        
        if (isCurrentUser) {
            base += " border-2 border-orange-500 shadow-lg shadow-orange-500/10 z-10 scale-[1.02] bg-gradient-to-r from-orange-50 to-white";
        } else if (index === 0) {
            base += " border border-yellow-200 shadow-xl shadow-yellow-500/10 bg-gradient-to-r from-yellow-50 to-white";
        } else {
            base += " border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md";
        }

        return base;
    };

    // Make sure we have at least an empty state if no one has referrals
    if (initialLeaderboard.length === 0) {
        return (
            <Card className="rounded-3xl border-none shadow-sm bg-white p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-black text-[#151d48]">No Leaders Yet</h2>
                <p className="text-gray-500 mt-2">Be the first to invite someone and claim the top spot!</p>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Top 3 Podium (Desktop layout, simplified for mobile) */}
            <div className="hidden md:flex items-end justify-center gap-4 mb-12 h-64 pt-10">
                
                {/* 2nd Place */}
                {initialLeaderboard[1] && (
                    <div className="w-1/3 flex flex-col items-center relative animate-[fade-in-up_0.5s_ease-out_0.2s_both]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-200 to-gray-400 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg border-4 border-white z-10">
                            {initialLeaderboard[1].username.charAt(0).toUpperCase()}
                        </div>
                        <div className="w-full bg-gradient-to-t from-gray-100 to-gray-50 rounded-t-3xl pt-8 pb-4 px-4 text-center border border-b-0 border-gray-200 shadow-inner h-32 relative">
                            <h3 className="font-bold text-[#151d48] truncate">{initialLeaderboard[1].username}</h3>
                            <p className="text-2xl font-black text-gray-500">{initialLeaderboard[1].referrals}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Referrals</p>
                            <span className="absolute -top-4 right-2 text-3xl">ðŸ¥ˆ</span>
                        </div>
                    </div>
                )}
                
                {/* 1st Place */}
                {initialLeaderboard[0] && (
                    <div className="w-1/3 flex flex-col items-center relative z-20 animate-[fade-in-up_0.5s_ease-out_both] -mt-8">
                        <Crown className="w-10 h-10 text-yellow-500 absolute -top-10 animate-[bounce_2s_infinite]" />
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-black text-3xl mb-4 shadow-xl shadow-yellow-500/30 border-4 border-white z-10">
                            {initialLeaderboard[0].username.charAt(0).toUpperCase()}
                        </div>
                        <div className="w-full bg-gradient-to-t from-yellow-100 to-yellow-50 rounded-t-3xl pt-8 pb-6 px-4 text-center border border-b-0 border-yellow-200 shadow-inner h-40 relative">
                            <h3 className="font-black text-[#151d48] text-lg truncate">{initialLeaderboard[0].username}</h3>
                            <p className="text-3xl font-black text-yellow-600">{initialLeaderboard[0].referrals}</p>
                            <p className="text-xs uppercase tracking-widest font-bold text-yellow-700/60">Referrals</p>
                            <span className="absolute -top-4 right-2 text-3xl">ðŸ¥‡</span>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {initialLeaderboard[2] && (
                    <div className="w-1/3 flex flex-col items-center relative animate-[fade-in-up_0.5s_ease-out_0.4s_both]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg border-4 border-white z-10">
                            {initialLeaderboard[2].username.charAt(0).toUpperCase()}
                        </div>
                        <div className="w-full bg-gradient-to-t from-amber-100/50 to-orange-50/30 rounded-t-3xl pt-8 pb-4 px-4 text-center border border-b-0 border-amber-200/50 shadow-inner h-28 relative">
                            <h3 className="font-bold text-[#151d48] truncate">{initialLeaderboard[2].username}</h3>
                            <p className="text-2xl font-black text-amber-700">{initialLeaderboard[2].referrals}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700/60">Referrals</p>
                            <span className="absolute -top-4 right-2 text-3xl">ðŸ¥‰</span>
                        </div>
                    </div>
                )}
            </div>

            {/* List View */}
            <div className="space-y-3">
                {initialLeaderboard.map((user, idx) => (
                    <div 
                        key={user.id} 
                        className={getRowStyle(idx, user.isCurrentUser)}
                        style={{ transitionDelay: `${Math.min(idx * 50, 500)}ms` }}
                    >
                        {/* Rank */}
                        <div className="w-12 flex justify-center shrink-0">
                            {getRankIcon(idx)}
                        </div>

                        {/* Avatar & Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-900 font-black shrink-0 border border-white shadow-sm">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                                <h4 className="font-bold text-[#151d48] truncate flex items-center gap-2">
                                    {user.username}
                                    {user.isCurrentUser && <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] rounded-md font-black uppercase tracking-widest shrink-0">You</span>}
                                </h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{user.rank}</p>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="text-right shrink-0">
                            <p className="text-xl sm:text-2xl font-black text-[#151d48] leading-none">{user.referrals}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Referrals</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

// Add these custom animations to tailwind config or global css in a real app
// For this client component we can just inject a style tag if needed, but Tailwind 
// arbitrary values or standard classes might not cover custom keyframes easily without config.
// We'll rely on basic Tailwind transitions (translate-y, opacity) defined in `getRowStyle`.
