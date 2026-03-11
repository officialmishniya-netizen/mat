"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Send,
    AlertCircle,
    Loader2,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch("/api/support/tickets", {
                method: "POST",
                body: JSON.stringify({
                    subject: formData.get("subject"),
                    content: formData.get("content"),
                    priority: formData.get("priority")
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create ticket");
            }

            const ticket = await response.json();
            router.push(`/dashboard/support/${ticket.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
                href="/dashboard/support"
                className="inline-flex items-center space-x-2 text-[#737791] hover:text-primary font-black text-xs uppercase tracking-widest mb-8 transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Back to Support</span>
            </Link>

            <div className="bg-white rounded-[3rem] border border-gray-50 shadow-xl shadow-blue-900/5 overflow-hidden">
                <div className="bg-[#151d48] p-10 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck size={80} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Create New Ticket</h1>
                    <p className="text-blue-200 font-medium">Please provide as much detail as possible so we can help you.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 border border-red-100 text-sm font-bold animate-in shake duration-300">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-[#737791] uppercase tracking-[0.2em] mb-2 px-1">Subject</label>
                            <input
                                required
                                name="subject"
                                type="text"
                                placeholder="E.g. Payment issue, bug report..."
                                className="w-full bg-[#f8f9fc] border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-[#151d48] placeholder:text-gray-300 focus:bg-white focus:border-primary/20 transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#737791] uppercase tracking-[0.2em] mb-2 px-1">Priority</label>
                                <select
                                    name="priority"
                                    className="w-full bg-[#f8f9fc] border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-[#151d48] focus:bg-white focus:border-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                >
                                    <option value="low">Low - General Inquiries</option>
                                    <option value="medium" selected>Medium - Technical Issues</option>
                                    <option value="high">High - Security/Critical</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[#737791] uppercase tracking-[0.2em] mb-2 px-1">Message Detail</label>
                            <textarea
                                required
                                name="content"
                                rows={6}
                                placeholder="Describe your issue in detail..."
                                className="w-full bg-[#f8f9fc] border-2 border-transparent rounded-2xl py-4 px-6 font-bold text-[#151d48] placeholder:text-gray-300 focus:bg-white focus:border-primary/20 transition-all outline-none resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-[#151d48] text-white py-5 rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:secondary active:scale-[0.98] transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Submit Ticket</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
