"use client";

import React from 'react';
import { RefreshCcw, Zap, Timer, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export default function MatrixCyclePredictor() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <header>
                <h1 className="text-2xl font-bold text-[#151d48]">Cycle Predictor</h1>
                <p className="text-gray-500 text-sm mt-1">AI-driven estimates for your next matrix position maturation.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <RefreshCcw size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#151d48]">Next Cycle Est.</h3>
                        </div>

                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-black text-primary">~18h</span>
                            <span className="text-lg font-bold text-[#151d48]">42m</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-8">Confidence Score: <span className="text-green-500 font-bold">High (92%)</span></p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs text-gray-400 font-bold uppercase">
                                <span>Platform Volume Pulse</span>
                                <span>+12.4%</span>
                            </div>
                            <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[84%] relative">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-white/50 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-[#151d48] rounded-3xl p-6 text-white shadow-xl flex items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <Zap size={32} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] opacity-60 font-black uppercase tracking-widest mb-1">Queue Position</p>
                            <p className="text-2xl font-black">#14 / 8,920</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="p-4 bg-green-50 rounded-2xl text-green-500">
                            <Timer size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Avg. Cycle Speed</p>
                            <p className="text-2xl font-black text-[#151d48]">2.4 Days</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-[#151d48]">Historical Efficiency</h3>
                    <TrendingUp size={20} className="text-primary" />
                </div>
                <div className="p-8 h-48 flex items-end gap-2 justify-between">
                    {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95, 60, 75].map((val, i) => (
                        <div key={i} className="flex-1 bg-gray-100 rounded-t-lg relative group transition-all hover:bg-primary/20">
                            <div style={{ height: `${val}%` }} className="absolute bottom-0 inset-x-0 bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                <AlertCircle className="text-blue-500 shrink-0" size={24} />
                <p className="text-sm text-blue-700 leading-relaxed">
                    Predictions are based on real-time platform ad volume and matrix entry velocity. Actual cycle times may vary significantly based on global recruitment trends.
                </p>
            </div>
        </div>
    );
}
