"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/lib/settings";
import { toast } from "react-hot-toast";
import {
    RefreshCw,
    Smartphone,
    Save,
    BellRing,
    Settings,
    Download
} from "lucide-react";

export default function MobileSettingsPage() {
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
            toast.error("Failed to load settings");
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
                mobile_app_maintenance: settings.mobile_app_maintenance,
                mobile_min_version: settings.mobile_min_version,
                mobile_latest_version: settings.mobile_latest_version,
                onesignal_app_id: settings.onesignal_app_id,
                onesignal_rest_key: settings.onesignal_rest_key,
                play_store_url: settings.play_store_url,
                app_store_url: settings.app_store_url,
            });

            if (success) {
                toast.success("Mobile settings updated!");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update mobile settings");
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header>
                <h1 className="text-3xl font-black text-[#151d48] tracking-tight flex items-center space-x-3">
                    <Smartphone className="w-8 h-8 text-[#5d5fef]" />
                    <span>Mobile App Management</span>
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    Configure your official iOS and Android applications, deploy forced updates, and manage mobile push notifications.
                </p>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* App Operations */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                        <h2 className="text-lg font-bold text-[#151d48] flex items-center space-x-2">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span>Application Operations</span>
                        </h2>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-amber-900 mb-1">App Maintenance Mode</h3>
                                <p className="text-sm text-amber-700/80">Blocks all mobile API endpoints with a maintenance screen.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, mobile_app_maintenance: !settings.mobile_app_maintenance })}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.mobile_app_maintenance ? 'bg-amber-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.mobile_app_maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Version</label>
                                <input
                                    type="text"
                                    value={settings.mobile_min_version || ""}
                                    onChange={(e) => setSettings({ ...settings, mobile_min_version: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5d5fef]/30 font-mono text-sm"
                                    placeholder="1.0.0"
                                />
                                <p className="text-[10px] text-gray-400">Forces update if lower</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Version</label>
                                <input
                                    type="text"
                                    value={settings.mobile_latest_version || ""}
                                    onChange={(e) => setSettings({ ...settings, mobile_latest_version: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5d5fef]/30 font-mono text-sm"
                                    placeholder="1.1.0"
                                />
                                <p className="text-[10px] text-gray-400">Shows optional update</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-[#151d48] flex items-center space-x-2">
                                <Download className="w-4 h-4 text-gray-400" />
                                <span>Store Links</span>
                            </h3>
                            <div>
                                <input
                                    type="text"
                                    value={settings.play_store_url || ""}
                                    onChange={(e) => setSettings({ ...settings, play_store_url: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5d5fef]/30 text-sm mb-3"
                                    placeholder="https://play.google.com/store/apps/details?id=com.yourapp"
                                />
                                <input
                                    type="text"
                                    value={settings.app_store_url || ""}
                                    onChange={(e) => setSettings({ ...settings, app_store_url: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5d5fef]/30 text-sm"
                                    placeholder="https://apps.apple.com/app/id123456789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Push Notifications (OneSignal) */}
                    <div className="bg-[#1a1f2e] rounded-3xl p-8 shadow-xl shadow-black/10 border border-gray-800 space-y-8">
                        <div className="flex items-center space-x-4 border-b border-gray-800 pb-6">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <BellRing className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">OneSignal Push API</h2>
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Cross-platform Notifications</p>
                            </div>
                        </div>

                        <div className="space-y-4 pb-4">
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Integrate OneSignal to blast automatic push notifications straight to your users' lock screens when they cycle, receive funds, or get marketing updates!
                            </p>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">OneSignal App ID</label>
                                <input
                                    type="text"
                                    value={settings.onesignal_app_id || ""}
                                    onChange={(e) => setSettings({ ...settings, onesignal_app_id: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/30 text-sm text-white font-mono"
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">REST API Key</label>
                                <input
                                    type="password"
                                    value={settings.onesignal_rest_key || ""}
                                    onChange={(e) => setSettings({ ...settings, onesignal_rest_key: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/30 text-sm text-white font-mono"
                                    placeholder="Enter backend push key..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky bottom-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#151d48] hover:bg-[#202c6b] text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-[#151d48]/20 flex items-center space-x-3 transition-colors disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        <span className="text-lg">Deploy Configurations</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
