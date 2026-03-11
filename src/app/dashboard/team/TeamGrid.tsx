"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Activity, MessageSquare, Zap, Filter } from "lucide-react";

export function TeamGrid({ initialReferrals }: { initialReferrals: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'active', 'free', 'inactive', 'dead_star'

    // Simple client-side filtering
    const filteredReferrals = initialReferrals.filter((ref) => {
        // Search
        const matchesSearch = 
            (ref.username && ref.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (ref.fullName && ref.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (ref.email && ref.email.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status Filter (Mocking since we didn't fetch full statuses from server)
        // In a real scenario, `ref.status` would come from the server
        let paramsStatus = "free"; // Defaulting all to free for mockup purposes unless we build logic
        if (ref.rank === "Active Member" || ref.rank === "Leader") paramsStatus = "active";
        
        let matchesFilter = true;
        if (filter !== "all") {
            matchesFilter = paramsStatus === filter;
        }

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-4">
            {/* Filters & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by username, name, or email..."
                        className="pl-10 rounded-xl bg-white border-none shadow-sm h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar hide-scrollbar">
                    <Button 
                        variant={filter === 'all' ? 'default' : 'outline'} 
                        className={`rounded-xl shrink-0 ${filter === 'all' ? 'bg-[#151d48] hover:bg-blue-900 text-white' : 'bg-white border-transparent'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Members
                    </Button>
                    <Button 
                        variant={filter === 'active' ? 'default' : 'outline'} 
                        className={`rounded-xl shrink-0 ${filter === 'active' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white border-transparent'}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </Button>
                    <Button 
                        variant={filter === 'free' ? 'default' : 'outline'} 
                        className={`rounded-xl shrink-0 ${filter === 'free' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white border-transparent'}`}
                        onClick={() => setFilter('free')}
                    >
                        Free Users
                    </Button>
                    <Button 
                        variant={filter === 'inactive' ? 'default' : 'outline'} 
                        className={`rounded-xl shrink-0 ${filter === 'inactive' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-white border-transparent'}`}
                        onClick={() => setFilter('inactive')}
                    >
                        Inactive
                    </Button>
                    <Button 
                        variant={filter === 'dead_star' ? 'default' : 'outline'} 
                        className={`rounded-xl shrink-0 ${filter === 'dead_star' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white border-transparent'}`}
                        onClick={() => setFilter('dead_star')}
                    >
                        Dead Star
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {filteredReferrals.length === 0 ? (
                <div className="p-10 bg-white rounded-3xl text-center text-gray-400">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold">No referrals found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReferrals.map((user) => (
                        <div key={user.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 flex flex-col group hover:shadow-md transition-all">
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-900 font-black text-xl shrink-0">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#151d48] truncate max-w-[150px]">{user.username}</h3>
                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.fullName || "No name provided"}</p>
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100 shrink-0">
                                    {user.rank === 'Member' ? 'Free' : user.rank}
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-2 opacity-50" />
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Activity className="w-3.5 h-3.5 mr-2 opacity-50" />
                                    Last Active: Unknown
                                </div>
                            </div>
                            
                            <div className="mt-auto flex gap-2 pt-4 border-t border-gray-50">
                                <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-orange-50/50 hover:bg-orange-50 text-orange-600 border-none font-bold">
                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-blue-50/50 hover:bg-blue-50 text-blue-600 border-none font-bold">
                                    <Zap className="w-3.5 h-3.5 mr-1.5" /> Nudge
                                </Button>
                            </div>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Quick helper
function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
