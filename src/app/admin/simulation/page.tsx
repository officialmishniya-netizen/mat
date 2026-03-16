"use client";

import React, { useState } from 'react';
import { Play, Trash2, ShieldAlert, BarChart3, Users, Zap, Terminal, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SimulationDashboard() {
    const [isRunning, setIsRunning] = useState(false);
    const [isWiping, setIsWiping] = useState(false);
    const [config, setConfig] = useState({
        breadth: 2,
        depth: 3,
        levelId: 1,
        watchesPerUser: 5,
        fundAmount: 100
    });

    const handleRunSimulation = async () => {
        setIsRunning(true);
        try {
            const res = await fetch("/api/admin/simulate", {
                method: "POST",
                body: JSON.stringify({ action: "run", config }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Simulation Engine Started Background Job");
            } else {
                toast.error(data.error || "Failed to start simulation");
            }
        } catch (e) {
            toast.error("Network error starting simulation");
        } finally {
            setIsRunning(false);
        }
    };

    const handleWipeData = async () => {
        if (!confirm("CRITICAL: This will delete ALL users with 'sim_' prefix and their history. Proceed?")) return;
        
        setIsWiping(true);
        try {
            const res = await fetch("/api/admin/simulate", {
                method: "POST",
                body: JSON.stringify({ action: "wipe" }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Cleanup Job Dispatched");
            } else {
                toast.error(data.error || "Failed to start cleanup");
            }
        } catch (e) {
            toast.error("Network error starting cleanup");
        } finally {
            setIsWiping(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#f8fafc] min-h-screen">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48] flex items-center gap-3">
                        <Terminal className="text-primary" size={32} />
                        A-to-Z Simulation Engine
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">Stress test the entire platform ecosystem in a sandbox environment.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleWipeData}
                        disabled={isWiping}
                        className="bg-white border-2 border-red-100 text-red-500 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        {isWiping ? <RotateCcw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        WIPE SIM DATA
                    </button>
                    <button 
                        onClick={handleRunSimulation}
                        disabled={isRunning}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isRunning ? <RotateCcw className="animate-spin" size={20} /> : <Play size={20} />}
                        EXECUTE FULL SUITE
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Card */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-black text-[#151d48] flex items-center gap-2">
                        <Zap className="text-yellow-500" size={20} />
                        Parameters
                    </h2>
                    
                    <div className="space-y-4">
                        {[
                            { label: 'Tree Breadth', key: 'breadth', icon: Users, desc: 'Direct referrals per user' },
                            { label: 'Tree Depth', key: 'depth', icon: ShieldAlert, desc: 'N-levels of downline' },
                            { label: 'Matrix Level', key: 'levelId', icon: Play, desc: 'ID of level to stress test' },
                            { label: 'Initial Funding ($)', key: 'fundAmount', icon: BarChart3, desc: 'Initial wallet injection' },
                            { label: 'Ad Velocity', key: 'watchesPerUser', icon: Zap, desc: 'Ads watched per simulation cycle' }
                        ].map((item) => (
                            <div key={item.key} className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                    <item.icon size={12} />
                                    {item.label}
                                </label>
                                <input 
                                    type="number" 
                                    value={config[item.key as keyof typeof config]}
                                    onChange={(e) => setConfig({...config, [item.key]: parseInt(e.target.value)})}
                                    className="w-full bg-gray-50 border-2 border-gray-50 p-4 rounded-2xl font-bold text-[#151d48] focus:border-primary/20 focus:bg-white outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 font-medium px-1">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Simulation Status & Real-time Report */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#1e293b] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Terminal size={120} className="text-white" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    System Pulse
                                </h2>
                                <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black text-white/60 tracking-widest uppercase">
                                    Inngest Orchestration Active
                                </span>
                            </div>

                            <div className="bg-black/20 rounded-3xl p-8 font-mono text-sm text-green-400 space-y-2 min-h-[300px]">
                                <p className="text-white/40 mb-4 font-sans text-xs italic">// Simulation Output Console</p>
                                <p>[SYSTEM] Ready for deployment.</p>
                                <p className="text-green-500/60 "> > Waiting for instruction...</p>
                                {isRunning && (
                                    <>
                                        <p className="animate-pulse text-yellow-400">[JOB] simulation/run.full starting...</p>
                                        <p className="text-white/60">  - Initializing sim_* namespace isolation</p>
                                        <p className="text-white/60">  - Injecting referral topology engine</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coverage Matrix */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Referrals', status: 'Tested', color: 'text-green-500', icon: Users },
                            { label: 'Matrix RPC', status: 'Tested', color: 'text-green-500', icon: Zap },
                            { label: 'Ledger Math', status: 'Tested', color: 'text-blue-500', icon: BarChart3 },
                            { label: 'Cleanup', status: 'Verified', color: 'text-purple-500', icon: Trash2 }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                <item.icon className={`mb-3 ${item.color}`} size={24} />
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1">{item.label}</p>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 size={12} className={item.color} />
                                    <span className="text-xs font-black text-[#151d48]">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
