"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/settings";
import { toast } from "react-hot-toast";
import {
    Wallet,
    Save,
    RefreshCw,
    ShieldCheck,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from "lucide-react";

export default function PaymentsSetupPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getSiteSettings();
            setSettings(data);
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Failed to load payment settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        try {
            const success = await updateSiteSettings({
                nowpayments_api_key: settings.nowpayments_api_key,
                nowpayments_ipn_secret: settings.nowpayments_ipn_secret,
                withdrawal_fee_percent: settings.withdrawal_fee_percent,
                service_fee_percent: settings.service_fee_percent,
            });

            if (success) {
                toast.success("Payment settings updated successfully");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update payment settings");
        } finally {
            setSaving(false);
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
        <div className="max-w-4xl space-y-8">
            <header>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Payments Setup
                </h1>
                <p className="text-gray-400 mt-1">
                    Configure your primary payment gateway and financial parameters.
                </p>
            </header>

            <form onSubmit={handleSave} className="space-y-6">
                {/* NOWPayments Configuration */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="bg-orange-500/10 border-b border-gray-800 p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Wallet className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">NOWPayments Gateway</h2>
                                <p className="text-xs text-orange-200/60 font-medium uppercase tracking-wider">Active Gateway</p>
                            </div>
                        </div>
                        <a
                            href="https://nowpayments.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center space-x-1"
                        >
                            <span>Dashboard</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                                    <span>API Key</span>
                                    <ShieldCheck size={14} className="text-orange-500" />
                                </label>
                                <input
                                    type="password"
                                    value={settings.nowpayments_api_key || ""}
                                    onChange={(e) => setSettings({ ...settings, nowpayments_api_key: e.target.value })}
                                    placeholder="Enter your API key"
                                    className="w-full bg-[#151923] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-sm"
                                />
                                <p className="text-[10px] text-gray-500 italic">Found in NOWPayments → Store Settings → API Keys</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-300 flex items-center space-x-2">
                                    <span>IPN Secret</span>
                                    <AlertCircle size={14} className="text-orange-500" />
                                </label>
                                <input
                                    type="password"
                                    value={settings.nowpayments_ipn_secret || ""}
                                    onChange={(e) => setSettings({ ...settings, nowpayments_ipn_secret: e.target.value })}
                                    placeholder="Enter IPN secret"
                                    className="w-full bg-[#151923] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono text-sm"
                                />
                                <p className="text-[10px] text-gray-500 italic">Used to verify instant payment notifications (IPN)</p>
                            </div>
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 flex items-start space-x-3">
                            <CheckCircle2 size={18} className="text-orange-400 mt-0.5" />
                            <div className="text-sm text-gray-400 leading-relaxed">
                                <strong className="text-orange-200">Webhook URL:</strong><br />
                                <code className="text-xs bg-black/40 px-2 py-0.5 rounded mt-1 inline-block">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/nowpayments
                                </code>
                                <p className="mt-2">Enable IPN in your NOWPayments dashboard and set the URL above to receive automated payment confirmations.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Parameters */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                        <span>Fee Configuration</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Withdrawal Fee (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.withdrawal_fee_percent}
                                    onChange={(e) => setSettings({ ...settings, withdrawal_fee_percent: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-[#151923] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Service Fee (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.service_fee_percent}
                                    onChange={(e) => setSettings({ ...settings, service_fee_percent: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-[#151923] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50 transition-all"
                    >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
