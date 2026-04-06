"use client";

import { useState } from "react";
import { Star, CheckCircle2, Clock, UploadCloud, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatMoney } from "@/lib/money";

export default function BountyCard({ bounty, submission }: { bounty: any, submission: any }) {
    const [submitting, setSubmitting] = useState(false);
    const [proofText, setProofText] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/bounties/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bountyId: bounty.id, proofText })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bounty proof submitted! Awaiting review.");
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to submit.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:bg-orange-500/10 transition-colors"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                    <Star size={24} />
                </div>
                <div className="text-right">
                    <span className="text-xl font-black text-emerald-500">+{formatMoney(bounty.rewardAmount || 0)}</span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Reward</p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-[#151d48] mb-2">{bounty.title}</h3>
            <p className="text-sm text-[#737791] font-medium leading-relaxed flex-1">{bounty.description}</p>

            <div className="mt-6 pt-6 border-t border-gray-100">
                {!submission ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <textarea
                            required
                            placeholder="Enter proof URL or text..."
                            value={proofText}
                            onChange={e => setProofText(e.target.value)}
                            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/30 min-h-[80px]"
                        ></textarea>
                        <button disabled={submitting} className="w-full bg-[#151d48] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50">
                            {submitting ? <Clock className="animate-spin w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                            <span>{submitting ? "Submitting..." : "Submit Proof"}</span>
                        </button>
                    </form>
                ) : (
                    <div className={`p-4 rounded-xl flex items-center space-x-3 ${submission.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : submission.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {submission.status === 'approved' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {submission.status === 'pending' && <Clock className="w-5 h-5 shrink-0" />}
                        {submission.status === 'rejected' && <XCircle className="w-5 h-5 shrink-0" />}

                        <div>
                            <p className="font-bold text-sm uppercase tracking-wider">{submission.status}</p>
                            <p className="text-xs opacity-80 mt-0.5 max-w-[200px] truncate">{submission.proofText}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
