"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from 'react';
import { Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck, Cpu, Fingerprint } from "lucide-react";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [sponsorId, setSponsorId] = useState("");
    const [telegramUsername, setTelegramUsername] = useState("");
    const [botUsername, setBotUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Automatically capture ?ref=UUID from URL
        const ref = searchParams.get("ref");
        if (ref) {
            setSponsorId(ref);
        }

        // Fetch bot username for instructions
        const fetchBotSettings = async () => {
            const { data } = await supabase.from('settings').select('telegram_bot_username').single();
            if (data?.telegram_bot_username) {
                setBotUsername(data.telegram_bot_username);
            }
        };
        fetchBotSettings();
    }, [searchParams]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // 2. Insert into custom Users table
        if (authData.user) {
            const cleanTelegram = telegramUsername.trim().replace(/^@/, "");

            const { error: dbError } = await supabase.from("users").insert({
                id: authData.user.id,
                email,
                username,
                sponsor_id: sponsorId || null,
                telegram_username: cleanTelegram || null,
                role: "user"
            });

            if (dbError) {
                setError("Account created, but profile setup failed: " + dbError.message);
            } else {
                // 3. Create telegram settings row if provided
                if (cleanTelegram) {
                    await supabase.from("user_telegram_settings").insert({
                        user_id: authData.user.id,
                        telegram_username: cleanTelegram,
                        is_connected: false
                    });
                }
                router.push("/dashboard");
                router.refresh();
            }
        }

        setLoading(false);
    };

    return (
        <form className="space-y-5" onSubmit={handleRegister}>
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-shake">
                    <ShieldCheck size={14} />
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="space-y-1.5 px-1 font-bold">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Username</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 px-1 font-bold">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Telegram Username */}
                    <div className="space-y-1.5 px-1 col-span-1 sm:col-span-2 font-bold">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-2">
                            Telegram Username <span className="text-[9px] text-gray-600">(Optional)</span>
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <span className="text-lg font-bold">@</span>
                            </div>
                            <input
                                type="text"
                                placeholder="yourusername"
                                value={telegramUsername}
                                onChange={(e) => setTelegramUsername(e.target.value)}
                                className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 px-1">
                            💡 Get instant alerts for cycles, bonuses, and withdrawals.
                        </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5 px-1 font-bold">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Sponsor ID */}
                    <div className="space-y-1.5 px-1 font-bold">
                        <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Referral Code (Optional)</label>
                        <div className="relative group text-[#a0a8b9]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Fingerprint size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="referral ID"
                                value={sponsorId}
                                onChange={(e) => setSponsorId(e.target.value)}
                                className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-orange-600 hover:secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Please wait...
                        </span>
                    ) : (
                        <>
                            <span>Create Account</span>
                            <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0c]">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animation-delay-2000"></div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>

            <div className="relative z-10 w-full max-w-[480px] px-6 py-12">
                {/* Brand Logo & Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Link href="/" className="inline-block mb-6">
                        <img src="/logo.PNG" alt="Brand Logo" className="h-16 w-auto object-contain" />
                    </Link>
                    <p className="text-gray-400 font-medium italic mt-2">Join our Earning Platform</p>
                </div>

                {/* Glassmorphism Auth Card */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">Join Our Community</p>
                    </div>

                    <Suspense fallback={<div className="text-center py-4 text-gray-500">Loading...</div>}>
                        <RegisterForm />
                    </Suspense>

                    <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-primary font-bold hover:secondary transition-colors inline-flex items-center gap-1 group">
                                Sign In
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Secure Badge Footer */}
                <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 text-gray-400 font-bold uppercase text-[9px]">
                    <div className="flex items-center gap-1.5 ">
                        <ShieldCheck size={12} />
                        Secure System v3.0
                    </div>
                    <div className="w-[1px] h-3 bg-white/10"></div>
                    <div>
                        All systems ready
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}
