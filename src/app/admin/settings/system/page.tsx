"use client";

import { useState } from "react";
import { syncDatabaseSchema, verifyDatabaseIntegrity } from "@/app/actions/system";
import { toast } from "react-hot-toast";
import {
    Database,
    RefreshCw,
    ShieldAlert,
    CheckCircle2,
    Activity,
    HardDrive,
    Terminal,
    ChevronRight,
    Zap
} from "lucide-react";

export default function SystemManagerPage() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [integrityStatus, setIntegrityStatus] = useState<{ success: boolean, message: string } | null>(null);
    const [syncOutput, setSyncOutput] = useState<string | null>(null);

    const handleSync = async () => {
        if (!confirm("Are you sure you want to sync the schema? This will update your Supabase database directly.")) return;

        setIsSyncing(true);
        try {
            const result = await syncDatabaseSchema();
            if (result.success) {
                toast.success(result.message);
                setSyncOutput(result.output || "Done.");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An unexpected error occurred during sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCheck = async () => {
        setIsChecking(true);
        try {
            const result = await verifyDatabaseIntegrity();
            setIntegrityStatus(result);
            if (result.success) {
                toast.success("Database integrity verified");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Integrity check failed");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <header>
                <h1 className="text-2xl font-black text-white flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Database className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span>System & Database Manager</span>
                </h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Manage your platform core architecture and synchronize Supabase schema.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Sync Card */}
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20 group">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <Zap className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">Dev Tool</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Schema Push</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Automatically synchronize your latest Drizzle schema with the live Supabase database.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-4 rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/30 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {isSyncing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                            <span>{isSyncing ? "Syncing..." : "Run Database Sync"}</span>
                        </button>
                    </div>
                </div>

                {/* Integrity Check Card */}
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <ShieldAlert className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full">Integrity Check</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Platform Health</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Verify that 100% of required database tables and relations are correctly provisioned.
                        </p>
                        <button
                            onClick={handleCheck}
                            disabled={isChecking}
                            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black py-4 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {isChecking ? <Activity className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
                            <span>{isChecking ? "Checking..." : "Inspect Database"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(integrityStatus || syncOutput) && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="border-b border-slate-800 p-6 flex items-center space-x-3">
                        <Terminal size={18} className="text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">System Output Logs</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        {integrityStatus && (
                            <div className={`p-6 rounded-2xl border ${integrityStatus.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <div className="flex items-center space-x-4">
                                    {integrityStatus.success ? <CheckCircle2 className="text-emerald-400" /> : <ShieldAlert className="text-red-400" />}
                                    <div>
                                        <p className={`font-bold ${integrityStatus.success ? 'text-emerald-200' : 'text-red-200'}`}>
                                            {integrityStatus.success ? "Database OK" : "Critical Mismatch Error"}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{integrityStatus.message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {syncOutput && (
                            <div className="bg-black/50 p-6 rounded-2xl border border-slate-800 font-mono text-xs">
                                <pre className="text-emerald-400 whitespace-pre-wrap">{syncOutput}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Warning Box */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-start space-x-4">
                <ShieldAlert size={24} className="text-amber-500 mt-1 shrink-0" />
                <div className="text-sm text-amber-200/80 leading-relaxed">
                    <strong className="text-amber-400 block mb-1">Production Warning:</strong>
                    Direct schema synchronization should be handled with care in production environments. Ensure you have a recent database snapshot before running "Schema Push" during peak traffic.
                </div>
            </div>
        </div>
    );
}
