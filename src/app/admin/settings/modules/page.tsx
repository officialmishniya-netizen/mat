"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/settings";
import { toast } from "react-hot-toast";
import {
    Activity,
    MousePointerClick,
    Wallet,
    MessageSquare,
    PlayCircle,
    TrendingUp,
    Store,
    Trophy,
    Award,
    MessageCircle,
    RefreshCw,
    ShieldAlert
} from "lucide-react";

type ModuleConfig = {
    key: keyof SiteSettings;
    title: string;
    description: string;
    icon: React.ElementType;
};

const MODULES: ModuleConfig[] = [
    {
        key: 'enable_matrix_module',
        title: 'Network Matrix',
        description: 'Multi-tier matrix placement and rewards system.',
        icon: Activity
    },
    {
        key: 'enable_ptc_module',
        title: 'PTC Ads Network',
        description: 'Paid-to-click advertisement system for users.',
        icon: MousePointerClick
    },
    {
        key: 'enable_finance_module',
        title: 'Wallet & Finance',
        description: 'Deposits, withdrawals, transfers, and internal ledgers.',
        icon: Wallet
    },
    {
        key: 'enable_shoutbox_module',
        title: 'Public Shoutbox',
        description: 'Real-time public chat on the user dashboard.',
        icon: MessageSquare
    },
    {
        key: 'enable_team_chat_module',
        title: 'Team Chat',
        description: 'Private team/downline messaging system.',
        icon: MessageCircle
    },
    {
        key: 'enable_roi_module',
        title: 'ROI Investments',
        description: 'Investment packages with daily returns.',
        icon: TrendingUp
    },
    {
        key: 'enable_marketplace_module',
        title: 'Marketplace',
        description: 'User-to-user marketplace for items and services.',
        icon: Store
    },
    {
        key: 'enable_contests_module',
        title: 'Contests',
        description: 'Competitive leaderboards and prize distributions.',
        icon: Trophy
    },
    {
        key: 'enable_achievements_module',
        title: 'Achievements',
        description: 'Milestone badges and rewards for users.',
        icon: Award
    },
    {
        key: 'enable_simulation_module',
        title: 'Matrix Simulator',
        description: 'Admin tool for simulating matrix placements & payouts.',
        icon: PlayCircle
    }
];

export default function ModuleSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Failed to load module settings");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key: keyof SiteSettings) => {
        if (!settings) return;

        const newValue = !settings[key];

        setSavingKey(key);
        setSettings(prev => prev ? { ...prev, [key]: newValue } : null);

        try {
            const success = await updateSiteSettings({ [key]: newValue });
            if (success) {
                toast.success(`Module ${newValue ? 'enabled' : 'disabled'} successfully`);
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Error updating module:", error);
            toast.error("Failed to update module state");
            // Revert on error
            setSettings(prev => prev ? { ...prev, [key]: !newValue } : null);
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">
                    Module Manager
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    Enable or disable core platform features dynamically. Disabling a module instantly hides it from sidebars and restricts direct access.
                </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-4 mb-8 shadow-sm">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-sm text-amber-900 leading-relaxed">
                    <strong className="block text-amber-950 font-bold mb-0.5">Administrative Note</strong>
                    Disabling a module does not delete its data. It simply hides the functionality from both users and admins until re-enabled for maintenance or staged rollout.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULES.map((module) => {
                    const isEnabled = !!settings[module.key];
                    const isSaving = savingKey === module.key;

                    return (
                        <div
                            key={module.key}
                            className={`group p-6 rounded-3xl border transition-all duration-300 shadow-sm ${isEnabled
                                    ? 'bg-[#0f172a] border-slate-800'
                                    : 'bg-white border-slate-200 opacity-90'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl transition-colors ${isEnabled
                                        ? 'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <module.icon className="w-6 h-6" />
                                </div>

                                <button
                                    onClick={() => handleToggle(module.key)}
                                    disabled={isSaving}
                                    className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${isEnabled ? 'bg-orange-500' : 'bg-slate-300'
                                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${isEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            <h3 className={`text-xl font-bold mb-2 transition-colors ${isEnabled ? 'text-white' : 'text-slate-800'}`}>
                                {module.title}
                            </h3>
                            <p className={`text-sm leading-relaxed transition-colors ${isEnabled ? 'text-slate-300' : 'text-slate-500'}`}>
                                {module.description}
                            </p>

                            <div className="mt-6 flex items-center justify-between">
                                <div className={`flex items-center space-x-2 text-xs font-black uppercase tracking-wider ${isEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${isEnabled ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                                    <span>{isEnabled ? 'Operational' : 'Inactive'}</span>
                                </div>

                                {isSaving && (
                                    <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
