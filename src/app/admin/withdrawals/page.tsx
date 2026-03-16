"use client";

import React, { useState, useEffect } from 'react';
import { 
    Wallet, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    Filter, 
    ArrowUpRight, 
    RefreshCw,
    MoreHorizontal,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/context";
import { toast } from "react-hot-toast";

export default function AdminWithdrawalsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [filter, setFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchWithdrawals = async () => {
        setLoading(true);
        let query = supabase
            .from('withdrawals')
            .select('*, users(username, email)')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            toast.error("Failed to load withdrawals");
        } else {
            setWithdrawals(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [filter]);

    const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('withdrawals')
            .update({ 
                status: newStatus,
                processed_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            toast.error(`Failed to ${newStatus} withdrawal`);
        } else {
            toast.success(`Withdrawal ${newStatus} successfully`);
            fetchWithdrawals();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Withdrawal Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and process user payout requests globally.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchWithdrawals} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm w-64" 
                            placeholder="Search by username..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
                {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${
                            filter === tab 
                            ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-8 py-5">User / Request Date</th>
                                <th className="px-8 py-5">Amount (USDT)</th>
                                <th className="px-8 py-5">Method / Address</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Wallet size={48} strokeWidth={1} />
                                            <p className="font-bold">No withdrawal requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                withdrawals
                                .filter(w => (w.users?.username || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((w) => (
                                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#151d48]">@{w.users?.username}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(w.created_at).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-lg font-black text-primary">
                                            ${parseFloat(w.amount).toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black text-[#444a6d] uppercase">{w.payment_method}</span>
                                                <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">{w.details}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(w.status)}`}>
                                                    {w.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2">
                                                {w.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAction(w.id, 'approved')}
                                                            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                            title="Approve Payout"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(w.id, 'rejected')}
                                                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                            title="Reject Request"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex items-start gap-5">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 className="font-black text-[#151d48]">Financial Processing Safety</h4>
                    <p className="text-sm text-[#444a6d] mt-2 leading-relaxed max-w-4xl">
                        Approving a withdrawal here will mark the record as approved in the system logs. Ensure you have manually executed the blockchain transaction or verified the automated gateway successfully processed the funds. Ledger adjustment for payouts is handled automatically upon approval.
                    </p>
                </div>
            </div>
        </div>
    );
}
