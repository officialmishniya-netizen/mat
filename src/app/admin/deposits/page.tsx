"use client";

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Search,
    RefreshCw,
    ArrowDownLeft,
    Calendar,
    User,
    DollarSign,
    ExternalLink
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function AdminDepositsPage() {
    const [loading, setLoading] = useState(true);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDeposits = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ledger')
            .select('*, users(username, email)')
            .eq('type', 'deposit')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Failed to load deposit logs");
        } else {
            setDeposits(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const filteredDeposits = deposits.filter(d =>
        (d.users?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.reference_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalDeposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount), 0);

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Deposit Logs</h1>
                    <p className="text-gray-500 text-sm mt-1">Track all incoming funds and payment gateway confirmations.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchDeposits} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm w-64"
                            placeholder="Search username or TXID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><ArrowDownLeft size={24} /></div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Total In</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Lifetime Deposits</p>
                    <h3 className="text-3xl font-black text-green-600 mt-1">${totalDeposits.toFixed(2)}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Calendar size={24} /></div>
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest">Activity</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Transactions</p>
                    <h3 className="text-3xl font-black text-[#151d48] mt-1">{deposits.length}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><User size={24} /></div>
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Unique</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Depositing Users</p>
                    <h3 className="text-3xl font-black text-purple-600 mt-1">{new Set(deposits.map(d => d.user_id)).size}</h3>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-8 py-5">User / Date</th>
                                <th className="px-8 py-5">Amount (USD)</th>
                                <th className="px-8 py-5">Gateway ID / Reference</th>
                                <th className="px-8 py-5 text-center">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDeposits.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-bold">
                                        <div className="flex flex-col items-center gap-3">
                                            <Wallet size={48} strokeWidth={1} />
                                            <p>No deposit logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredDeposits.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#151d48]">@{d.users?.username}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(d.created_at).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-lg font-black text-green-600">
                                            +${parseFloat(d.amount).toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 w-fit">{d.reference_id || 'Internal/Manual'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                                                Confirmed
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
