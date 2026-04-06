"use client";

import React, { useEffect, useState } from 'react';
import { Users, User, ArrowDown, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from "@/lib/supabase";

interface MatrixNode {
    id: string;
    username: string;
    level: number;
    children: MatrixNode[];
}

export function MatrixTree({ root }: { root: MatrixNode | null }) {
    const renderNode = (node: MatrixNode, depth: number = 0) => {
        return (
            <div key={node.id} className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border-2 border-primary/20 flex flex-col items-center justify-center p-2 group-hover:border-primary transition-all relative z-10">
                        <User size={20} className="text-[#151d48]" />
                        <span className="text-[10px] font-black text-[#151d48] mt-1 truncate w-full text-center">
                            @{node.username}
                        </span>
                    </div>
                    {node.children.length > 0 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 h-8 w-px bg-primary/20" />
                    )}
                </div>

                {node.children.length > 0 && (
                    <div className="flex gap-8 relative mt-4">
                        <div className="absolute top-0 left-4 right-4 h-px bg-primary/20" />
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50/50 rounded-3xl p-12 overflow-auto flex justify-center min-h-[400px]">
            {root ? renderNode(root) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="font-bold uppercase text-[10px] tracking-widest">No Active Tree Found</p>
                </div>
            )}
        </div>
    );
}

export default function MatrixVisualizationPage() {
    const [rootNode, setRootNode] = useState<MatrixNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        slots: 0,
        level: 'Starter'
    });

    const buildTree = async (positionId: string, depth: number = 0): Promise<MatrixNode[]> => {
        if (depth >= 2) return []; // Limit depth for UI

        const { data: children } = await supabase
            .from('matrix_positions')
            .select('id, user_id, users(username)')
            .eq('parent_id', positionId)
            .eq('status', 'active');

        if (!children) return [];

        const nodes: MatrixNode[] = [];
        for (const child of children as any) {
            nodes.push({
                id: child.id,
                username: child.users.username,
                level: 1,
                children: await buildTree(child.id, depth + 1)
            });
        }
        return nodes;
    };

    useEffect(() => {
        const fetchTree = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            // Fetch Settings
            const { data: setts } = await supabase.from('settings').select('*').single();
            setSettings(setts);

            // 1. Get user's first active position
            const { data: pos } = await supabase
                .from('matrix_positions')
                .select('id, users(username)')
                .eq('user_id', session.user.id)
                .eq('status', 'active')
                .limit(1)
                .single();

            if (pos) {
                const tree = await buildTree(pos.id);
                setRootNode({
                    id: (pos as any).id,
                    username: (pos as any).users.username,
                    level: 1,
                    children: tree
                });

                // Get stats
                const { count } = await supabase
                    .from('matrix_positions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', session.user.id);

                setStats(prev => ({ ...prev, total: count || 1 }));
            }
            setLoading(false);
        };

        fetchTree();
    }, []);

    if (settings && settings.matrix_enabled === false) {
        return (
            <div className="p-6 h-[80vh] flex items-center justify-center">
                <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-orange-100 text-center max-w-xl space-y-6">
                    <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto text-orange-500">
                        <ShieldCheck size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-[#151d48]">Matrix Module Temporarily Offline</h2>
                    <p className="text-gray-500 font-bold leading-relaxed">
                        The Global Matrix system is currently undergoing scheduled maintenance or the launch counter has not yet concluded. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#151d48]">My Matrix Tree</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time visualization of your downline and spillover.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                        <ArrowDown size={14} />
                        <span>Export CSV</span>
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/10">
                        <ShieldCheck size={14} />
                        <span>Verify Chain</span>
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex gap-6 mb-8">
                    {[
                        { label: 'Total Positions', value: stats.total.toString() },
                        { label: 'Active Lines', value: stats.total > 0 ? '1' : '0' },
                        { label: 'Next Cycle', value: stats.total > 0 ? '75%' : '0%' }, // Placeholder for cycle progress
                        { label: 'Matrix Tier', value: stats.level }
                    ].map((stat, i) => (
                        <div key={i} className="flex-1 bg-gray-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-lg font-black text-[#151d48]">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="py-24 text-center font-black text-gray-400 animate-pulse uppercase text-[10px] tracking-widest">
                        Reconstructing Matrix Topology...
                    </div>
                ) : (
                    <>
                        {rootNode && (
                            <div className="mb-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col md:flex-row items-center gap-8">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary shrink-0">
                                    <Zap size={32} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-black text-[#151d48]">Next in Line to Cycle</h3>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[75%] px-4 flex items-center justify-end text-[8px] font-black text-white">75% FILLED</div>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold">Your position @{rootNode.username} is currently at 3/4 spots filled. One more placement and you earn $15.00!</p>
                                </div>
                            </div>
                        )}
                        <MatrixTree root={rootNode} />
                    </>
                )}
            </div>
        </div>
    );
}
