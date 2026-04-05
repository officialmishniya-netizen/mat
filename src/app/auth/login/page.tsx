"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0c]">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animation-delay-2000"></div>

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>

            <div className="relative z-10 w-full max-w-[440px] px-6 py-12">
                {/* Brand Logo & Header */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <Link href="/" className="inline-block mb-6">
                        <img src="/logo.PNG" alt="Brand Logo" className="h-16 w-auto object-contain" />
                    </Link>
                    <p className="text-gray-400 font-medium mt-2">Professional Earning Platform</p>
                </div>

                {/* Glassmorphism Auth Card */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                        <p className="text-sm text-gray-500 font-medium">Sign in to your account</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-shake">
                                <ShieldCheck size={14} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5 px-1">
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                                    />
                                </div>
                            </div>



                            <div className="space-y-1.5 px-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Password</label>
                                    <Link href="#" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••••••"
                                        className="w-full bg-[#121215] border border-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-offset-[#0a0a0c] focus:ring-primary" />
                            <label htmlFor="remember" className="text-xs text-gray-500 font-medium cursor-pointer select-none">Remember Me</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-orange-600 hover:secondary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/[0.05] text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{" "}
                            <Link href="/auth/register" className="text-primary font-bold hover:secondary transition-colors inline-flex items-center gap-1 group">
                                Create Account
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Secure Badge Footer */}
                <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-1.5 italic text-[10px] font-bold text-gray-400">
                        <ShieldCheck size={12} />
                        SECURE PROTECTION
                    </div>
                    <div className="w-[1px] h-3 bg-white/10"></div>
                    <div className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">
                        SECURE SYSTEM LOG
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
