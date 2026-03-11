"use client";

import React, { useState } from 'react';
import { Send, Hash, Users, MessageSquare, Info, ShieldAlert, Smile, MoreVertical } from 'lucide-react';

export default function TeamChatPage() {
    const [message, setMessage] = useState('');
    const rooms = [
        { id: '1', name: 'Global Matrix Line', active: true, unread: 0 },
        { id: '2', name: 'Level 1 Upline', active: false, unread: 5 },
        { id: '3', name: 'Direct Downline', active: false, unread: 2 },
    ];

    const messages = [
        { user: 'admin', text: 'Welcome to the Global Matrix Line chat! Stay profitable.', time: '09:00 AM', isMe: false },
        { user: 'crypto_king', text: 'Just cycled! $45 payout received instantly.', time: '10:15 AM', isMe: false },
        { user: 'matrix_alpha', text: 'Who wants to join my next pool? Looking for 5 people.', time: '10:42 AM', isMe: false },
        { user: 'me', text: 'Im in! Sending the deposit now.', time: '10:45 AM', isMe: true },
    ];

    return (
        <div className="p-6 h-[calc(100vh-120px)]">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 h-full flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-50 flex flex-col bg-gray-50/30">
                    <div className="p-8">
                        <h2 className="text-xl font-black text-[#151d48] mb-6">Team Chat</h2>
                        <div className="space-y-2">
                            {rooms.map((room) => (
                                <button
                                    key={room.id}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${room.active ? 'bg-white shadow-lg shadow-primary/10 border-2 border-primary/10 text-[#151d48]' : 'hover:bg-white/50 text-gray-400'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${room.active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Hash size={18} />
                                        </div>
                                        <span className="font-bold text-sm">{room.name}</span>
                                    </div>
                                    {room.unread > 0 && (
                                        <div className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                            {room.unread}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto p-8 border-t border-gray-100">
                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                            <ShieldAlert size={16} className="text-amber-600 mt-0.5" />
                            <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                                Moderated by AI. No spam, no external links, and respect all matrix members.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#151d48]">Global Matrix Line</h3>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 1,240 Online
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><Info size={20} /></button>
                            <button className="p-2.5 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">@{msg.user}</span>
                                        <span className="text-[9px] text-gray-300 font-bold">{msg.time}</span>
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm font-medium ${msg.isMe ? 'bg-[#151d48] text-white rounded-tr-none shadow-lg shadow-blue-950/20' : 'bg-gray-50 text-[#444a6d] rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                        <div className="bg-white rounded-[2rem] p-2 pr-2 border border-gray-200 shadow-sm flex items-center gap-2 group focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary transition-all">
                            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                                <Smile size={20} />
                            </button>
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#151d48] px-2"
                            />
                            <button className="bg-primary text-white p-4 rounded-[1.5rem] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
