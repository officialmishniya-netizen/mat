"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Save, Globe, Eye, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export function ReferralPageClient({ currentUser }: { currentUser: any }) {
    const [title, setTitle] = useState(`Join ${currentUser.username}'s Team`);
    const [welcomeMessage, setWelcomeMessage] = useState("I'm looking for motivated individuals to join my PTC Nexus network. Let's grow together!");
    const [showContact, setShowContact] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const refLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${currentUser.username}`;

    const handleSave = () => {
        setIsSaving(true);
        // Mock save for now
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Referral page settings saved!");
        }, 1000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(refLink);
        toast.success("Referral link copied!");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Editor */}
            <div className="space-y-6">
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <h2 className="text-xl font-black text-[#151d48] mb-6 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-primary" />
                        Page Settings
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Your Public Link</label>
                            <div className="flex bg-gray-50 rounded-xl border border-gray-100 p-1">
                                <div className="flex-1 px-3 py-2 text-sm text-gray-600 truncate font-mono">
                                    {refLink}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    className="shrink-0 h-9 rounded-lg hover:bg-white text-blue-600 font-bold"
                                    onClick={copyLink}
                                >
                                    <Copy className="w-4 h-4 mr-2" /> Copy
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="shrink-0 h-9 rounded-lg hover:bg-white text-orange-600 font-bold ml-1"
                                    onClick={() => window.open(refLink, '_blank')}
                                >
                                    <Eye className="w-4 h-4 mr-2" /> View
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Page Title</label>
                            <Input 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="h-11 rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Welcome Message</label>
                            <Textarea 
                                value={welcomeMessage}
                                onChange={e => setWelcomeMessage(e.target.value)}
                                rows={4}
                                className="resize-none rounded-xl bg-gray-50 border-gray-100"
                            />
                            <p className="text-xs text-gray-400 mt-2">Appears prominently on your landing page to convert visitors.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <Button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full h-12 bg-[#151d48] hover:bg-blue-900 text-white rounded-xl font-bold"
                            >
                                {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Live Preview */}
            <div>
                <Card className="rounded-3xl border-none shadow-sm shadow-orange-900/5 bg-gray-50 p-6 h-full flex flex-col">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center shrink-0">
                        <Eye className="w-4 h-4 mr-2" /> Live Preview
                    </h3>

                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col items-center justify-center text-center p-8 relative">
                        {/* Mock Landing Page UI */}
                        <div className="w-full max-w-sm space-y-6 pointer-events-none">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-900 font-black text-3xl shadow-sm">
                                {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                            
                            <div>
                                <h1 className="text-2xl font-black text-[#151d48] mb-3">{title || "Your Title Here"}</h1>
                                <p className="text-gray-500 text-sm leading-relaxed">{welcomeMessage || "Your compelling welcome message will appear here."}</p>
                            </div>

                            <div className="pt-6">
                                <div className="h-12 w-full bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold opacity-90 shadow-lg shadow-orange-500/20">
                                    Join {currentUser.username}'s Team
                                </div>
                                <p className="text-xs text-gray-400 mt-3">Powered by PTC Nexus</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            
        </div>
    );
}
