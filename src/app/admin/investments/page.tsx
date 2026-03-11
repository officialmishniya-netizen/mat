"use client";

import React, { useState } from 'react';
import { Layers, Plus, Settings2, Trash2, Edit3, TrendingUp, Users, Lock, PieChart, Save } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/context";

export default function AdminInvestmentsPage() {
    const { t } = useTranslation();
    const [pools, setPools] = useState([
        { id: '1', name: 'Stable Yield Alpha', roi: '8.5', duration: 30, risk: 'Low', activeUsers: 142, tvl: '$124,000' },
        { id: '2', name: 'Matrix Growth Beta', roi: '14.2', duration: 60, risk: 'Moderate', activeUsers: 89, tvl: '$208,000' },
        { id: '3', name: 'Aggressive Revenue Gamma', roi: '22.0', duration: 90, risk: 'High', activeUsers: 34, tvl: '$100,500' },
    ]);

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Investment Pool Manager</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure interest rates, pool durations, and risk profiles.</p>
                </div>
                <button className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all">
                    <Plus size={18} />
                    <span>Create New Pool</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                    <div key={pool.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-gray-50 rounded-2xl text-[#151d48]">
                                <Layers size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Edit3 size={16} /></button>
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-[#151d48] mb-1">{pool.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">{pool.risk} Risk Profile</p>

                        <div className="space-y-4 flex-1">
                            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl text-primary shadow-sm"><TrendingUp size={16} /></div>
                                    <span className="text-sm font-bold text-[#444a6d]">Fixed ROI</span>
                                </div>
                                <span className="text-xl font-black text-[#151d48]">{pool.roi}%</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Duration</p>
                                    <p className="font-black text-[#151d48]">{pool.duration} Days</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Participants</p>
                                    <p className="font-black text-[#151d48]">{pool.activeUsers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Value Locked</p>
                                <p className="text-lg font-black text-primary">{pool.tvl}</p>
                            </div>
                            <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <Settings2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#151d48] rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-4">Revenue Attribution</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-60">Matrix Spillover Fund</span>
                                <span className="font-bold text-primary">64%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[64%]"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm opacity-60">Ad Impression Arbitrage</span>
                                <span className="font-bold text-blue-400">28%</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-[28%]"></div>
                            </div>
                        </div>
                    </div>
                    <PieChart className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-10" size={180} />
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#151d48] mb-2">Global Liquidity Guard</h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                        Automated circuit breaker that pauses pool redemptions if cash-on-hand drops below 1.15x of 30-day maturing liability.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-gray-100 text-[#444a6d] px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all">Configure Threshold</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
