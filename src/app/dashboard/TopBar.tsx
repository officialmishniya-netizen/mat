"use client";

import { useState, useEffect } from "react";
import {
    Bell,
    MessageSquare,
    Zap,
    TrendingUp,
    ChevronDown,
    Search,
    User,
    LogOut,
    ShieldCheck,
    BellOff
} from "lucide-react";
import Link from "next/link";
import { Shoutbox } from "./Shoutbox";
import { Notifications } from "./Notifications";
import { formatMoney } from "@/lib/money";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface TopBarProps {
    user: any;
    dailyViews: number;
    dailyLimit: number;
}

export function TopBar({ user, dailyViews, dailyLimit }: TopBarProps) {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [shoutboxOpen, setShoutboxOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);

        if (user?.id) {
            fetchUnreadCount();

            // Subscribe to real-time changes for notification count
            const channel = supabase
                .channel('topbar_notifications')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    () => {
                        fetchUnreadCount();
                    }
                )
                .subscribe();

            return () => {
                window.removeEventListener("scroll", handleScroll);
                supabase.removeChannel(channel);
            };
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [user?.id]);

    const fetchUnreadCount = async () => {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error && count !== null) {
            setUnreadCount(count);
        }
    };

    const remainingAds = Math.max(0, dailyLimit - dailyViews);
    const progressPercent = dailyLimit > 0 ? (dailyViews / dailyLimit) * 100 : 0;

    return (
        <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
            <div className="flex h-20 items-center justify-between px-6 lg:px-10">
                {/* Search / Breadcrumbs Area */}
                <div className="hidden md:flex items-center flex-1 max-w-md">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search earnings, matrix..."
                            className="w-full bg-gray-100/50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4 lg:space-x-7">

                    {/* Daily Ad Progress Pulse */}
                    <div className="hidden sm:flex items-center space-x-4 bg-white/40 backdrop-blur-xl px-5 py-2.5 rounded-[2rem] border border-white/20 shadow-xl shadow-orange-500/5 group hover:shadow-orange-500/10 transition-all cursor-pointer">
                        <div className="relative w-11 h-11 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                                <circle
                                    cx="22" cy="22" r="18"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    className="text-gray-100/50"
                                />
                                <circle
                                    cx="22" cy="22" r="18"
                                    fill="transparent"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="4"
                                    strokeDasharray={113}
                                    strokeDashoffset={113 - (progressPercent * 1.13)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#ea580c" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <Zap className="absolute text-orange-500 animate-pulse" size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#737791] group-hover:text-[#151d48] transition-colors">Daily Pulse</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-[#151d48] tracking-tight">{remainingAds}</span>
                                <span className="text-[10px] font-bold text-[#a0a8b9]">LEFT</span>
                            </div>
                        </div>
                    </div>

                    {/* Notification Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className={`relative p-3 rounded-2xl border transition-all duration-500 group ${notificationsOpen ? 'bg-[#151d48] text-white border-[#151d48] shadow-2xl shadow-blue-900/40' : 'bg-white text-[#444a6d] border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5'}`}
                        >
                            <Bell size={20} className={notificationsOpen ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <Notifications
                            isOpen={notificationsOpen}
                            onClose={() => setNotificationsOpen(false)}
                            currentUserId={user.id}
                        />
                    </div>

                    {/* Shoutbox Toggle */}
                    <button
                        onClick={() => setShoutboxOpen(!shoutboxOpen)}
                        className={`p-3.5 rounded-2xl shadow-2xl transition-all duration-500 active:scale-90 group ${shoutboxOpen ? 'bg-primary text-white shadow-primary/30 rotate-12' : 'bg-gradient-to-br from-[#151d48] to-[#2a3c7a] text-white shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5'}`}
                    >
                        <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                    </button>

                    <Shoutbox
                        isOpen={shoutboxOpen}
                        onClose={() => setShoutboxOpen(false)}
                        currentUserId={user.id}
                    />

                    {/* Divider */}
                    <div className="hidden sm:block h-10 w-[1.5px] bg-gray-100 rounded-full mx-2"></div>

                    {/* User Profile Summary */}
                    <Link href="/dashboard/profile" className="flex items-center space-x-4 pl-2 group bg-gray-50/50 hover:bg-white p-1.5 pr-4 rounded-[2rem] border border-transparent hover:border-gray-100 transition-all duration-500">
                        <div className="w-11 h-11 bg-primary/10 rounded-2xl border border-primary/20 p-0.5 group-hover:rotate-6 transition-all shadow-inner">
                            <div className="w-full h-full bg-[#151d48] rounded-[14px] flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:bg-primary transition-colors">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col">
                            <span className="text-sm font-black text-[#151d48] group-hover:text-primary transition-colors">@{user.username}</span>
                            <div className="flex items-center gap-1">
                                <ShieldCheck size={10} className="text-green-500" />
                                <span className="text-[10px] font-black text-[#737791] uppercase tracking-[0.1em]">{user.role}</span>
                            </div>
                        </div>
                    </Link>

                </div>
            </div>
        </header>
    );
}
