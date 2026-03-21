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
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Module Manager
                </h1>
                <p className="text-gray-400 mt-1">
                    Enable or disable core platform features dynamically. Disabling a module instantly hides it from sidebars and restricts direct access.
                </p>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start space-x-3 mb-6">
                <ShieldAlert className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
                <div className="text-sm text-orange-200">
                    <strong>Note:</strong> Disabling a module does not delete its data. It simply hides the functionality from both users and admins until re-enabled.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.map((module) => {
                    const isEnabled = !!settings[module.key];
                    const isSaving = savingKey === module.key;

                    return (
                        <div 
                            key={module.key}
                            className={`p-5 rounded-xl border transition-all duration-300 ${
                                isEnabled 
                                    ? 'bg-[#1a1f2e] border-gray-800' 
                                    : 'bg-[#151923] border-gray-800/50 opacity-80'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-lg ${
                                    isEnabled 
                                        ? 'bg-orange-500/20 text-orange-400' 
                                        : 'bg-gray-800 text-gray-500'
                                }`}>
                                    <module.icon className="w-5 h-5" />
                                </div>
                                
                                <button
                                    onClick={() => handleToggle(module.key)}
                                    disabled={isSaving}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                                        isEnabled ? 'bg-orange-500' : 'bg-gray-700'
                                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </div>
                            
                            <h3 className={`text-lg font-semibold mb-1 ${isEnabled ? 'text-white' : 'text-gray-400'}`}>
                                {module.title}
                            </h3>
                            <p className="text-sm text-gray-400 line-clamp-2">
                                {module.description}
                            </p>
                            
                            <div className="mt-4 flex items-center text-xs font-medium">
                                <span className={`flex items-center space-x-1.5 ${isEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                                    <span>{isEnabled ? 'Active' : 'Disabled'}</span>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
