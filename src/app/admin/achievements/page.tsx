"use client";

import React from 'react';
import { Award, Plus, Star, Zap, Target, Edit3, Trash2, Search, Filter } from 'lucide-react';

export default function AdminBadgeManagerPage() {
    const badges = [
        { id: '1', name: 'First Click', trigger: 'AD_CYCLE_COMPLETE', reward: '$0.50', earnedBy: 1240, status: 'Active' },
        { id: '2', name: 'Matrix Pioneer', trigger: 'MATRIX_ENTRY_PHASE_1', reward: '$1.00', earnedBy: 890, status: 'Active' },
        { id: '3', name: 'Team Builder V1', trigger: 'REFER_5_ACTIVE', reward: 'VIP Status', earnedBy: 342, status: 'Active' },
        { id: '4', name: 'Whale Investor', trigger: 'POOL_LOCK_1000', reward: 'Custom Badge', earnedBy: 12, status: 'Active' },
    ];

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Badge & Achievement Manager</h1>
                    <p className="text-gray-500 text-sm mt-1">Create gamified milestones and map them to system-level events.</p>
                </div>
                <button className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all">
                    <Plus size={18} />
                    <span>Design New Badge</span>
                </button>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-black text-primary border border-primary/20">All Badges</button>
                        <button className="bg-white px-4 py-2 rounded-xl text-xs font-black text-gray-400 hover:bg-gray-50">Active Only</button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input className="bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none" placeholder="Search by name or trigger..." />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/50">
                                <th className="px-6 py-4">Badge</th>
                                <th className="px-6 py-4">Event Trigger</th>
                                <th className="px-6 py-4">Reward</th>
                                <th className="px-6 py-4">Earned By</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {badges.map((badge) => (
                                <tr key={badge.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                <Award size={20} />
                                            </div>
                                            <span className="font-bold text-[#151d48]">{badge.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] font-black bg-gray-100 text-[#737791] px-2 py-1 rounded">{badge.trigger}</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-primary">{badge.reward}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#444a6d]">{badge.earnedBy} Users</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            {badge.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit3 size={16} /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-start gap-4">
                <div className="p-3 bg-amber-200 rounded-xl text-amber-700">
                    <Zap size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Event Stream Integration</h4>
                    <p className="text-sm text-amber-700/80 leading-relaxed max-w-3xl">
                        Badges are triggered by the central <code>dispatchEvent</code> system located in <code>src/lib/events.ts</code>. When a user completes an action, the system checks for any matching badge triggers and awards them instantly without additional database overhead.
                    </p>
                </div>
            </div>
        </div>
    );
}
