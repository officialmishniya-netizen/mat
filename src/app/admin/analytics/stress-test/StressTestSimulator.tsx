"use client";

import React, { useState } from 'react';
import { Play, Save, RefreshCcw, TrendingDown, Info } from 'lucide-react';

type Stats = {
    totalLiability: string;
    revenueIn: string;
    totalWithdrawn: string;
};

export default function StressTestSimulator({ stats }: { stats: Stats }) {
    const [withdrawalPct, setWithdrawalPct] = useState(20);
    const [poolWithdrawalPct, setPoolWithdrawalPct] = useState(10);
    const [revenuePauseDays, setRevenuePauseDays] = useState(7);

    const totalLiabilityNum = parseFloat(stats.totalLiability);
    const liquidReserves = parseFloat(stats.revenueIn) - parseFloat(stats.totalWithdrawn);

    // Simulations
    const projectedDemand = (totalLiabilityNum * (withdrawalPct / 100)) + (totalLiabilityNum * 0.1 * (poolWithdrawalPct / 100)); // rough pool estimate
    const shortfall = Math.max(0, projectedDemand - liquidReserves);
    const solvencyScore = Math.max(0, Math.min(100, Math.round(((liquidReserves) / (projectedDemand || 1)) * 100)));

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="p-6 space-y-6 ">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Liability Stress Test Simulator</h1>
                    <p className="text-gray-500 text-sm mt-1">Simulate "Bank Run" scenarios and revenue pauses to verify system solvency.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 text-[#444a6d]"
                >
                    <RefreshCcw size={16} />
                    <span>Reset Data</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Simulation Controls */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-8">
                    <h2 className="text-lg font-bold flex items-center"><Play className="mr-2 text-primary" size={20} /> Scenario Controls</h2>

                    <div className="space-y-6">
                        <section>
                            <div className="flex justify-between text-sm font-bold mb-3">
                                <label className="text-[#444a6d]">Withdrawal Demand</label>
                                <span className="text-primary">{withdrawalPct}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={withdrawalPct}
                                onChange={(e) => setWithdrawalPct(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-[11px] text-gray-400 mt-2 italic">% of total user balances requested at once.</p>
                        </section>

                        <section>
                            <div className="flex justify-between text-sm font-bold mb-3">
                                <label className="text-[#444a6d]">Early Pool Exits</label>
                                <span className="text-primary">{poolWithdrawalPct}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={poolWithdrawalPct}
                                onChange={(e) => setPoolWithdrawalPct(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-[11px] text-gray-400 mt-2 italic">% of locked pool capital withdrawn with penalty.</p>
                        </section>

                        <section>
                            <div className="flex justify-between text-sm font-bold mb-3">
                                <label className="text-[#444a6d]">Revenue Pause</label>
                                <span className="text-primary">{revenuePauseDays} Days</span>
                            </div>
                            <input
                                type="range" min="0" max="90" value={revenuePauseDays}
                                onChange={(e) => setRevenuePauseDays(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-[11px] text-gray-400 mt-2 italic">Calculates burn rate if 0 deposits occur for this duration.</p>
                        </section>
                    </div>

                    <div className="pt-4 space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presets</p>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setWithdrawalPct(20); setRevenuePauseDays(7); }} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 font-semibold">Mild Panic</button>
                            <button onClick={() => { setWithdrawalPct(50); setRevenuePauseDays(30); }} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 font-semibold">Moderate Run</button>
                            <button onClick={() => { setWithdrawalPct(90); setRevenuePauseDays(90); }} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 font-semibold">Black Swan</button>
                        </div>
                    </div>
                </div>

                {/* Real-time Results */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">Simulated Demand</h3>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-bold">${projectedDemand.toFixed(2)}</span>
                                <span className="text-xs font-bold text-red-500 flex items-center"><TrendingDown size={14} className="mr-1" /> Pressure</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-xs font-medium">
                                <span className="text-gray-400">System Liability</span>
                                <span className="font-bold">${totalLiabilityNum.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className={`rounded-2xl p-6 shadow-sm border flex flex-col justify-center items-center text-center ${getScoreColor(solvencyScore)}`}>
                            <h3 className="text-sm font-bold mb-1 uppercase opacity-70">Solvency Score</h3>
                            <span className="text-6xl font-black">{solvencyScore}</span>
                            <p className="text-sm font-bold mt-2">{solvencyScore > 80 ? 'Safe Margins' : solvencyScore > 50 ? 'Manageable Risk' : 'Critical Shortfall'}</p>
                        </div>
                    </div>

                    <div className="bg-[#151d48] rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold opacity-80 mb-2">Simulation Impact Summary</h3>
                                <p className="text-3xl font-bold">
                                    {shortfall > 0 ? `-$${shortfall.toFixed(2)} Shortfall` : `+$${Math.abs(shortfall).toFixed(2)} Surplus`}
                                </p>
                                <p className="text-sm opacity-60 mt-1">Based on global reserves of ${liquidReserves.toFixed(2)}</p>
                            </div>
                            <button className="mt-6 md:mt-0 flex items-center space-x-2 bg-primary px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95">
                                <Save size={18} />
                                <span>Save Snapshot</span>
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-[0.03] rounded-full blur-[10px]"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-black/20 pointer-events-none"></div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <Info size={18} className="text-blue-500" />
                            <h3 className="font-bold text-[#151d48]">Understanding the Model</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500 leading-relaxed">
                            <p><strong>Burn Rate:</strong> If revenue pauses for <strong>{revenuePauseDays}</strong> days, the system relies entirely on liquid reserves to pay out standard ad cycle rewards and withdrawals.</p>
                            <p><strong>Withdrawal Pressure:</strong> Most platforms fail during a "Mass Withdrawal" event. This simulator ensures the ledger maintains a healthy ratio between <strong>Revenue In</strong> and <strong>Projected Outflows</strong>.</p>
                            <p><strong>Early Pool Penalties:</strong> Penalties from early investment pool exits actually <strong>increase</strong> liquid reserves, acting as a secondary stabilizer during panic.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
