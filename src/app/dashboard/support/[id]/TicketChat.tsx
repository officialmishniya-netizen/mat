"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send,
    User,
    ShieldCheck,
    Loader2,
    AlertCircle
} from "lucide-react";

interface Message {
    id: string;
    content: string;
    is_admin: boolean;
    created_at: string;
    user_id: string;
}

interface TicketChatProps {
    ticketId: string;
    initialMessages: Message[];
    currentUserId: string;
}

export function TicketChat({ ticketId, initialMessages, currentUserId }: TicketChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || loading) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/support/tickets/${ticketId}`, {
                method: "POST",
                body: JSON.stringify({ content }),
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Failed to send message");

            // Optimistic update or just refresh
            const newMessage: Message = {
                id: Math.random().toString(),
                content,
                is_admin: false,
                created_at: new Date().toISOString(),
                user_id: currentUserId
            };

            setMessages([...messages, newMessage]);
            setContent("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-[#fcfdfe]"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <MessageCircle size={48} className="mb-4" />
                        <p className="font-bold text-sm">No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.is_admin ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${msg.is_admin ? 'bg-primary text-white' : 'bg-[#151d48] text-white'}`}>
                                    {msg.is_admin ? <ShieldCheck size={20} /> : <User size={20} />}
                                </div>
                                <div className="space-y-1">
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${msg.is_admin ? 'bg-white border border-gray-100 text-[#151d48] rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                                        {msg.content}
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-wider text-gray-400 ${msg.is_admin ? 'text-left' : 'text-right'}`}>
                                        {msg.is_admin ? 'Support Team' : 'You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-50">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Type your message here..."
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 pl-6 pr-16 font-bold text-[#151d48] placeholder:text-gray-300 focus:bg-white focus:border-primary/20 transition-all outline-none resize-none min-h-[60px]"
                        rows={1}
                    ></textarea>
                    <button
                        type="submit"
                        disabled={!content.trim() || loading}
                        className="absolute right-3 top-3 w-10 h-10 bg-[#151d48] text-white rounded-xl shadow-lg shadow-blue-900/20 hover:secondary active:scale-90 transition-all flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
                <p className="text-[10px] font-bold text-gray-400 mt-3 text-center uppercase tracking-widest">Shift + Enter for new line</p>
            </div>
        </div>
    );
}

// Missing import fix
import { MessageCircle } from "lucide-react";
