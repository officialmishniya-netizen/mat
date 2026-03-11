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

export default function GroupChat({ currentUserId, channelId, channelName }: { currentUserId: string, channelId: string, channelName: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*, users(username, role)")
                .eq("channel_id", channelId)
                .order("created_at", { ascending: false })
                .limit(50);

            if (data) setMessages(data.reverse());
        };
        fetchMessages();

        const channel = supabase
            .channel(`chat:${channelId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, async (payload) => {
                const { data: userData } = await supabase.from("users").select("username, role").eq("id", payload.new.user_id).single();
                const newMsg = { ...payload.new, users: userData } as Message;
                setMessages((prev) => [...prev, newMsg]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [channelId]);

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
            channel_id: channelId
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[500px]">
            <div className="p-4 border-b bg-blue-50 rounded-t-lg flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-blue-900">{channelName}</h2>
                    <p className="text-xs text-blue-600">End-to-End Encrypted Team Chat</p>
                </div>
                <span className="text-2xl">🛡️</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => {
                    const isMe = msg.user_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline space-x-2 mb-1">
                                <span className="text-xs font-bold text-gray-600">@{msg.users?.username || 'Unknown'}</span>
                                <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
                            </div>
                            <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">Start planning with your team!</div>
                )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your strategy..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={!input} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-full hover:bg-opacity-90 disabled:opacity-50">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
