"use client";

import React, { useState } from 'react';
import { CalendarClock, ShieldCheck, ArrowRight, Save, History, Bell, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/context";
import { updateWithdrawalSchedule } from "@/app/actions/finance";

export default function WithdrawalSchedulePage() {
    const { t } = useTranslation();
    const [isEnabled, setIsEnabled] = useState(false);
    const [frequency, setFrequency] = useState('weekly');
    const [amountType, setAmountType] = useState('fixed');
    const [fixedAmount, setFixedAmount] = useState('50.00');
    const [threshold, setThreshold] = useState('100.00');
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateWithdrawalSchedule({
                enabled: isEnabled,
                frequency,
                amount_type: amountType as 'fixed' | 'all',
                fixed_amount: fixedAmount,
                threshold,
                gateway: 'any' // Default or user preference
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to save schedule");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(err.message || "Failed to save schedule");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <header>
                <h1 className="text-2xl font-bold text-[#151d48]">Withdrawal Scheduling</h1>
                <p className="text-gray-500 text-sm mt-1">Automate your payouts so you never have to worry about manual requests.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#151d48]">Enable Automation</h2>
                                    <p className="text-xs text-gray-400">Payer status: {isEnabled ? 'Active' : 'Paused'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEnabled(!isEnabled)}
                                className={`w-14 h-7 rounded-full transition-colors relative ${isEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isEnabled ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className={`space-y-8 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <section>
                                <label className="block text-sm font-bold text-[#444a6d] mb-3">Payout Frequency</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['weekly', 'biweekly', 'monthly'].map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => setFrequency(freq)}
                                            className={`p-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${frequency === freq ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 text-gray-400'}`}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <label className="block text-sm font-bold text-[#444a6d] mb-3">Amount Strategy</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" checked={amountType === 'fixed'} onChange={() => setAmountType('fixed')} className="accent-primary w-4 h-4" />
                                        <span className="text-sm font-bold text-[#444a6d]">Fixed Amount</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="radio" checked={amountType === 'all'} onChange={() => setAmountType('all')} className="accent-primary w-4 h-4" />
                                        <span className="text-sm font-bold text-[#444a6d]">All Available</span>
                                    </label>
                                </div>
                                {amountType === 'fixed' && (
                                    <div className="mt-4 relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            value={fixedAmount}
                                            onChange={(e) => setFixedAmount(e.target.value)}
                                            className="w-full bg-gray-50 pl-8 pr-4 py-3 rounded-xl border border-gray-100 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                )}
                            </section>

                            <section>
                                <label className="block text-sm font-bold text-[#444a6d] mb-1">Safety Threshold</label>
                                <p className="text-[11px] text-gray-400 mb-3">Only withdraw if balance exceeds this amount.</p>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        value={threshold}
                                        onChange={(e) => setThreshold(e.target.value)}
                                        className="w-full bg-gray-50 pl-8 pr-4 py-3 rounded-xl border border-gray-100 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </section>

                            <button
                                onClick={handleSave}
                                disabled={isSaving || success}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all ${success ? 'bg-green-500 text-white' : 'bg-[#151d48] text-white hover:scale-[1.01] active:scale-[0.99] shadow-blue-900/10'}`}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
                                <span>{success ? 'Saved Successfully' : 'Save Schedule'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-primary rounded-2xl p-6 text-white shadow-xl">
                        <CalendarClock size={28} className="mb-4 text-white/50" />
                        <h3 className="font-bold mb-1">Next Expected Run</h3>
                        <p className="text-3xl font-black mb-4">Friday, Mar 14</p>
                        <div className="text-xs bg-white/20 p-3 rounded-lg flex items-center space-x-2">
                            <ShieldCheck size={14} />
                            <span>Security Lock: Enabled</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <History size={18} className="text-gray-400" />
                            <h3 className="font-bold text-[#151d48]">Recent Jobs</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { date: 'Mar 07', amount: '$50.00', status: 'Success' },
                                { date: 'Feb 28', amount: '$50.00', status: 'Success' },
                                { date: 'Feb 21', amount: '-', status: 'Skipped', reason: 'Below Threshold' },
                            ].map((job, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-[#444a6d]">{job.date}</p>
                                        {job.reason && <p className="text-[10px] text-red-500">{job.reason}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{job.amount}</p>
                                        <p className={`text-[10px] ${job.status === 'Success' ? 'text-green-500' : 'text-gray-400'}`}>{job.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
