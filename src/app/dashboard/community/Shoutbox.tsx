"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    users?: { username: string, role: string };
};

export default function GlobalShoutbox({ currentUserId }: { currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*, users(username, role)")
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) setMessages(data.reverse());
        };
        fetchMessages();

        // 2. Subscribe to real-time inserts
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                // Fetch user data for the new message
                const { data: userData } = await supabase.from("users").select("username, role").eq("id", payload.new.user_id).single();
                const newMsg = { ...payload.new, users: userData } as Message;
                setMessages((prev) => [...prev, newMsg]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageContent = input.trim();
        setInput("");

        await supabase.from("messages").insert({
            user_id: currentUserId,
            content: messageContent,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h2 className="font-bold text-gray-800">Global Shoutbox</h2>
                <p className="text-xs text-gray-500">Live chat with the matrix community</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => {
                    const isMe = msg.user_id === currentUserId;
                    const isAdmin = msg.users?.role === 'admin';
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline space-x-2 mb-1">
                                <span className={`text-xs font-bold ${isAdmin ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isAdmin && '⭐ '}@{msg.users?.username || 'Unknown'}
                                </span>
                                <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">No messages yet. Be the first to say hello!</div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        maxLength={255}
                    />
                    <button type="submit" disabled={!input} className="bg-primary text-white font-bold px-6 py-2 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-opacity">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
