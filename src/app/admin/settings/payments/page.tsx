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
                active_payment_gateway: settings.active_payment_gateway,
                coinpayments_merchant_id: settings.coinpayments_merchant_id,
                coinpayments_ipn_secret: settings.coinpayments_ipn_secret,
                coinbase_api_key: settings.coinbase_api_key,
                coinbase_webhook_secret: settings.coinbase_webhook_secret,
                withdrawal_fee_percent: settings.withdrawal_fee_percent,
                service_fee_percent: settings.service_fee_percent,
                min_withdrawal_amount: settings.min_withdrawal_amount,
                max_withdrawal_amount: settings.max_withdrawal_amount,
                min_deposit_amount: settings.min_deposit_amount,
                max_deposit_amount: settings.max_deposit_amount,
                nowpayments_sandbox: settings.nowpayments_sandbox,
                auto_withdrawal_enabled: settings.auto_withdrawal_enabled,
                accepted_crypto_methods: settings.accepted_crypto_methods,
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
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Payments Setup
                </h1>
                <p className="text-gray-400 mt-1">
                    Configure your primary payment gateway and financial parameters.
                </p>
            </header>

            <form onSubmit={handleSave} className="space-y-6 pb-20">
                {/* Active Gateway Selection */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl p-8 mb-8 shadow-xl shadow-black/10">
                    <h2 className="text-xl font-black text-white mb-4">Active Payment Gateway</h2>
                    <p className="text-sm text-gray-400 mb-6">Select which gateway will process all deposits and active automated withdrawals.</p>
                    <select
                        value={settings.active_payment_gateway || "nowpayments"}
                        onChange={(e) => setSettings({ ...settings, active_payment_gateway: e.target.value })}
                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-4 text-white font-bold focus:ring-2 focus:ring-orange-500/30 transition-all shadow-inner"
                    >
                        <option value="nowpayments">NOWPayments (Recommended)</option>
                        <option value="coinpayments">CoinPayments (Legacy)</option>
                        <option value="coinbase">Coinbase Commerce</option>
                    </select>
                </div>

                {/* NOWPayments Configuration */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-gray-800 p-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-500/20 rounded-2xl">
                                <Wallet className="w-7 h-7 text-orange-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">NOWPayments Gateway</h2>
                                {settings.active_payment_gateway === "nowpayments" && (
                                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] mt-1 bg-orange-500/10 inline-block px-2 py-0.5 rounded-full border border-orange-500/20">Active Processor</p>
                                )}
                            </div>
                        </div>
                        <a
                            href="https://nowpayments.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800/50 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 transition-all flex items-center space-x-2"
                        >
                            <span>API Dashboard</span>
                            <ExternalLink size={14} />
                        </a>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200 flex items-center justify-between">
                                    <span className="flex items-center space-x-2">
                                        <ShieldCheck size={16} className="text-orange-500" />
                                        <span>Production API Key</span>
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={settings.nowpayments_api_key || ""}
                                    onChange={(e) => setSettings({ ...settings, nowpayments_api_key: e.target.value })}
                                    placeholder="Enter your API key"
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-mono text-sm placeholder:text-slate-600"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200 flex items-center justify-between">
                                    <span className="flex items-center space-x-2">
                                        <AlertCircle size={16} className="text-orange-500" />
                                        <span>IPN Callback Secret</span>
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    value={settings.nowpayments_ipn_secret || ""}
                                    onChange={(e) => setSettings({ ...settings, nowpayments_ipn_secret: e.target.value })}
                                    placeholder="Enter IPN secret"
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-mono text-sm placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">Sandbox Mode</h3>
                                    <p className="text-xs text-slate-500">Enable trial transactions without real funds</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, nowpayments_sandbox: !settings.nowpayments_sandbox })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.nowpayments_sandbox ? 'bg-orange-500' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.nowpayments_sandbox ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-1">Automated Payouts</h3>
                                    <p className="text-xs text-slate-500">Approve withdrawals automatically via API</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSettings({ ...settings, auto_withdrawal_enabled: !settings.auto_withdrawal_enabled })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.auto_withdrawal_enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.auto_withdrawal_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 flex items-start space-x-4">
                            <CheckCircle2 size={24} className="text-orange-400 mt-1" />
                            <div className="text-sm text-gray-400 leading-relaxed w-full">
                                <strong className="text-orange-200 block mb-1">Live Webhook Configuration:</strong>
                                <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-2.5 border border-white/5 mb-3 group cursor-pointer hover:border-orange-500/30 transition-all">
                                    <code className="text-xs text-orange-400 font-mono">
                                        {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/nowpayments
                                    </code>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Copy Endpoint</span>
                                </div>
                                <p className="text-xs">Ensure your IPN secret matches the one in your NOWPayments dashboard to prevent signature verification failures.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CoinPayments Configuration */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-b border-gray-800 p-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <Wallet className="w-7 h-7 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">CoinPayments Gateway</h2>
                                {settings.active_payment_gateway === "coinpayments" && (
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1 bg-blue-500/10 inline-block px-2 py-0.5 rounded-full border border-blue-500/20">Active Processor</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200">Merchant ID</label>
                                <input
                                    type="text"
                                    value={settings.coinpayments_merchant_id || ""}
                                    onChange={(e) => setSettings({ ...settings, coinpayments_merchant_id: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200">IPN Secret</label>
                                <input
                                    type="password"
                                    value={settings.coinpayments_ipn_secret || ""}
                                    onChange={(e) => setSettings({ ...settings, coinpayments_ipn_secret: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coinbase Commerce Configuration */}
                <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-gray-800 p-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                <Wallet className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Coinbase Commerce</h2>
                                {settings.active_payment_gateway === "coinbase" && (
                                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-1 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-full border border-emerald-500/20">Active Processor</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200">API Key</label>
                                <input
                                    type="password"
                                    value={settings.coinbase_api_key || ""}
                                    onChange={(e) => setSettings({ ...settings, coinbase_api_key: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-200">Webhook Secret</label>
                                <input
                                    type="password"
                                    value={settings.coinbase_webhook_secret || ""}
                                    onChange={(e) => setSettings({ ...settings, coinbase_webhook_secret: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Limits & Fees Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Financial Parameters */}
                    <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl p-8 space-y-8 shadow-xl shadow-black/10">
                        <h2 className="text-lg font-black text-white flex items-center space-x-3">
                            <span className="p-2 bg-slate-800 rounded-lg"><RefreshCw size={18} className="text-emerald-400" /></span>
                            <span>Transaction Limits</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min. Withdrawal</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.min_withdrawal_amount}
                                        onChange={(e) => setSettings({ ...settings, min_withdrawal_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max. Withdrawal</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.max_withdrawal_amount}
                                        onChange={(e) => setSettings({ ...settings, max_withdrawal_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min. Deposit</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.min_deposit_amount}
                                        onChange={(e) => setSettings({ ...settings, min_deposit_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max. Deposit</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.max_deposit_amount}
                                        onChange={(e) => setSettings({ ...settings, max_deposit_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fees & Currencies */}
                    <div className="bg-[#1a1f2e] border border-gray-800 rounded-3xl p-8 space-y-8 shadow-xl shadow-black/10">
                        <h2 className="text-lg font-black text-white flex items-center space-x-3">
                            <span className="p-2 bg-slate-800 rounded-lg"><Save size={18} className="text-orange-400" /></span>
                            <span>Fees & Currencies</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Withdrawal Fee (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={settings.withdrawal_fee_percent}
                                        onChange={(e) => setSettings({ ...settings, withdrawal_fee_percent: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Fee (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={settings.service_fee_percent}
                                        onChange={(e) => setSettings({ ...settings, service_fee_percent: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/30 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Crypto Methods</label>
                            <input
                                type="text"
                                value={settings.accepted_crypto_methods}
                                onChange={(e) => setSettings({ ...settings, accepted_crypto_methods: e.target.value })}
                                placeholder="BTC, ETH, USDT, LTC, TRX..."
                                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-slate-600"
                            />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                You can add any assets supported by NOWPayments. Popular: <strong>BTC, ETH, USDT (ERC20/TRC20), LTC, TRX, XRP, BNB, SOL</strong>. Separate with commas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-8 flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black px-10 py-4 rounded-2xl hover:shadow-2xl hover:shadow-orange-500/40 disabled:opacity-50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {saving ? <RefreshCw className="w-6 h-6 animate-spin text-white" /> : <ShieldCheck className="w-6 h-6 text-white" />}
                        <span className="text-lg tracking-tight">{saving ? 'Syncing...' : 'Deploy Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
