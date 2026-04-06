"use client";

import React from 'react';
import { Trophy, Plus, Settings2, Trash2, Edit3, Users, Calendar, DollarSign, Save } from 'lucide-react';

export default function AdminContestManagerPage() {
    const contests = [
        { id: '1', name: 'Spring Recruitment Sprint', prizePool: '$2,500', participants: 432, endDate: '2024-03-31', status: 'Active' },
        { id: '2', name: 'Matrix Speed Challenge', prizePool: '$1,000', participants: 128, endDate: '2024-03-15', status: 'Active' },
        { id: '3', name: 'Winter Referral Blast', prizePool: '$5,000', participants: 1204, endDate: '2024-02-28', status: 'Completed' },
    ];

    return (
        <div className="p-6 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">Referral Contest Manager</h1>
                    <p className="text-gray-500 text-sm mt-1">Design and launch competitive recruitment drives with automated payouts.</p>
                </div>
                <button className="bg-[#151d48] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary transition-all">
                    <Plus size={18} />
                    <span>Create New Contest</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contests.map((contest) => (
                    <div key={contest.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${contest.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                <Trophy size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Edit3 size={16} /></button>
                                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-[#151d48] mb-1">{contest.name}</h3>
                        <div className="flex items-center gap-2 mb-6">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${contest.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {contest.status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                <Calendar size={10} />
                                Ends {contest.endDate}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold">Prize Pool</span>
                                <span className="font-black text-[#151d48]">{contest.prizePool}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 font-bold">Participants</span>
                                <span className="font-black text-[#151d48]">{contest.participants}</span>
                            </div>
                        </div>

                        <button className="mt-auto w-full py-3 rounded-xl border-2 border-primary/20 text-primary font-black text-xs hover:bg-primary hover:text-white transition-all">
                            View Leaderboard
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-[#151d48] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-5 bg-white/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-white/10">
                        <DollarSign size={40} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Automated Prize Distribution</h2>
                        <p className="text-sm opacity-60 ">
                            Upon contest completion, the system automatically verifies winners and credits their 'Purchase Balance' or 'Withdraw Balance' based on contest settings. No manual intervention required.
                        </p>
                    </div>
                    <div className="md:ml-auto">
                        <button className="bg-primary text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            Configure Payouts
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            </div>
        </div>
    );
}
