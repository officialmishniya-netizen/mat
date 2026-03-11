"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye, BookOpen, GraduationCap, Link as LinkIcon, Activity } from "lucide-react";
import toast from "react-hot-toast";

export function TrainingHubClient({ currentUser }: { currentUser: any }) {
    const trainingLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/training/${currentUser.username}`;

    const copyLink = () => {
        navigator.clipboard.writeText(trainingLink);
        toast.success("Training link copied!");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Link & Stats */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-3xl border-none shadow-sm shadow-orange-900/5 bg-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100px] z-0"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-[#151d48] mb-2 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-primary" />
                            Your Training Hub
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">Share this link with your downline to provide them with starter guides and tips.</p>

                        <div className="flex bg-gray-50 rounded-xl border border-gray-100 p-1 mb-4">
                            <div className="flex-1 px-3 py-2 text-xs text-gray-600 truncate font-mono flex items-center">
                                <LinkIcon className="w-3 h-3 mr-2 opacity-50" />
                                {trainingLink}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                onClick={copyLink}
                                className="flex-1 h-11 bg-[#151d48] hover:bg-blue-900 text-white rounded-xl font-bold"
                            >
                                <Copy className="w-4 h-4 mr-2" /> Copy Link
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => window.open(trainingLink, '_blank')}
                                className="w-11 h-11 rounded-xl border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-0 flex flex-col items-center justify-center shrink-0"
                            >
                                <Eye className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Engagement Stats
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                            <div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-0.5">Total Views</p>
                                <p className="text-2xl font-black text-blue-900">124</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-green-50/50 border border-green-100/50">
                            <div>
                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-0.5">Modules Completed</p>
                                <p className="text-2xl font-black text-green-900">42</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right Col: Manage Content */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-[#151d48]">Training Modules</h2>
                            <p className="text-sm text-gray-500">Manage what your referrals see on your training page.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl h-10 border-gray-200 font-bold text-[#151d48]">
                            + Add Module
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between bg-gray-50/50 group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                                    <span className="font-black text-lg">1</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#151d48]">Getting Started with MatClick</h4>
                                    <p className="text-xs text-gray-500">The basics of clicking ads and earning.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Published</span>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">Edit</Button>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between bg-gray-50/50 group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-sm shrink-0">
                                    <span className="font-black text-lg">2</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#151d48]">How to Upgrade and Cycle</h4>
                                    <p className="text-xs text-gray-500">Explaining the matrix and ad packs.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Published</span>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">Edit</Button>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between bg-gray-50/50 group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                                    <span className="font-black text-lg">3</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-500">Advanced Promotional Strategies</h4>
                                    <p className="text-xs text-gray-400">Using social media and tracking links.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Draft</span>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">Edit</Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
