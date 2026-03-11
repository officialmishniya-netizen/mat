"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Share2, Copy, Sparkles, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export function ProofCardsClient({ currentUser, totalEarned }: { currentUser: any, totalEarned: number }) {
    const [amount, setAmount] = useState(totalEarned > 0 ? totalEarned.toFixed(2) : "50.00");
    const [template, setTemplate] = useState("dark"); // dark, light, orange
    const [captionIndex, setCaptionIndex] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const captions = [
        `Just hit $${amount} in passive income with MatClick! 🚀 It's fully automated and free to join. Check out my link in bio to start earning today! #PassiveIncome #PTC #Crypto`,
        `Another milestone reached! 💸 Earning daily with MatClick has been a game-changer. Want to learn how? Join my team for free: [Your Link] #EarnOnline #SideHustle`,
        `Who said making money online was hard? Simply clicking ads and building a team on MatClick got me to $${amount}! Join my network and let's grow together 📈 #TeamBuilding`
    ];

    const handleDownload = () => {
        // In a real implementation, you would use html2canvas or similar to render `cardRef.current`
        // For now, we simulate success
        toast.success("Ready to share! (Take a screenshot to save your card)");
    };

    const copyCaption = () => {
        navigator.clipboard.writeText(captions[captionIndex]);
        toast.success("Caption copied to clipboard!");
    };

    const getBgStyle = () => {
        if (template === 'dark') return "bg-gradient-to-br from-[#151d48] to-blue-900 text-white";
        if (template === 'light') return "bg-gradient-to-br from-white to-blue-50 text-[#151d48] border-2 border-blue-100";
        if (template === 'orange') return "bg-gradient-to-br from-orange-500 to-red-500 text-white";
        return "bg-[#151d48] text-white";
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Card Editor */}
            <div className="space-y-6">
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <h2 className="text-xl font-black text-[#151d48] mb-6 flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2 text-primary" />
                        Customize Card
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Amount to Display ($)</label>
                            <Input 
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="h-11 rounded-xl bg-gray-50 border-gray-100 font-black text-lg text-[#151d48]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Select Theme</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setTemplate('dark')}
                                    className={`h-24 rounded-2xl bg-gradient-to-br from-[#151d48] to-blue-900 border-4 transition-all ${template === 'dark' ? 'border-orange-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                ></button>
                                <button
                                    onClick={() => setTemplate('light')}
                                    className={`h-24 rounded-2xl bg-gradient-to-br from-white to-blue-50 border-4 transition-all shadow-sm ${template === 'light' ? 'border-orange-500 scale-105' : 'border-gray-100 opacity-80 hover:opacity-100'}`}
                                ></button>
                                <button
                                    onClick={() => setTemplate('orange')}
                                    className={`h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 border-4 transition-all ${template === 'orange' ? 'border-[#151d48] scale-105' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                ></button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <Button 
                                onClick={handleDownload}
                                className="w-full h-12 bg-[#151d48] hover:bg-blue-900 text-white rounded-xl font-bold"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download Proof Image
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Captions */}
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-[#151d48] flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
                            Quick Captions
                        </h2>
                        <div className="flex gap-1">
                            {captions.map((_, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCaptionIndex(idx)}
                                    className={`w-3 h-3 rounded-full ${captionIndex === idx ? 'bg-orange-500' : 'bg-gray-200'}`}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <Textarea 
                            readOnly
                            value={captions[captionIndex]}
                            className="bg-gray-50 border-gray-100 rounded-xl resize-none min-h-[120px] p-4 text-sm text-gray-700 pr-12"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={copyCaption}
                            className="absolute right-2 top-2 text-gray-400 hover:text-blue-600 bg-white shadow-sm border border-gray-100 rounded-lg"
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right: Preview Canvas */}
            <div className="flex items-center justify-center bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
                
                {/* Visual Card (Square aspect ratio for social media) */}
                <div 
                    ref={cardRef}
                    className={`w-full max-w-[400px] aspect-square rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden ${getBgStyle()}`}
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-[0.03] rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

                    {/* Top */}
                    <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-xl shadow-inner border border-white/30">
                                {currentUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Earning Proof</p>
                                <p className="font-black">@{currentUser.username}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Middle: Amount */}
                    <div className="text-center z-10 py-8">
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-2">Total Earned</p>
                        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-md flex items-start justify-center">
                            <span className="text-3xl sm:text-4xl mt-2 opacity-80">$</span>
                            {amount}
                        </h1>
                    </div>

                    {/* Bottom: CTA */}
                    <div className="z-10 bg-black/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                        <div>
                            <p className="font-black text-sm">MatClick Matrix</p>
                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-0.5">Automated Earnings</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${template === 'light' ? 'bg-[#151d48] text-white' : 'bg-white text-[#151d48]'}`}>
                            Link in Bio
                        </div>
                    </div>
                </div>

            </div>
            
        </div>
    );
}
