"use client";

import React, { useState } from 'react';
import { Receipt, ShieldCheck, Search, Filter, Hash, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function AdminReceiptAuditPage() {
    const [auditStatus, setAuditStatus] = useState('idle');

    const receipts = [
        { id: 'REC-90321', type: 'MATRIX_CYCLE', amount: '$45.00', hash: '8f2b...9a1c', timestamp: '2024-03-08 14:23', integrity: 'Valid' },
        { id: 'REC-90320', type: 'AD_PAYOUT', amount: '$1.20', hash: '4d1a...0e5b', timestamp: '2024-03-08 14:15', integrity: 'Valid' },
        { id: 'REC-90319', type: 'POOL_STAKE', amount: '$100.00', hash: '2b9e...3f4a', timestamp: '2024-03-08 13:58', integrity: 'Valid' },
        { id: 'REC-90318', type: 'P2P_XFER', amount: '$250.00', hash: '6c8d...1e2f', timestamp: '2024-03-08 13:42', integrity: 'Warning' },
    ];

    const runFullAudit = () => {
        setAuditStatus('auditing');
        setTimeout(() => setAuditStatus('done'), 3000);
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Verifiable Receipt Audit</h1>
                    <p className="text-gray-500 text-sm mt-1">Audit hash-based cryptographic proofs for all platform transactions.</p>
                </div>
                <button
                    onClick={runFullAudit}
                    className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-blue-900/10"
                >
                    {auditStatus === 'auditing' ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    <span>{auditStatus === 'auditing' ? 'Auditing Ledger...' : 'Run Integrity Scan'}</span>
                </button>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 text-sm">
                            <span className="text-gray-400 font-bold">Total Proofs:</span>
                            <span className="font-black text-[#151d48]">1.2M</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 text-sm text-green-600">
                            <ShieldCheck size={16} />
                            <span className="font-bold">Verified Hash Chain</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white border border-gray-100 p-2.5 rounded-xl text-[#737791] hover:bg-gray-50">
                            <Filter size={20} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input className="bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm w-64 outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search by Receipt ID or Hash..." />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                <th className="px-6 py-5">Receipt ID</th>
                                <th className="px-6 py-5">Transaction Type</th>
                                <th className="px-6 py-5">Amount</th>
                                <th className="px-6 py-5">Audit Hash</th>
                                <th className="px-6 py-5">Timestamp</th>
                                <th className="px-6 py-5">Integrity</th>
                                <th className="px-6 py-5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {receipts.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Receipt size={16} /></div>
                                            <span className="font-bold text-[#151d48]">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase">{row.type}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-[#444a6d]">{row.amount}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 group cursor-pointer">
                                            <Hash size={12} className="text-gray-300 group-hover:text-primary" />
                                            <code className="text-[11px] text-gray-400 font-mono tracking-tight group-hover:text-primary">{row.hash}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] text-gray-400 font-bold">{row.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 font-bold text-xs ${row.integrity === 'Valid' ? 'text-green-500' : 'text-amber-500'}`}>
                                            {row.integrity === 'Valid' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                            {row.integrity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold">
                                            <FileText size={16} />
                                            <span>Full Proof</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <Hash size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#151d48]">Chain Integrity</h3>
                    <p className="text-sm text-gray-500 mt-2 mb-6">Each transaction generates a unique HMAC-SHA256 signature chained to the previous ledger entry, ensuring immutability.</p>
                    <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                        <span>View Technical Architecture</span>
                        <ExternalLink size={14} />
                    </button>
                </div>
                <div className="bg-[#151d48] rounded-3xl p-8 text-white">
                    <h3 className="text-xl font-bold mb-4">Audit Transparency</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60">Last Global Audit</span>
                            <span className="font-bold">2 hours ago</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60">Mismatch Detected</span>
                            <span className="font-bold text-green-400">None</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60">System Security Score</span>
                            <span className="font-bold text-primary">A+ (Premium)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
