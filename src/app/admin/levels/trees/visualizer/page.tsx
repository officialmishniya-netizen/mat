"use client";

import React, { useState, useEffect } from 'react';
import { Network, Search, RefreshCw, User, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { MatrixTree } from "@/app/dashboard/matrix/page";
import Link from 'next/link';

export default function AdminMatrixVisualizer() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searching, setSearching] = useState(false);
    const [rootNode, setRootNode] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);

    const buildTree = async (positionId: string, depth: number = 0): Promise<any[]> => {
        if (depth >= 3) return []; // Admin gets more depth

        const { data: children } = await supabase
            .from('matrix_positions')
            .select('id, user_id, users(username)')
            .eq('parent_id', positionId)
            .eq('status', 'active');

        if (!children) return [];

        const nodes: any[] = [];
        for (const child of children as any) {
            nodes.push({
                id: child.id,
                username: child.users.username,
                children: await buildTree(child.id, depth + 1)
            });
        }
        return nodes;
    };

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearching(true);
        setRootNode(null);

        // 1. Find user
        const { data: userData } = await supabase
            .from('users')
            .select('id, username')
            .ilike('username', searchTerm)
            .single();

        if (userData) {
            // 2. Get first active position
            const { data: pos } = await supabase
                .from('matrix_positions')
                .select('id, level_id, levels(name)')
                .eq('user_id', userData.id)
                .eq('status', 'active')
                .limit(1)
                .single();

            if (pos) {
                const tree = await buildTree(pos.id);
                setRootNode({
                    id: pos.id,
                    username: userData.username,
                    children: tree
                });
                setUserStats({
                    username: userData.username,
                    tier: (pos as any).levels.name,
                    id: userData.id
                });
            }
        }
        setSearching(false);
    };

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/levels/trees" className="text-gray-400 hover:text-primary transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#f97316] bg-orange-50 px-2 py-0.5 rounded-full">Admin Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#151d48]">Deep Matrix Visualizer</h1>
                    <p className="text-gray-500 text-sm mt-1">Audit any user's multi-level downline and genealogic spillover in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm w-80 font-bold"
                            placeholder="Enter username to audit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching || !searchTerm}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {searching ? <RefreshCw size={18} className="animate-spin" /> : 'Search Tree'}
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {rootNode ? (
                    <div className="flex-1 flex flex-col p-10">
                        <div className="mb-10 flex items-center justify-between bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm text-primary">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Root Auditor Target</p>
                                    <h3 className="text-xl font-black text-[#151d48]">@{userStats.username}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Board Membership</p>
                                <span className="font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">{userStats.tier}</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200">
                            <MatrixTree root={rootNode} />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-4">
                        <div className="p-8 bg-gray-50 rounded-full text-gray-200">
                            <Network size={80} strokeWidth={1} />
                        </div>
                        <div className="max-w-sm">
                            <h3 className="text-xl font-black text-[#151d48]">No Target Selected</h3>
                            <p className="text-gray-400 font-bold text-sm mt-2">Use the search bar above to drill down into any user's matrix structure. Results include all active boards up to 3 levels deep.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
