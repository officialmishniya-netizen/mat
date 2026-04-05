"use client";

import React, { useState } from 'react';
import {
    User,
    Lock,
    Smartphone,
    Bitcoin,
    Coins,
    Banknote,
    ShieldCheck,
    Save,
    AlertCircle,
    CheckCircle2,
    Bell
} from 'lucide-react';
import { updateProfileAction, updatePasswordAction } from '@/app/actions/profile';

export default function ProfileForm({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData(e.currentTarget);
        const result = await updateProfileAction(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData(e.currentTarget);
        const result = await updatePasswordAction(formData);

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: "Password updated successfully!" });
            e.currentTarget.reset();
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General & Wallet Info */}
            <div className="space-y-6">
                <form onSubmit={handleProfileUpdate} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#151d48]">General Information</h3>
                            <p className="text-[#737791] text-xs font-bold uppercase tracking-widest">Update your details and wallets</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    name="full_name"
                                    type="text"
                                    defaultValue={user.full_name || ''}
                                    placeholder="Enter your full name"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 px-4 text-sm font-bold text-[#151d48] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Phone Number</label>
                                <input
                                    name="phone"
                                    type="text"
                                    defaultValue={user.phone || ''}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 px-4 text-sm font-bold text-[#151d48] transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Email Address (for Notifications)</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={user.email || ''}
                                    placeholder="your@email.com"
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 px-4 text-sm font-bold text-[#151d48] transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Bell size={16} className="text-primary" />
                                <h4 className="text-xs font-black text-[#151d48] uppercase tracking-[2px]">Notification Preferences</h4>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-[#151d48]">Email Notifications</p>
                                    <p className="text-[10px] text-[#737791] font-bold uppercase tracking-widest">Receive alerts for earnings and cycles</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="email_notifications_enabled"
                                        value="true"
                                        defaultChecked={user.email_notifications_enabled}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#151d48]"></div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={16} className="text-primary" />
                                <h4 className="text-xs font-black text-[#151d48] uppercase tracking-[2px]">Withdrawal Wallets</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Bitcoin (BTC)</label>
                                    <div className="relative">
                                        <Bitcoin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                                        <input
                                            name="btc_address"
                                            type="text"
                                            defaultValue={user.btc_address || ''}
                                            placeholder="Enter BTC address"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold font-mono text-[#151d48] transition-all outline-none underline-offset-4 decoration-dashed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Litecoin (LTC)</label>
                                    <div className="relative">
                                        <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                                        <input
                                            name="ltc_address"
                                            type="text"
                                            defaultValue={user.ltc_address || ''}
                                            placeholder="Enter LTC address"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold font-mono text-[#151d48] transition-all outline-none underline-offset-4 decoration-dashed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">USDT (TRC20)</label>
                                    <div className="relative">
                                        <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" />
                                        <input
                                            name="usdt_trc20_address"
                                            type="text"
                                            defaultValue={user.usdt_trc20_address || ''}
                                            placeholder="Enter USDT TRC20 address"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold font-mono text-[#151d48] transition-all outline-none underline-offset-4 decoration-dashed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">TRON (TRX)</label>
                                    <div className="relative">
                                        <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                                        <input
                                            name="trx_address"
                                            type="text"
                                            defaultValue={user.trx_address || ''}
                                            placeholder="Enter TRX address"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold font-mono text-[#151d48] transition-all outline-none underline-offset-4 decoration-dashed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#151d48] text-white font-black py-4 rounded-3xl mt-10 shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        <Save size={20} />
                        Update Profile
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
                <form onSubmit={handlePasswordUpdate} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[#151d48]">Security Settings</h3>
                            <p className="text-[#737791] text-xs font-bold uppercase tracking-widest">Keep your account safe</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">New Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 px-4 text-sm font-bold text-[#151d48] transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#737791] uppercase tracking-widest pl-1">Confirm Password</label>
                            <input
                                name="confirm_password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 px-4 text-sm font-bold text-[#151d48] transition-all outline-none"
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-white border-2 border-red-500/20 text-red-500 font-black py-4 rounded-3xl mt-4 hover:bg-red-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            <Save size={20} />
                            Change Password
                        </button>
                    </div>
                </form>

                {/* Status Message */}
                {message.text && (
                    <div className={`p-5 rounded-[2rem] border-2 flex items-center gap-4 animate-in slide-in-from-right-4 duration-500 ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight">{message.text}</p>
                    </div>
                )}

                {/* Account Status Info */}
                <div className="bg-[#151d48] rounded-[32px] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                        <ShieldCheck size={64} />
                    </div>
                    <h3 className="text-xl font-black mb-2 relative z-10">Account Verified</h3>
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest leading-relaxed relative z-10">
                        Your account is fully active. Make sure your wallets are up to date before requesting a withdrawal.
                    </p>
                </div>
            </div>
        </div>
    );
}
