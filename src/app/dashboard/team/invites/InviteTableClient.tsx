"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarClock, Send, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export function InviteTableClient({ referrals }: { referrals: any[] }) {
    
    const handleRecommendPlan = (username: string) => {
        toast.success(`Sent Ad Plan recommendation to ${username}`);
    };

    const handleSetFollowUp = (username: string) => {
        toast.success(`Follow-up reminder set for ${username}`);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th scope="col" className="px-6 py-4 rounded-tl-xl font-black tracking-widest text-[#151d48]">User</th>
                        <th scope="col" className="px-6 py-4 font-black tracking-widest text-[#151d48]">Joined Date</th>
                        <th scope="col" className="px-6 py-4 font-black tracking-widest text-[#151d48]">Status</th>
                        <th scope="col" className="px-6 py-4 rounded-tr-xl font-black tracking-widest text-[#151d48] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {referrals.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                No referrals yet. Create a tracking link to start promoting!
                            </td>
                        </tr>
                    ) : (
                        referrals.map((user) => (
                            <tr key={user.id} className="bg-white border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-[#151d48] whitespace-nowrap flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-red-50 flex items-center justify-center text-orange-600 font-black shrink-0">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p>{user.username}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Score: 10</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                        user.rank === 'Member' 
                                            ? 'bg-gray-50 text-gray-500 border-gray-200' 
                                            : 'bg-green-50 text-green-600 border-green-200'
                                    }`}>
                                        {user.rank === 'Member' ? 'Free Signup' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 font-bold"
                                        onClick={() => handleSetFollowUp(user.username)}
                                    >
                                        <CalendarClock className="w-3.5 h-3.5 mr-1.5" /> Follow-up
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 font-bold"
                                        onClick={() => handleRecommendPlan(user.username)}
                                    >
                                        <Send className="w-3.5 h-3.5 mr-1.5" /> Recommend Plan
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
