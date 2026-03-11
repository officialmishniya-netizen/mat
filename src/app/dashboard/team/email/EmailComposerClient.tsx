"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Eye, Clock, History, PenTool, Braces } from "lucide-react";
import toast from "react-hot-toast";

export function EmailComposerClient({ initialHistory }: { initialHistory: any[] }) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [filter, setFilter] = useState("all");
    const [history, setHistory] = useState(initialHistory);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Tokens
    const tokens = ["{{username}}", "{{fullName}}", "{{rank}}"];
    
    const insertToken = (token: string) => {
        setBody(prev => prev + token);
    };

    const handleSend = async () => {
        if (!subject || !body) {
            toast.error("Subject and message body are required.");
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch('/api/team/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    body,
                    recipientFilter: filter
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Email sent to your team!");
                setSubject("");
                setBody("");
                setHistory([data.email, ...history]);
            } else {
                toast.error(data.error || "Failed to send email");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setIsSending(false);
        }
    };

    const loadTemplate = () => {
        setSubject("Welcome to the team! Action required.");
        setBody("Hello {{username}},\n\nI noticed you joined recently. To maximize your earnings, make sure to watch your daily PTC ads. If you need a recommended plan, let me know!\n\nBest,\nYour Sponsor");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Composer */}
            <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-[#151d48] flex items-center">
                        <PenTool className="w-5 h-5 mr-2 text-primary" />
                        Compose Message
                    </h2>
                    <Button variant="outline" size="sm" onClick={loadTemplate} className="text-xs font-bold rounded-xl h-8 text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100">
                        Load Template
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">To</label>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-100">
                                <SelectValue placeholder="Select Recipient Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Referrals</SelectItem>
                                <SelectItem value="active">Active Members Only</SelectItem>
                                <SelectItem value="free">Free Signups Only</SelectItem>
                                <SelectItem value="inactive">Inactive (&gt; 7 days)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Subject</label>
                        <Input 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Announcing our new team strategy..."
                            className="h-11 rounded-xl bg-gray-50 border-gray-100 placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Message Body</label>
                            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar hide-scrollbar">
                                {tokens.map(t => (
                                    <button 
                                        key={t}
                                        type="button"
                                        onClick={() => insertToken(t)}
                                        className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors flex items-center shrink-0"
                                    >
                                        <Braces className="w-3 h-3 mr-1" /> {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Textarea 
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your email here..."
                            rows={8}
                            className="resize-none rounded-xl bg-gray-50 border-gray-100 placeholder:text-gray-400 p-4"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                        <Button 
                            onClick={handleSend} 
                            disabled={isSending || !subject || !body}
                            className="flex-1 rounded-xl h-12 bg-[#151d48] hover:bg-blue-900 text-white font-bold"
                        >
                            {isSending ? 'Sending...' : <><Send className="w-4 h-4 mr-2" /> Send Now</>}
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="w-12 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 p-0 flex items-center justify-center shrink-0"
                            title="Toggle Preview"
                        >
                            <Eye className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Right: Live Preview & History */}
            <div className="space-y-6 flex flex-col h-full">
                
                {/* Live Preview Pane */}
                {isPreviewMode && (
                    <Card className="rounded-3xl border-none shadow-sm shadow-orange-900/5 bg-white overflow-hidden flex flex-col shrinks-0">
                        <div className="bg-orange-500 text-white p-3 px-6 flex items-center justify-between shadow-sm">
                            <h3 className="font-bold flex items-center text-sm">
                                <Eye className="w-4 h-4 mr-2" /> Live Preview
                            </h3>
                            <button onClick={() => setIsPreviewMode(false)} className="text-white/80 hover:text-white">Close</button>
                        </div>
                        <div className="p-6 bg-gray-50 flex-1">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-h-[300px] overflow-y-auto">
                                <div className="border-b border-gray-100 pb-4 mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Subject</p>
                                    <h4 className="font-black text-gray-900">{subject || "No Subject"}</h4>
                                    <p className="text-xs text-gray-400 mt-2">To: {filter === 'all' ? 'All Referrals' : filter}</p>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                    {body ? (
                                        body
                                            .replace(/{{username}}/g, 'JohnDoe123')
                                            .replace(/{{fullName}}/g, 'John Doe')
                                            .replace(/{{rank}}/g, 'Active Member')
                                    ) : (
                                        <span className="text-gray-300 italic">Start typing to see preview...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* History Table */}
                <Card className="rounded-3xl border-none shadow-sm shadow-gray-900/5 bg-white p-6 flex-1 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                        <h3 className="text-lg font-black text-[#151d48] flex items-center">
                            <History className="w-5 h-5 mr-2 text-gray-500" />
                            Email History
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                        {history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <History className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-bold">No emails sent yet.</p>
                                <p className="text-xs text-gray-400 mt-1">Compose your first message to engage your team.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((email: any) => (
                                    <div key={email.id} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors group">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-bold text-[#151d48] truncate pr-4">{email.subject}</h4>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${
                                                email.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                                {email.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3 truncate">{email.body.substring(0, 100)}...</p>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-3 border-t border-gray-50">
                                            <span className="flex items-center">
                                                <Eye className="w-3.5 h-3.5 mr-1" /> To: {email.recipientFilter}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1" /> {new Date(email.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
