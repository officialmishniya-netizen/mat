"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MessageSquare,
    Search,
    Filter,
    RefreshCw,
    Clock,
    AlertCircle,
    CheckCircle2,
    MessageCircle,
    ChevronRight,
    User
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function AdminTicketsPage() {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [filter, setFilter] = useState('open');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        let query = supabase
            .from('tickets')
            .select('*, users(username, email)')
            .order('updated_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            toast.error("Failed to load tickets");
        } else {
            setTickets(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-50 text-green-600 border-green-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'closed': return 'bg-gray-50 text-gray-400 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-400';
        }
    };

    const filteredTickets = tickets.filter(t =>
        (t.users?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Support Desk</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage user inquiries, technical issues, and billing support.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchTickets} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm w-64"
                            placeholder="Search subject or user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><MessageCircle size={24} /></div>
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Open Tickets</p>
                    <h3 className="text-3xl font-black text-[#151d48] mt-1">{tickets.filter(t => t.status === 'open').length}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={24} /></div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Waiting</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pending Reply</p>
                    <h3 className="text-3xl font-black text-[#151d48] mt-1">{tickets.filter(t => t.status === 'pending').length}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><AlertCircle size={24} /></div>
                        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Urgent</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">High Priority</p>
                    <h3 className="text-3xl font-black text-red-600 mt-1">{tickets.filter(t => t.priority === 'high' && t.status !== 'closed').length}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gray-50 text-gray-400 rounded-2xl"><CheckCircle2 size={24} /></div>
                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Archive</span>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Resolved Today</p>
                    <h3 className="text-3xl font-black text-gray-400 mt-1">0</h3>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl w-fit border border-gray-100">
                {['open', 'pending', 'closed', 'all'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${filter === tab
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
                                <th className="px-8 py-5">Ticket / Subject</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Priority</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-300 font-bold">
                                        <div className="flex flex-col items-center gap-3">
                                            <MessageSquare size={48} strokeWidth={1} />
                                            <p>No support tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/admin/tickets/${t.id}`}>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[#151d48] group-hover:text-primary transition-colors">{t.subject}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{t.category} • #{t.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-bold text-[#444a6d]">@{t.users?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500 animate-pulse' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(t.priority)}`}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(t.updated_at).toLocaleString()}</span>
                                                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                            </div>
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
