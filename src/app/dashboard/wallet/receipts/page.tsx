"use client";

import React, { useEffect, useState } from 'react';
import { Receipt, ShieldCheck, Download, Search, Filter, Hash, ExternalLink } from 'lucide-react';
import { supabase } from "@/lib/supabase";

export default function VerifiableReceiptsPage() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipts = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('ledger_receipts')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setReceipts(data);
            }
            setLoading(false);
        };

        fetchReceipts();
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Verifiable Receipts</h1>
                    <p className="text-gray-500 text-sm mt-1">Every transaction is cryptographically signed and chained for absolute integrity.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                        <Download size={16} />
                        <span>Export All</span>
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/10">
                        <ShieldCheck size={16} />
                        <span>Audit My Ledger</span>
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search by Hash or Transaction ID..." />
                    </div>
                    <button className="bg-gray-50 px-6 py-3 rounded-2xl text-gray-400 hover:text-primary transition-colors flex items-center gap-2">
                        <Filter size={18} />
                        <span className="text-sm font-bold">Filter</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                <th className="px-4 py-4">Transaction</th>
                                <th className="px-4 py-4">Amount</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Integrity Hash (HMAC)</th>
                                <th className="px-4 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-bold">Synchronizing with Ledger Chain...</td>
                                </tr>
                            ) : receipts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-bold">No receipts found in your ledger.</td>
                                </tr>
                            ) : receipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Receipt size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#151d48]">{receipt.transaction_type}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{new Date(receipt.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <span className="font-black text-[#151d48]">${receipt.amount}</span>
                                    </td>
                                    <td className="px-4 py-6">
                                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-500">
                                            <ShieldCheck size={12} />
                                            {receipt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-2 font-mono text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                            <Hash size={12} />
                                            {receipt.receipt_hash.substring(0, 10)}...
                                        </div>
                                    </td>
                                    <td className="px-4 py-6 text-right">
                                        <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-[#151d48] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0">
                        <ShieldCheck size={48} className="text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black">Mathematical Proof of Solvency</h2>
                        <p className="text-gray-400 max-w-2xl leading-relaxed text-sm">
                            Our platform uses a blockchain-inspired "Ledger Chain". Each receipt's hash includes the signature of the previous transaction. This means no balance can be altered without breaking the entire chain, providing you with verifiable proof of every cent earned.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
