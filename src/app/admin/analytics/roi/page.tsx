"use client";

import React from 'react';
import { Megaphone, Target, DollarSign, BarChart3, TrendingUp, Users, ArrowUpRight, Search, Filter } from 'lucide-react';

export default function AdminAdvertiserROIDashboard() {
    const campaigns = [
        { id: '1', advertiser: 'Multanish Official', campaign: 'Summer Sale', impressions: '1.2M', ctr: '5.2%', spend: '$450', roi: '3.4x' },
        { id: '2', advertiser: 'Crypto_Exchange_X', campaign: 'BTC Bounty', impressions: '890k', ctr: '4.8%', spend: '$1,200', roi: '2.8x' },
        { id: '3', advertiser: 'SaaS_Direct', campaign: 'Beta Launch', impressions: '450k', ctr: '3.1%', spend: '$200', roi: '1.9x' },
    ];

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Advertiser ROI Intelligence</h1>
                    <p className="text-gray-500 text-sm mt-1">Platform-wide advertising performance monitoring and advertiser oversight.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-100 px-6 py-2.5 rounded-xl font-bold text-[#151d48] hover:bg-gray-50 transition-all">
                        Advertiser Whitelist
                    </button>
                    <button className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all">
                        <Megaphone size={18} />
                        <span>System Campaign</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Global Impressions', value: '4.8M', IconComponent: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg. Platform CTR', value: '4.2%', IconComponent: Target, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Daily Ad Revenue', value: '$840.00', IconComponent: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Active Advertisers', value: '42', IconComponent: Users, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-3xl p-6 border border-white/50 backdrop-blur-sm`}>
                        <div className={`p-2.5 rounded-xl bg-white w-fit ${stat.color} shadow-sm mb-4`}>
                            <stat.IconComponent size={20} />
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#737791] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="font-bold text-[#151d48]">Campaign Performance Audit</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-sm w-64 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search by Advertiser..." />
                        </div>
                        <button className="bg-white border border-gray-100 p-2.5 rounded-xl text-[#737791] hover:bg-gray-50">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                <th className="px-6 py-5">Advertiser</th>
                                <th className="px-6 py-5">Campaign</th>
                                <th className="px-6 py-5">Impressions</th>
                                <th className="px-6 py-5">CTR</th>
                                <th className="px-6 py-5">Total Spend</th>
                                <th className="px-6 py-5">Global ROI</th>
                                <th className="px-6 py-5">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {campaigns.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#151d48]">@{row.advertiser}</td>
                                    <td className="px-6 py-4 text-sm text-[#737791]">{row.campaign}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#444a6d]">{row.impressions}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-[#444a6d]">{row.ctr}</td>
                                    <td className="px-6 py-4 font-black text-primary">{row.spend}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp size={14} className="text-green-500" />
                                            <span className="font-bold text-green-600">{row.roi}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
