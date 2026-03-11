"use client";

import React, { useState } from 'react';
import { Zap, ShieldCheck, Timer, TrendingUp, Info, ChevronRight, PieChart, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/context";
import { investInPool } from "@/app/actions/finance";

export default function InvestmentPoolsPage() {
    const { t } = useTranslation();
    const [selectedPool, setSelectedPool] = useState<string | null>(null);
    const [isParticipating, setIsParticipating] = useState(false);
    const [success, setSuccess] = useState(false);

    const pools = [
        {
            id: 'pool_stable_v1',
            name: 'Stable Yield Alpha',
            roi: '8.5%',
            duration: '30 Days',
            minInvest: '$10.00',
            risk: 'Low',
            description: 'Capital-protected pool focused on low-volatility ad cycle arbitrage.',
            color: 'bg-green-50 text-green-700 border-green-200'
        },
        {
            id: 'pool_growth_v1',
            name: 'Matrix Growth Beta',
            roi: '14.2%',
            duration: '60 Days',
            minInvest: '$50.00',
            risk: 'Moderate',
            description: 'Participate in the global matrix cycle overflow fund for higher returns.',
            color: 'bg-blue-50 text-blue-700 border-blue-200'
        },
        {
            id: 'pool_aggro_v1',
            name: 'Aggressive Revenue Gamma',
            roi: '22.0%',
            duration: '90 Days',
            minInvest: '$100.00',
            risk: 'High',
            description: 'High-risk, high-reward fund leveraging platform advertising growth.',
            color: 'bg-purple-50 text-purple-700 border-purple-200'
        }
    ];

    const handleParticipate = async (pool: any) => {
        setIsParticipating(true);
        try {
            const amount = pool.minInvest.replace('$', '');
            await investInPool(pool.id, amount);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedPool(null);
            }, 3000);
        } catch (err: any) {
            alert(err.message || "Failed to participate");
        } finally {
            setIsParticipating(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Micro-Invest Pools</h1>
                    <p className="text-gray-500 text-sm mt-1">Lock your idle balance into managed pools for passive ROI.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <PieChart size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">My Portfolio</p>
                        <p className="text-sm font-black">$0.00</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                    <div
                        key={pool.id}
                        onClick={() => setSelectedPool(pool.id)}
                        className={`group bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02] ${selectedPool === pool.id ? 'border-primary ring-4 ring-primary/5' : 'border-gray-50'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pool.color}`}>
                                {pool.risk} Risk
                            </div>
                            <Zap className={selectedPool === pool.id ? 'text-primary' : 'text-gray-300 group-hover:text-primary transition-colors'} size={20} />
                        </div>

                        <h3 className="text-lg font-black text-[#151d48] mb-1">{pool.name}</h3>
                        <div className="flex items-baseline space-x-2 mb-4">
                            <span className="text-3xl font-black text-primary">{pool.roi}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">Fixed ROI</span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed mb-6">
                            {pool.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 text-xs">
                            <div>
                                <p className="text-gray-400 font-bold uppercase tracking-tight mb-1">Duration</p>
                                <div className="flex items-center text-[#444a6d] font-black">
                                    <Timer size={14} className="mr-1" />
                                    {pool.duration}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 font-bold uppercase tracking-tight mb-1">Min. Entry</p>
                                <div className="flex items-center text-[#444a6d] font-black">
                                    <Lock size={14} className="mr-1" />
                                    {pool.minInvest}
                                </div>
                            </div>
                        </div>

                        {selectedPool === pool.id && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleParticipate(pool); }}
                                disabled={isParticipating || success}
                                className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${success ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
                            >
                                {isParticipating ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <span>Participate Now</span>}
                                {!isParticipating && !success && <ChevronRight size={18} />}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-[#151d48] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                        <ShieldCheck size={40} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Platform Solvency Guarantee</h2>
                        <p className="text-sm opacity-60 leading-relaxed max-w-2xl">
                            All investment pools are backed by our global revenue reserves. In the event of an early withdrawal, a 15% penalty fee applies to ensure pool stability for all participants.
                        </p>
                    </div>
                    <div className="md:ml-auto">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center min-w-[160px]">
                            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-1">Global TVL</p>
                            <p className="text-2xl font-black">$432,900.00</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            </div>
        </div>
    );
}
