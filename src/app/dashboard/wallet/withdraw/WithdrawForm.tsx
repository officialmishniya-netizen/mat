"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, ArrowRight, Loader2, DollarSign, Wallet, AlertCircle } from "lucide-react";

export default function WithdrawForm({ availableBalance, withdrawalsEnabled = true }: { availableBalance: string; withdrawalsEnabled?: boolean }) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("USDT TRC20");
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (numAmount > parseFloat(availableBalance)) {
            setError("Insufficient balance.");
            return;
        }

        if (!details.trim()) {
            setError("Please enter your receiving wallet address or account details.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/wallet/withdraw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numAmount, method, details }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit withdrawal request.");
            }

            setSuccess(true);
            setAmount("");
            setDetails("");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black text-[#151d48] mb-2 tracking-tight">Request Submitted!</h3>
                <p className="text-gray-500 font-medium max-w-sm mb-8">
                    Your withdrawal request has been successfully submitted and is now pending admin approval.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="bg-gray-100 text-[#151d48] px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Make Another Request
                </button>
            </div>
        );
    }

    if (!withdrawalsEnabled) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600">
                    <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-[#151d48] mb-2 tracking-tight">Withdrawals Temporarily Disabled</h3>
                <p className="text-gray-500 font-medium max-w-sm">
                    The administration has temporarily disabled withdrawals for system maintenance or security updates. Please check back soon.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-[#151d48] mb-1">Withdrawal Details</h2>
                <p className="text-sm text-gray-500 font-medium">Select your method and enter the amount carefully.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-3 animate-in fade-in">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4 relative z-10">
                {/* Payment Method */}
                <div>
                    <label className="block text-xs font-black text-[#151d48] uppercase tracking-widest mb-2">Payment Method</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <Landmark size={20} />
                        </div>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent text-[#151d48] text-sm font-bold rounded-xl focus:ring-0 focus:border-primary/30 focus:bg-white block px-4 py-3.5 pl-11 transition-all outline-none appearance-none"
                        >
                            <option value="USDT TRC20">USDT (TRC20)</option>
                            <option value="USDT BEP20">USDT (BEP20)</option>
                            <option value="Bitcoin">Bitcoin (BTC)</option>
                            <option value="Perfect Money">Perfect Money</option>
                            <option value="Payeer">Payeer</option>
                        </select>
                    </div>
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-xs font-black text-[#151d48] uppercase tracking-widest mb-2 flex justify-between">
                        <span>Amount to Withdraw</span>
                        <button type="button" onClick={() => setAmount(availableBalance)} className="text-primary hover:underline">MAX</button>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                            <DollarSign size={20} />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent text-[#151d48] text-lg font-black rounded-xl focus:ring-0 focus:border-primary/30 focus:bg-white block px-4 py-3.5 pl-11 transition-all outline-none"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Wallet Address */}
                <div>
                    <label className="block text-xs font-black text-[#151d48] uppercase tracking-widest mb-2">Receiving Account / Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-top pt-4 pointer-events-none text-gray-400">
                            <Wallet size={20} />
                        </div>
                        <textarea
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent text-[#151d48] text-sm font-medium rounded-xl focus:ring-0 focus:border-primary/30 focus:bg-white block px-4 py-3.5 pl-11 transition-all outline-none resize-none"
                            placeholder="Enter your exact wallet address or account number..."
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-2">*Please double check your address. Transactions cannot be reversed.</p>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} /> Processing...
                    </>
                ) : (
                    <>
                        Submit Request <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>
    );
}
