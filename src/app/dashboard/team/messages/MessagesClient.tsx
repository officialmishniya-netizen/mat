"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, Sparkles, MoreVertical, MessageSquare } from "lucide-react";

export function MessagesClient({ currentUser, initialContacts }: { currentUser: any, initialContacts: any[] }) {
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredContacts = initialContacts.filter(c => 
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.fullName && c.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Fetch messages when component mounts
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('/api/team/messages');
                const data = await res.json();
                if (data.messages) {
                    setMessages(data.messages);
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };
        fetchMessages();
    }, []);

    // Scroll to bottom when new message added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeContact]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        const optimisticMessage = {
            id: Date.now().toString(),
            content: newMessage,
            senderId: currentUser.id,
            recipientId: activeContact.id,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");

        try {
            await fetch('/api/team/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: activeContact.id,
                    content: optimisticMessage.content
                })
            });
        } catch (err) {
            console.error("Failed to send message", err);
            // Revert optimistic update in real app
        }
    };

    const templates = [
        "Welcome to the team! 👋 Let me know if you need any help getting started.",
        "Hey! Don't forget to click your daily ads to trigger your cycle bonuses. ⚡",
        "Great job on your recent progress! Keep up the momentum. 🔥"
    ];

    const activeMessages = messages.filter(
        m => (m.senderId === currentUser.id && m.recipientId === activeContact?.id) || 
             (m.senderId === activeContact?.id && m.recipientId === currentUser.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div className="flex h-full bg-white md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Left Pane - Contacts */}
            <div className={`w-full md:w-80 flex flex-col border-r border-gray-100 ${activeContact ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-black text-[#151d48] mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            placeholder="Search contacts..." 
                            className="pl-9 bg-gray-50 border-none rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredContacts.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            No contacts found
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <button 
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                                    activeContact?.id === contact.id ? 'bg-orange-50' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-900 font-black text-lg">
                                        {contact.avatarUrl.charAt(0).toUpperCase()}
                                    </div>
                                    {contact.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className={`font-bold truncate ${activeContact?.id === contact.id ? 'text-orange-900' : 'text-[#151d48]'}`}>
                                            {contact.username}
                                        </h3>
                                        <span className="text-[10px] text-gray-400 font-bold shrink-0 ml-2">
                                            {contact.isSponsor ? 'Sponsor' : 'Referral'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        Tap to view messages
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane - Chat */}
            <div className={`flex-1 flex flex-col bg-gray-50/50 ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden shrink-0 -ml-2"
                                    onClick={() => setActiveContact(null)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </Button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-900 font-black text-lg shrink-0">
                                    {activeContact.avatarUrl.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-[#151d48]">{activeContact.username}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {activeContact.isOnline ? (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online now</>
                                        ) : (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Offline</>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-400">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {activeMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                                        <MessageSquare className="w-8 h-8 text-blue-300" />
                                    </div>
                                    <h4 className="font-bold text-[#151d48] mb-1">Say Hello!</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">Start a conversation with {activeContact.username}. Use a quick template below to break the ice.</p>
                                </div>
                            ) : (
                                activeMessages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div 
                                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                                    isMe 
                                                        ? 'bg-[#151d48] text-white rounded-tr-none shadow-sm shadow-blue-900/10' 
                                                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1 font-bold">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Composer */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            {/* Templates */}
                            <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar hide-scrollbar">
                                {templates.map((t, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setNewMessage(t)}
                                        className="shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-xs font-bold text-gray-600 rounded-lg whitespace-nowrap transition-colors flex items-center border border-gray-100"
                                    >
                                        <Sparkles className="w-3 h-3 mr-1 text-orange-400" /> {t.substring(0, 30)}...
                                    </button>
                                ))}
                            </div>
                            
                            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                                <Input 
                                    className="flex-1 bg-gray-50 border-none rounded-xl pr-12 focus-visible:ring-1 focus-visible:ring-gray-200"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <Button 
                                    type="submit" 
                                    size="icon"
                                    disabled={!newMessage.trim()}
                                    className={`absolute right-1 top-1 bottom-1 w-8 h-8 rounded-lg shadow-sm transition-all ${
                                        newMessage.trim() 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-50 flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#151d48] mb-2">No Contact Selected</h3>
                        <p className="text-gray-500 max-w-xs">Choose a sponsor or referral from the left pane to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
