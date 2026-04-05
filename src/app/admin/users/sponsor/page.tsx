"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    UserPlus,
    RefreshCw,
    Link as LinkIcon,
    AlertTriangle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { changeSponsor } from "@/app/actions/adminUserManagement";
import { toast } from "react-hot-toast";

export default function AdminSponsorManagerPage() {
    const [loading, setLoading] = useState(true);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newSponsorUsername, setNewSponsorUsername] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        // Fetch users along with their current sponsor's username
        const { data, error } = await supabase
            .rpc('get_users_with_sponsors'); // This RPC might not exist, fallback to direct query

        if (error) {
            // Fallback: Direct query if RPC fails
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, username, sponsor_id, created_at')
                .order('username');

            if (usersError) {
                toast.error("Failed to load users");
            } else {
                setUsersList(usersData || []);
            }
        } else {
            setUsersList(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateSponsor = async () => {
        if (!selectedUser || !newSponsorUsername) return;

        setProcessing(true);
        const res = await changeSponsor(selectedUser.id, newSponsorUsername);
        if (res.success) {
            toast.success(`Sponsor updated for @${selectedUser.username}`);
            setSelectedUser(null);
            setNewSponsorUsername('');
            fetchData();
        } else {
            toast.error((res as any).error || "Failed to update sponsor");
        }
        setProcessing(false);
    };

    const filteredUsers = usersList.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48]">Sponsor Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Rebuild team structures by modifying user referral bonds.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm w-64"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User List */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-black text-[#151d48] flex items-center gap-2">
                            <Users size={18} className="text-primary" />
                            Directory
                        </h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                                    <th className="px-8 py-4">User</th>
                                    <th className="px-8 py-4">Current Sponsor ID</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${selectedUser?.id === u.id ? 'bg-primary/5' : ''}`}>
                                        <td className="px-8 py-4 font-bold text-[#151d48]">@{u.username}</td>
                                        <td className="px-8 py-4 text-xs font-mono text-gray-400">{u.sponsor_id || 'NONE'}</td>
                                        <td className="px-8 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedUser(u)}
                                                className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                                            >
                                                Edit Sponsor
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Section */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-8">
                        <h3 className="font-black text-[#151d48] flex items-center gap-2 mb-6">
                            <LinkIcon size={20} className="text-primary" />
                            Structure Editor
                        </h3>

                        {selectedUser ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Editing User</p>
                                    <h4 className="text-xl font-black text-[#151d48]">@{selectedUser.username}</h4>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">{selectedUser.id}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Sponsor Username</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. admin or none"
                                        value={newSponsorUsername}
                                        onChange={(e) => setNewSponsorUsername(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold"
                                    />
                                    <p className="text-[10px] text-gray-400 italic mt-1">Type 'none' to remove current sponsor.</p>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                    <p className="text-xs text-amber-700 leading-relaxed font-bold">
                                        Changing a sponsor will immediately alter the downline tree for all matrix and matching bonus calculations.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setSelectedUser(null); setNewSponsorUsername(''); }}
                                        className="flex-1 py-4 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateSponsor}
                                        disabled={processing || !newSponsorUsername}
                                        className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        {processing ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Update Link
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="p-5 bg-gray-50 rounded-full text-gray-300">
                                    <UserPlus size={40} strokeWidth={1} />
                                </div>
                                <p className="text-sm font-bold text-gray-400 max-w-[200px]">
                                    Select a user from the directory to modify their sponsorship.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
