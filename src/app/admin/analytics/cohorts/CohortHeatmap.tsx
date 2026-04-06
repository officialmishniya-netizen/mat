"use client";

import React from 'react';
import { Users, Filter, Download, Info, ArrowUpRight } from 'lucide-react';

type CohortRow = {
    month: string;
    size: number;
    retention: number[]; // percentages for Day 1, 7, 30, 60, 90
};

export default function CohortHeatmap({ cohorts }: { cohorts: CohortRow[] }) {
    const getHeatmapColor = (pct: number) => {
        if (pct >= 80) return 'bg-[#004d3d] text-white';
        if (pct >= 60) return 'bg-[#008a6e] text-white';
        if (pct >= 40) return 'bg-[#00c59e] text-[#151d48]';
        if (pct >= 20) return 'bg-[#7ae7cf] text-[#151d48]';
        if (pct > 0) return 'bg-[#d8f9f1] text-[#151d48]';
        return 'bg-gray-50 text-gray-300';
    };

    return (
        <div className="p-6 space-y-6 ">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Cohort Retention Analysis</h1>
                    <p className="text-gray-500 text-sm mt-1">Track user stickiness across 90 days based on ledger activity.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 text-[#444a6d]">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-primary rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/20">
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cohort Month</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Day 1</th>
                                <th className="px-6 py-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Day 7</th>
                                <th className="px-6 py-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Day 30</th>
                                <th className="px-6 py-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Day 60</th>
                                <th className="px-6 py-4 text-xs font-bold text-center text-gray-400 uppercase tracking-wider">Day 90</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {cohorts.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#151d48]">{row.month}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-baseline space-x-2">
                                            <span className="font-bold text-[#444a6d]">{row.size}</span>
                                            <span className="text-[10px] text-gray-400">users</span>
                                        </div>
                                    </td>
                                    {row.retention.map((pct, j) => (
                                        <td key={j} className="px-1 py-1">
                                            <div className={`w-full h-12 flex items-center justify-center rounded-lg font-bold text-sm ${getHeatmapColor(pct)}`}>
                                                {pct}%
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                        <Info size={18} className="text-primary" />
                        <h3 className="font-bold text-[#151d48]">How can I improve Day 30+ retention?</h3>
                    </div>
                    <ul className="space-y-4 text-xs text-gray-500 font-medium">
                        <li className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center flex-shrink-0">1</span>
                            <span>Launch <strong>Referral Contests</strong> (Phase 19) to keep top recruiters focused on long-term targets.</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center flex-shrink-0">2</span>
                            <span>Implement <strong>Loyalty Badges</strong> (Phase 19) that unlock higher reward tiers for multi-month users.</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded flex items-center justify-center flex-shrink-0">3</span>
                            <span>Promote <strong>30-Day Investment Pools</strong> (Phase 17) to lock in capital and reduce churn.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Platform Stickiness Meta</h3>
                        <p className="text-3xl font-black mb-1">
                            {cohorts.length > 0 ? `${Math.round(cohorts.reduce((acc, curr) => acc + curr.retention[1], 0) / cohorts.length)}%` : '0%'}
                        </p>
                        <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Global 7-Day Retention Avg</p>

                        <div className="mt-8 flex items-center space-x-2 text-sm font-bold">
                            <span>Analyze Matrix Churn</span>
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-[0.1] rounded-full blur-[20px]"></div>
                </div>
            </div>
        </div>
    );
}
