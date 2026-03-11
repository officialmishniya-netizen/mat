"use client";

import { useState, useEffect } from "react";
import {
    Bell,
    DollarSign,
    Zap,
    ArrowRight,
    Clock,
    TrendingUp,
    ShieldCheck,
    X
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { formatMoney } from "@/lib/money";

interface Notification {
    id: string;
    type: 'earning' | 'credit' | 'cycle' | 'system';
    title: string;
    description: string;
    amount?: string;
    created_at: string;
    read: boolean;
}

export function Notifications({ isOpen, onClose, currentUserId }: { isOpen: boolean, onClose: () => void, currentUserId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        if (!currentUserId) return;

        // Fetch initial notifications
        fetchNotifications();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('realtime_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUserId}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        const formatted = (data || []).map(n => ({
            id: n.id,
            type: n.type as any,
            title: n.title,
            description: n.description,
            amount: n.amount,
            created_at: n.created_at,
            read: n.is_read
        }));

        setNotifications(formatted);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for mobile */}
            <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}></div>

            <div className="absolute right-0 mt-4 w-full sm:w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-[#151d48] text-white">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-primary" />
                        <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {notifications.filter(n => !n.read).length} New
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUserId).eq('is_read', false).then(() => {
                                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                            });
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors ml-auto mr-4"
                    >
                        Mark All Read
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center opacity-30 italic">
                            <p className="text-sm font-bold text-[#151d48]">No notifications yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={async () => {
                                        if (!notification.read) {
                                            const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
                                            if (!error) {
                                                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                                            }
                                        }
                                    }}
                                    className={`p-5 hover:bg-gray-50/50 transition-colors group cursor-pointer relative ${notification.read ? '' : 'bg-primary/5'}`}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${notification.type === 'earning' ? 'bg-green-50 text-green-600' :
                                            notification.type === 'cycle' ? 'bg-blue-50 text-blue-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                            {notification.type === 'earning' && <DollarSign size={20} />}
                                            {notification.type === 'cycle' && <TrendingUp size={20} />}
                                            {notification.type === 'credit' && <Zap size={20} />}
                                            {notification.type === 'system' && <ShieldCheck size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="text-sm font-black text-[#151d48] truncate pr-4">{notification.title}</h4>
                                                {notification.amount && (
                                                    <span className="text-xs font-black text-green-600">+{formatMoney(notification.amount)}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#737791] font-medium leading-relaxed mb-2">{notification.description}</p>
                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                <Clock size={10} />
                                                <span>{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <div className="hidden group-hover:flex items-center">
                                            <ArrowRight size={14} className="text-primary translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:secondary transition-all">
                        View All Activity
                    </button>
                </div>
            </div>
        </>
    );
}
