'use client';

import React, { useState } from 'react';
import {
    Wallet,
    ArrowRight,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Copy,
    QrCode,
    Bitcoin,
    Coins,
    Banknote
} from 'lucide-react';
import { formatMoney } from '@/lib/money';

const COINS = [
    { id: 'btc', name: 'Bitcoin', icon: Bitcoin, color: 'text-orange-500' },
    { id: 'ltc', name: 'Litecoin', icon: Coins, color: 'text-blue-400' },
    { id: 'usdttrc20', name: 'USDT (TRC20)', icon: Banknote, color: 'text-green-500' },
    { id: 'eth', name: 'Ethereum', icon: Coins, color: 'text-purple-500' },
    { id: 'doge', name: 'Dogecoin', icon: Coins, color: 'text-yellow-500' },
    { id: 'trx', name: 'TRON', icon: Coins, color: 'text-red-500' },
];

export default function DepositForm() {
    const [step, setStep] = useState(1);
    const [amount, setAmount] = useState('10.00');
    const [selectedCoin, setSelectedCoin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState<any>(null);

    const handleAmountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val < 1) {
            setError('Minimum deposit is $1.00');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleCoinSelect = async (coinId: string) => {
        setSelectedCoin(coinId);
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/wallet/deposit/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount), coin: coinId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            setPaymentData(data);
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    return (
        <div className="w-full">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-10 px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${step >= s ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {step > s ? <CheckCircle2 size={20} /> : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-12 h-1 bg-gray-100 mx-2 rounded-full overflow-hidden`}>
                                <div className={`h-full bg-primary transition-all duration-500 ${step > s ? 'w-full' : 'w-0'}`}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            {/* Step 1: Amount */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <h3 className="text-xl font-black text-[#151d48] mb-1">How much to deposit?</h3>
                        <p className="text-[#737791] text-sm font-medium">Funds will be added to your Purchase Balance.</p>
                    </div>

                    <form onSubmit={handleAmountSubmit} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <span className="text-2xl font-black text-[#151d48]">$</span>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-[24px] py-6 pl-12 pr-6 text-3xl font-black text-[#151d48] transition-all outline-none"
                                placeholder="0.00"
                                step="0.01"
                                min="1"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {['10', '25', '50', '100'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setAmount(p)}
                                    className={`py-3 rounded-xl text-sm font-black transition-all ${amount === p ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-[#737791] hover:bg-gray-100'
                                        }`}
                                >
                                    ${p}
                                </button>
                            ))}
                        </div>

                        <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                            Select Crypto Currency <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Coin Selection */}
            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-[#151d48] mb-1">Select payment coin</h3>
                            <p className="text-[#737791] text-sm font-medium">Depositing {formatMoney(amount)} USD</p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-xs font-black text-primary hover:underline">Change Amount</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {COINS.map((coin) => (
                            <button
                                key={coin.id}
                                disabled={loading}
                                onClick={() => handleCoinSelect(coin.id)}
                                className={`flex items-center justify-between p-5 rounded-[24px] border-2 transition-all group ${selectedCoin === coin.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${coin.color}`}>
                                        <coin.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#151d48] uppercase tracking-tight">{coin.id}</p>
                                        <p className="text-[10px] font-black text-[#737791] uppercase tracking-widest">{coin.name}</p>
                                    </div>
                                </div>
                                {loading && selectedCoin === coin.id ? (
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Payment Details */}
            {step === 3 && paymentData && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                            <QrCode size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-[#151d48] mb-1">Send Funds</h3>
                        <p className="text-[#737791] font-medium italic">Please send the exact amount to complete deposit.</p>
                    </div>

                    <div className="bg-gray-50 rounded-[32px] p-8 border-2 border-dashed border-gray-200 space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#737791] text-center">Amount to Pay</p>
                            <p className="text-3xl font-black text-center text-[#151d48] break-all">
                                {paymentData.pay_amount} <span className="text-primary uppercase">{paymentData.pay_currency}</span>
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-tighter">Approx. {formatMoney(paymentData.price_amount)} USD</p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#737791]">Wallet Address</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 font-mono text-xs break-all text-[#151d48] shadow-sm">
                                    {paymentData.pay_address}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(paymentData.pay_address)}
                                    className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all shrink-0"
                                >
                                    <Copy size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-2xl flex gap-3 text-orange-600">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">
                                This address is only valid for {paymentData.pay_currency.toUpperCase()} on its native network.
                                Do not send any other coin. Funds will appear after network confirmation.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setStep(2)} className="py-4 rounded-2xl border-2 border-gray-100 text-gray-400 font-black text-sm hover:bg-gray-50 transition-all">
                            Back
                        </button>
                        <button onClick={() => window.location.reload()} className="py-4 rounded-2xl bg-[#151d48] text-white font-black text-sm shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            Done / Refresh
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

