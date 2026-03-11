"use client";

import { useState, useEffect, useRef } from "react";
import {
    X,
    Send,
    MessageSquare,
    User,
    Loader2,
    Smile
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface ShoutMessage {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    users: {
        username: string;
        role: string;
    };
}

export function Shoutbox({ isOpen, onClose, currentUserId }: { isOpen: boolean, onClose: () => void, currentUserId: string }) {
    const [messages, setMessages] = useState<ShoutMessage[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const subscription = supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                    // Fetch the user data for the new message
                    fetchNewMessage(payload.new.id);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, users(username, role)')
            .eq('channel_id', 'public')
            .order('created_at', { ascending: true })
            .limit(50);

        if (!error && data) {
            setMessages(data as any);
        }
    };

    const fetchNewMessage = async (id: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, users(username, role)')
            .eq('id', id)
            .single();

        if (!error && data) {
            setMessages(prev => [...prev, data as any]);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || loading) return;

        setLoading(true);
        const { error } = await supabase
            .from('messages')
            .insert({
                content: content.trim(),
                user_id: currentUserId,
                channel_id: 'public'
            });

        if (!error) {
            setContent("");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="p-6 bg-[#151d48] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <MessageSquare size={20} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="font-black text-lg tracking-tight">Community Shout</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Live Global Chat</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe]"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic">
                        <p className="text-sm font-bold text-[#151d48]">No shouts yet. Be the first!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.user_id === currentUserId ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black shadow-inner overflow-hidden border border-gray-200">
                                {msg.users?.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={`space-y-1 max-w-[75%] ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                                <div className={`flex flex-col ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] font-black text-[#151d48] mb-0.5 truncate max-w-full">
                                        @{msg.users?.username}
                                        {msg.users?.role === 'admin' && (
                                            <span className="ml-1 text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase">Admin</span>
                                        )}
                                    </span>
                                    <div className={`p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.user_id === currentUserId
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white border border-gray-100 text-[#444a6d] rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <form onSubmit={handleSendMessage} className="relative group">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Say something to the world..."
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-5 pr-14 font-bold text-[#151d48] placeholder:text-gray-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                    />
                    <button
                        disabled={!content.trim() || loading}
                        className="absolute right-2 top-2 w-11 h-11 bg-[#151d48] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:secondary active:scale-90 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary cursor-pointer transition-colors pt-1">
                        <Smile size={20} />
                    </div>
                </form>
                <div className="mt-4 flex items-center justify-center gap-4">
                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Community Rules Apply</p>
                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
