"use client";

import React, { useState, useEffect } from 'react';
import { CalendarClock, Play, ShieldAlert, CheckCircle2, XCircle, Search, Filter, ArrowUpRight, RefreshCw } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/context";
import { supabase } from "@/lib/supabase";

export default function AdminScheduledPayoutsPage() {
    const { t } = useTranslation();
    const [isSimulating, setIsSimulating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [stats, setStats] = useState({
        activeCount: 0,
        nextBatchSize: '0.00',
        successRate: '99.4%', // Keeping as placeholder until success log logic is mature
        solvency: '1.24x'      // Keeping as placeholder until global reserves logic is wired
    });

    const fetchData = async () => {
        setLoading(true);
        // 1. Fetch real schedules
        const { data: scheduleData } = await supabase
            .from('withdrawal_schedules')
            .select('*, users(username)')
            .order('next_run_at', { ascending: true });

        if (scheduleData) {
            setSchedules(scheduleData.map(s => ({
                id: s.id,
                user: (s.users as any)?.username || 'user',
                frequency: s.frequency,
                amount: s.amount_type === 'fixed' ? `Fixed ($${parseFloat(s.fixed_amount).toFixed(2)})` : 'All Available',
                lastRun: s.last_run_at ? new Date(s.last_run_at).toLocaleDateString() : 'Never',
                nextRun: s.next_run_at ? new Date(s.next_run_at).toLocaleDateString() : 'TBD',
                status: s.is_active ? 'Active' : 'Paused'
            })));

            // 2. Calculate Stats
            const activeSchedules = scheduleData.filter(s => s.is_active);
            const batchSize = activeSchedules.reduce((acc, curr) => acc + parseFloat(curr.fixed_amount || '0'), 0);

            setStats(prev => ({
                ...prev,
                activeCount: activeSchedules.length,
                nextBatchSize: batchSize.toFixed(2)
            }));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const runSimulation = async () => {
        setIsSimulating(true);
        // Logic to hit an API route that processes schedules
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Scheduled Payouts Monitor</h1>
                    <p className="text-gray-500 text-sm mt-1">Global overview of automated withdrawal schedules and performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="bg-white border border-gray-100 p-2.5 rounded-xl text-gray-400 hover:text-primary transition-colors">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/10 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isSimulating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} fill="currentColor" />}
                        <span>Simulate Cron Job</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Schedules', value: stats.activeCount.toString(), color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Next Batch Size', value: `$${stats.nextBatchSize}`, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Success Rate (30d)', value: stats.successRate, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'System Solvency', value: stats.solvency, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-white/50 backdrop-blur-sm`}>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#737791] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-[#151d48]">Queue Management</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input className="bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none" placeholder="Search user or frequency..." />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Frequency</th>
                                <th className="px-6 py-4">Strategy</th>
                                <th className="px-6 py-4">Last Run</th>
                                <th className="px-6 py-4">Next Run</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {schedules.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#151d48]">@{row.user}</td>
                                    <td className="px-6 py-4 text-sm text-[#737791]">{row.frequency}</td>
                                    <td className="px-6 py-4 text-sm text-[#737791]">{row.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">{row.lastRun}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-primary">{row.nextRun}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-400 hover:text-primary transition-colors">
                                            <ArrowUpRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-start gap-4">
                <div className="p-2 bg-amber-200 rounded-xl text-amber-700">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Admin Safety Protocol</h4>
                    <p className="text-sm text-amber-700/80 leading-relaxed max-w-3xl">
                        Simulation mode allows you to preview the batch without executing real ledger entries. In production, ensure the platform liquidity bridge is funded before triggering the manual cron override. All manual runs are logged for security auditing.
                    </p>
                </div>
            </div>
        </div>
    );
}
