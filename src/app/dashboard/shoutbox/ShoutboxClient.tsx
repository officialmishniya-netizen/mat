"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, Smile, Users } from "lucide-react";
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

export default function ShoutboxClient({ currentUserId }: { currentUserId: string }) {
    const [messages, setMessages] = useState<ShoutMessage[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        fetchMessages();
        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                fetchNewMessage(payload.new.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, users(username, role)')
            .eq('channel_id', 'public')
            .order('created_at', { ascending: false })
            .limit(100);

        if (!error && data) {
            // Reverse so oldest is at top, newest at bottom for natural chat flow
            setMessages((data as any).reverse());
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

    return (
        <div className="flex flex-col h-full bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-[#151d48] text-white flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5">
                        <MessageSquare size={28} className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Global Shoutbox</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-sm font-bold uppercase tracking-widest text-blue-200">Live Community Feed</span>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 relative z-10">
                    <Users size={18} className="text-blue-300" />
                    <span className="text-sm font-bold text-blue-100">Public Channel</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-gray-50/50"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic">
                        <p className="text-lg font-bold text-[#151d48]">No shouts yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.user_id === currentUserId ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2`}
                        >
                            <div className="w-12 h-12 bg-gray-200 rounded-2xl shrink-0 flex items-center justify-center text-lg font-black shadow-inner overflow-hidden border-2 border-white text-[#151d48]">
                                {msg.users?.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={`space-y-1 max-w-[80%] ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                                <div className={`flex flex-col ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs font-black text-[#737791] mb-1 truncate px-1">
                                        @{msg.users?.username}
                                        {msg.users?.role === 'admin' && (
                                            <span className="ml-2 text-[10px] bg-red-100/80 text-red-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
                                        )}
                                    </span>
                                    <div className={`p-4 rounded-[20px] text-[15px] font-medium leading-relaxed shadow-sm ${msg.user_id === currentUserId
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white border border-gray-100 text-[#444a6d] rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 mt-1.5 px-1 uppercase tracking-widest">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 sm:p-8 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSendMessage} className="relative group max-w-4xl mx-auto">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts with the community..."
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[24px] py-4 sm:py-5 pl-6 pr-20 text-base font-bold text-[#151d48] placeholder:text-gray-400 focus:bg-white focus:border-primary/30 focus:shadow-[0_0_0_4px_rgba(67,24,255,0.05)] transition-all outline-none"
                    />
                    <div className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#151d48] cursor-pointer transition-colors p-2">
                        <Smile size={24} />
                    </div>
                    <button
                        disabled={!content.trim() || loading}
                        className="absolute right-3 top-3 bottom-3 w-12 sm:w-14 bg-[#151d48] text-white rounded-[18px] shadow-lg shadow-blue-900/10 hover:bg-primary active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-[#151d48]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="translate-x-[-1px]" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
