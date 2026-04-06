"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    User,
    ShieldCheck,
    Clock,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        // Fetch ticket details
        const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*, users(username, email)')
            .eq('id', ticketId)
            .single();

        if (ticketError) {
            toast.error("Ticket not found");
            router.push('/admin/tickets');
            return;
        }

        setTicket(ticketData);

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            toast.error("Failed to load conversation");
        } else {
            setMessages(messagesData || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (ticketId) fetchData();
    }, [ticketId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendReply = async () => {
        if (!reply.trim() || sending) return;

        setSending(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Insert message
        const { error: msgError } = await supabase
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: session.user.id,
                message: reply,
                is_admin: true
            });

        if (msgError) {
            toast.error("Failed to send reply");
        } else {
            // Update ticket status to open/pending
            await supabase
                .from('tickets')
                .update({ status: 'pending', updated_at: new Date().toISOString() })
                .eq('id', ticketId);

            setReply('');
            fetchData();
        }
        setSending(false);
    };

    const updateStatus = async (status: string) => {
        const { error } = await supabase
            .from('tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        if (error) {
            toast.error("Failed to update status");
        } else {
            toast.success(`Ticket marked as ${status}`);
            fetchData();
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
            <RefreshCw className="animate-spin" size={32} />
            <p className="font-bold uppercase tracking-widest text-xs">Loading SECURE Communication...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            {/* Header */}
            <header className="p-8 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/admin/tickets')} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all hover:text-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-[#151d48]">{ticket.subject}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ticket.status === 'open' ? 'bg-green-50 text-green-600 border-green-100' :
                                    ticket.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                {ticket.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">
                            Opened by <span className="text-primary">@{ticket.users?.username}</span> • {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {ticket.status !== 'closed' ? (
                        <button onClick={() => updateStatus('closed')} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <CheckCircle2 size={18} /> Close Ticket
                        </button>
                    ) : (
                        <button onClick={() => updateStatus('open')} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <RefreshCw size={18} /> Reopen Ticket
                        </button>
                    )}
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-[#f8f9fa]" ref={scrollRef}>
                {messages.map((m) => (
                    <div key={m.id} className={`flex gap-6 ${m.is_admin ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${m.is_admin ? 'bg-gray-900 text-white' : 'bg-white text-primary'}`}>
                            {m.is_admin ? <ShieldCheck size={20} /> : <User size={20} />}
                        </div>
                        <div className={`space-y-2 ${m.is_admin ? 'text-right' : ''}`}>
                            <div className={`p-6 rounded-3xl shadow-sm text-sm leading-relaxed border ${m.is_admin
                                    ? 'bg-white border-gray-100 text-[#444a6d]'
                                    : 'bg-primary text-white border-primary/10'
                                }`}>
                                {m.message}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {m.is_admin ? 'Official Representative' : `@${ticket.users?.username}`} • {new Date(m.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Area */}
            {ticket.status !== 'closed' && (
                <div className="p-8 bg-white border-t border-gray-100">
                    <div className="relative ">
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-8 pr-32 py-6 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-bold text-[#444a6d]"
                            placeholder="Type your official response here..."
                            rows={2}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                        />
                        <button
                            onClick={handleSendReply}
                            disabled={!reply.trim() || sending}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div className="flex justify-center mt-4 gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                            <ShieldCheck size={14} /> End-to-End Encrypted
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Clock size={14} /> Reply typically sent within 24h
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
