"use client";

import React from 'react';
import { BarChart3, TrendingUp, MousePointer2, Megaphone, DollarSign, PieChart, ArrowUpRight, Target } from 'lucide-react';

export default function AdvertiserROIDashboard() {
    const stats = [
        { label: 'Total Impressions', value: '1.2M', trend: '+12%', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg. CTR', value: '4.8%', trend: '+0.5%', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Total Spend', value: '$4,250.00', trend: '-2%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Conversion ROI', value: '3.2x', trend: '+18%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Advertiser ROI Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time performance metrics for your Paid-To-Click campaigns.</p>
                </div>
                <button className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-blue-900/10">
                    <Megaphone size={18} />
                    <span>Launch New Campaign</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                        <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-[#151d48]">{stat.value}</p>
                        <span className="text-[10px] font-bold text-green-500 mt-1">{stat.trend} from last week</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-[#151d48]">Traffic Pulse (Clicks)</h3>
                        <div className="flex gap-2 text-[10px] font-black uppercase">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> Desktop</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Mobile</span>
                        </div>
                    </div>
                    <div className="h-64 flex items-end gap-3 justify-between">
                        {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95, 60, 75].map((val, i) => (
                            <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1">
                                <div style={{ height: `${val}%` }} className="bg-primary/20 rounded-t-sm w-full relative group cursor-help">
                                    <div style={{ height: '70%', bottom: 0 }} className="absolute inset-x-0 bg-primary rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div style={{ height: `${val / 2}%` }} className="bg-blue-400 rounded-t-sm w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-50 pt-4">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-[#151d48] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-6">Demographic Breakout</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Pakistan', value: '45%', color: 'bg-green-500' },
                                { label: 'India', value: '25%', color: 'bg-orange-500' },
                                { label: 'United States', value: '15%', color: 'bg-blue-500' },
                                { label: 'Others', value: '15%', color: 'bg-gray-500' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="opacity-60">{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${item.color} h-full`} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-auto pt-8 flex justify-center">
                        <PieChart size={120} className="opacity-20 translate-y-8" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#151d48]">Campaign Manager</h3>
                    <div className="flex gap-2">
                        <button className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Active</button>
                        <button className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Paused</button>
                        <button className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">Completed</button>
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { name: 'Multanish Summer Sale', status: 'Running', clicks: '4,203', ctr: '5.2%', budget: '$500' },
                        { name: 'New iPhone Promo', status: 'Paused', clicks: '1,120', ctr: '3.1%', budget: '$200' },
                        { name: 'E-commerce Launch', status: 'Running', clicks: '8,900', ctr: '6.5%', budget: '$1,000' }
                    ].map((camp, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${camp.status === 'Running' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                <div>
                                    <p className="font-bold text-[#151d48] group-hover:text-primary transition-colors">{camp.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{camp.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-12 text-center">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Clicks</p>
                                    <p className="font-black text-[#444a6d]">{camp.clicks}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">CTR</p>
                                    <p className="font-black text-[#444a6d]">{camp.ctr}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Daily Budget</p>
                                    <p className="font-black text-primary">{camp.budget}</p>
                                </div>
                            </div>
                            <ArrowUpRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
