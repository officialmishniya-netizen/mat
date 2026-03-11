"use client";

import React from 'react';
import { MessageSquare, ShieldAlert, Trash2, UserX, CheckCircle2, Search, Filter, AlertTriangle } from 'lucide-react';

export default function AdminChatModerationPage() {
    const alerts = [
        { id: '1', user: 'scammer_99', text: 'Check out this free BTC site: scam.com', reason: 'External Link', score: 98 },
        { id: '2', user: 'angry_user', text: 'I hate this platform it is so bad ads are slow', reason: 'Sentiment Alert', score: 72 },
    ];

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Chat Moderation Center</h1>
                    <p className="text-gray-500 text-sm mt-1">AI-assisted monitoring and moderation of team chat rooms.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 border border-green-100">
                        <CheckCircle2 size={16} />
                        <span>AI Auto-Mod Online</span>
                    </div>
                    <button className="bg-white border border-gray-100 p-2.5 rounded-xl text-[#737791] hover:bg-gray-50">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-[#151d48] flex items-center gap-2">
                                <AlertTriangle className="text-amber-500" size={18} />
                                Flagged Messages
                            </h3>
                            <button className="text-xs font-bold text-primary hover:underline">Clear All Resolved</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-[#151d48]">@{alert.user}</span>
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded-md">{alert.reason}</span>
                                            </div>
                                            <p className="text-sm text-[#444a6d] font-medium mb-3">"{alert.text}"</p>
                                            <div className="flex gap-2">
                                                <button className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-1.5">
                                                    <Trash2 size={12} />
                                                    <span>Delete</span>
                                                </button>
                                                <button className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400 hover:text-red-500 hover:border-red-100 transition-all flex items-center gap-1.5">
                                                    <UserX size={12} />
                                                    <span>Suspend User</span>
                                                </button>
                                                <button className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-400 hover:text-green-500 hover:border-green-100 transition-all flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} />
                                                    <span>Dismiss</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Risk Score</p>
                                        <p className="text-xl font-black text-red-600">{alert.score}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#151d48] rounded-3xl p-8 text-white relative overflow-hidden">
                        <MessageSquare className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 opacity-5" size={200} />
                        <h3 className="text-xl font-bold mb-6 relative z-10">Room Status</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { name: 'Global Matrix', users: '1.2k', status: 'Healthy' },
                                { name: 'Level 1 Upline', users: '42', status: 'Healthy' },
                                { name: 'Direct Downline', users: '208', status: 'Alert' },
                            ].map((room, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div>
                                        <p className="font-bold text-sm">{room.name}</p>
                                        <p className="text-[10px] opacity-60 font-medium">{room.users} users</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${room.status === 'Healthy' ? 'text-green-400' : 'text-amber-400'}`}>
                                        {room.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#151d48] mb-4">Word Filters</h3>
                        <div className="flex flex-wrap gap-2">
                            {['scam', 'spam', 'fake', 'payout', 'admin', 'password'].map((word) => (
                                <div key={word} className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#444a6d]">{word}</span>
                                    <button className="text-gray-300 hover:text-red-500 transition-colors">Ã—</button>
                                </div>
                            ))}
                            <button className="px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 hover:border-primary hover:text-primary transition-all">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Plus({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    );
}
