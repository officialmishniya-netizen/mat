"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Network, Users, ArrowRight, Zap, RefreshCw, Search, ListFilter } from 'lucide-react';
import { supabase } from "@/lib/supabase";

export default function LiveTreesPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        queue_size: 0,
        next_in_line: '...',
        fill_pct: 0
    });

    const fetchData = async () => {
        setLoading(true);
        const { data: lvlData } = await supabase
            .from('levels')
            .select('id, name, price, matrix_width, matrix_depth')
            .order('id', { ascending: true });

        if (lvlData) {
            setLevels(lvlData);
            if (!selectedLevel && lvlData.length > 0) {
                setSelectedLevel(lvlData[0]);
            }
        }
    };

    const fetchLevelStats = async (levelId: number) => {
        const { count: queueSize } = await supabase
            .from('matrix_positions')
            .select('*', { count: 'exact', head: true })
            .eq('level_id', levelId)
            .eq('status', 'active');

        const { data: nextData } = await supabase
            .from('matrix_positions')
            .select('user_id, users(username)')
            .eq('level_id', levelId)
            .eq('status', 'active')
            .order('created_at', { ascending: true })
            .limit(1);

        // Calculate real saturation
        let fill_pct = 0;
        if (selectedLevel) {
            const width = selectedLevel.matrix_width || 2;
            const depth = selectedLevel.matrix_depth || 2;
            let capacity = 0;
            for (let i = 1; i <= depth; i++) {
                capacity += Math.pow(width, i);
            }
            fill_pct = capacity > 0 ? Math.min(100, Math.floor(((queueSize || 0) / capacity) * 100)) : 0;
        }

        setStats({
            queue_size: queueSize || 0,
            next_in_line: (nextData?.[0] as any)?.users?.username || 'None',
            fill_pct
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedLevel) {
            fetchLevelStats(selectedLevel.id);
        }
    }, [selectedLevel]);

    if (!selectedLevel && loading) {
        return <div className="p-12 text-center font-black text-gray-400">Loading Ecosystem Data...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Matrix Boards Intelligence</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time visualization of matrix depth and cycle queues.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm" placeholder="Find user in tree..." />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Level Selection Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 px-2">
                        <ListFilter size={12} /> Live Tiers
                    </div>
                    {levels.map((lvl) => (
                        <button
                            key={lvl.id}
                            onClick={() => setSelectedLevel(lvl)}
                            className={`w-full p-6 rounded-[2rem] text-left transition-all border ${selectedLevel?.id === lvl.id ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white text-[#151d48] border-gray-100 hover:border-primary/30'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase opacity-60">ID: {lvl.id}</span>
                                <Network size={16} className={selectedLevel?.id === lvl.id ? 'opacity-100' : 'opacity-20'} />
                            </div>
                            <div className="font-black text-lg">{lvl.name}</div>
                            <div className={`text-xs mt-2 font-bold ${selectedLevel?.id === lvl.id ? 'text-white/80' : 'text-gray-400'}`}>
                                ${lvl.price} Entry
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tree Visualization Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                        <div className="relative z-10 text-center space-y-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-6 bg-primary/10 rounded-[2.5rem] text-primary">
                                    <Network size={64} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-[#151d48]">Matrix Architecture: {selectedLevel?.name}</h3>
                                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                    <Users size={16} className="text-primary" />
                                    <span className="text-sm font-bold text-[#444a6d]">Queue Size: {stats.queue_size} Users</span>
                                </div>
                            </div>

                            {/* "Next in Line" Highlight */}
                            <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-8 max-w-lg mx-auto">
                                <div className="flex items-center justify-center gap-2 text-orange-600 mb-4 animate-pulse">
                                    <Zap size={20} fill="currentColor" />
                                    <span className="text-xs font-black uppercase tracking-widest">Next in Line to Cycle</span>
                                </div>
                                <div className="flex items-center justify-between gap-8">
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-orange-400 uppercase">Current Leader</p>
                                        <p className="text-2xl font-black text-[#151d48]">@{stats.next_in_line}</p>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-orange-50 flex items-center justify-center text-[10px] font-black text-orange-400 shadow-sm">
                                                +{i}
                                            </div>
                                        ))}
                                    </div>
                                    <ArrowRight className="text-orange-300" />
                                </div>
                                <div className="w-full bg-orange-100 h-2 rounded-full mt-6 overflow-hidden">
                                    <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${stats.fill_pct}%` }} />
                                </div>
                                <div className="text-[8px] font-black text-orange-400 mt-2 text-center uppercase tracking-tighter italic">
                                    {stats.fill_pct}% ARCHITECTURE SATURATION
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm max-w-md mx-auto">
                                Use the mouse to pan and zoom through the global tree structure. Click on any node to view detailed user genealogy and spillover history.
                            </p>

                            <Link href="/admin/levels/trees/visualizer">
                                <button className="bg-[#151d48] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-xl shadow-blue-900/10">
                                    Launch Full Interactive Tree View
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Total Injected', value: `$${(stats.queue_size * parseFloat(selectedLevel?.price || '0')).toLocaleString()}`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'Current Gaps', value: 'Live Scan...', icon: Network, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'Last Cycle', value: 'T-Minus 24h', icon: Zap, color: 'text-green-500', bg: 'bg-green-50' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-lg font-black text-[#151d48]">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
