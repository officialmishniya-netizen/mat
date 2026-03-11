"use client";

import React, { useEffect, useState } from 'react';
import { Award, TrendingUp, ShieldAlert, Save, RefreshCw, Zap, Percent, Loader2 } from 'lucide-react';
import { supabase } from "@/lib/supabase";

export default function BonusSettingsPage() {
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('levels')
            .select('*')
            .order('id', { ascending: true });

        if (data) setLevels(data);
        setLoading(false);
    };

    const handleUpdate = async (levelId: number, field: string, value: any) => {
        const updatedLevels = levels.map(l =>
            l.id === levelId ? { ...l, [field]: value } : l
        );
        setLevels(updatedLevels);
    };

    const saveChanges = async () => {
        setSaving(true);
        for (const lvl of levels) {
            await supabase
                .from('levels')
                .update({
                    matching_bonus: lvl.matching_bonus,
                    matching_depth: lvl.matching_depth,
                    commission_cap: lvl.commission_cap,
                    sponsor_bonus: lvl.sponsor_bonus,
                    rank_multiplier: lvl.rank_multiplier
                })
                .eq('id', lvl.id);
        }
        setSaving(false);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Bonus Intelligence Center</h1>
                    <p className="text-gray-500 text-sm mt-1">Global configuration for multi-level matching and performance multipliers.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={saveChanges}
                        disabled={saving}
                        className="bg-[#151d48] text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-blue-900/10 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{saving ? 'Synchronizing...' : 'Save Global Rules'}</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Matching Bonus Rules */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-black mb-6 text-[#151d48] flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><TrendingUp size={20} /></div>
                            Multi-Level Matching Logic
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                        <th className="px-4 py-4">Membership Tier</th>
                                        <th className="px-4 py-4">Direct (%)</th>
                                        <th className="px-4 py-4">Match (%)</th>
                                        <th className="px-4 py-4">Binary (%)</th>
                                        <th className="px-4 py-4">Daily Cap</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-bold">Fetching level bonus matrices...</td></tr>
                                    ) : levels.map((lvl) => (
                                        <tr key={lvl.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-4 py-6 font-black text-[#151d48]">{lvl.name}</td>
                                            <td className="px-4 py-6">
                                                <input
                                                    type="number"
                                                    value={lvl.sponsor_bonus}
                                                    onChange={(e) => handleUpdate(lvl.id, 'sponsor_bonus', parseFloat(e.target.value))}
                                                    className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold w-20 outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-4 py-6">
                                                <input
                                                    type="number"
                                                    value={lvl.matching_bonus}
                                                    onChange={(e) => handleUpdate(lvl.id, 'matching_bonus', parseFloat(e.target.value))}
                                                    className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold w-20 outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-4 py-6">
                                                <input
                                                    type="number"
                                                    value={lvl.matching_depth}
                                                    onChange={(e) => handleUpdate(lvl.id, 'matching_depth', parseInt(e.target.value))}
                                                    className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold w-20 outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                            <td className="px-4 py-6">
                                                <input
                                                    type="number"
                                                    value={lvl.commission_cap}
                                                    onChange={(e) => handleUpdate(lvl.id, 'commission_cap', parseFloat(e.target.value))}
                                                    className="bg-gray-50 border-none rounded-lg px-3 py-1.5 text-xs font-bold w-24 outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Rank Multipliers */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-black mb-6 text-[#151d48] flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><Award size={20} /></div>
                            Dynamic Rank Multipliers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {levels.slice(0, 4).map((lvl, i) => (
                                <div key={lvl.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                    <span className="font-bold text-[#444a6d]">{lvl.name} Status</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={lvl.rank_multiplier}
                                            onChange={(e) => handleUpdate(lvl.id, 'rank_multiplier', parseFloat(e.target.value))}
                                            className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-black text-amber-600 outline-none"
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Earnings</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Control Panel Sidebar */}
                <div className="space-y-8">
                    <div className="bg-[#151d48] rounded-[2.5rem] p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-amber-500" />
                            Global Safety Locks
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max System Liability (Daily)</label>
                                <input defaultValue="$250,000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Clawback Grace Period</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option>24 Hours</option>
                                    <option>48 Hours</option>
                                    <option>72 Hours</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-12 h-6 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                                <span className="text-sm font-bold opacity-80">Enable Anti-Fraud Throttling</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white rounded-2xl text-primary shadow-sm"><Percent size={24} strokeWidth={3} /></div>
                            <h3 className="text-lg font-black text-[#151d48]">Ecosystem Cut</h3>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            The platform keeps a base <b>5% Admin Fee</b> on all matrix cycles. This can be overridden per-level in the Level Configurator.
                        </p>
                        <button className="w-full bg-white border border-gray-100 text-[#151d48] py-4 rounded-2xl font-black text-xs hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                            <Zap size={14} className="text-primary" />
                            Recalculate Solvency
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
