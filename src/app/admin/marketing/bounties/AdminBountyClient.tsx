"use client";

import { useState } from "react";
import { Plus, Check, X, Star, UploadCloud, Link as LinkIcon, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminBountyClient({ bounties, pendingSubmissions }: { bounties: any[], pendingSubmissions: any[] }) {
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rewardAmount, setRewardAmount] = useState("");

    const [showCreate, setShowCreate] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/bounties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create_bounty", payload: { title, description, rewardAmount } })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Bounty Created!");
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to create bounty");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReview = async (id: string, status: string) => {
        try {
            const res = await fetch("/api/admin/bounties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "review_submission", payload: { submissionId: id, status } })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Submission ${status}!`);
                window.location.reload();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Action failed");
        }
    };

    return (
        <div className="space-y-8">
            {/* Create New Bounty */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#151d48]">Manage Active Bounties</h2>
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-colors">
                        <Plus className="w-5 h-5" />
                        <span>Create New</span>
                    </button>
                </div>

                {showCreate && (
                    <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input required placeholder="Bounty Title (e.g. Trustpilot Review)" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/30" />
                            <input required type="number" step="0.0001" placeholder="Reward Amount ($)" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/30" />
                        </div>
                        <textarea required placeholder="Requirements / Instructions" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500/30 min-h-[100px]"></textarea>
                        <div className="flex justify-end">
                            <button disabled={submitting} className="bg-[#151d48] text-white font-bold py-3 px-8 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50">
                                {submitting ? <RefreshCw className="animate-spin w-5 h-5" /> : <Star className="w-5 h-5" />}
                                <span>Publish Bounty</span>
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bounties.map(b => (
                        <div key={b.id} className={`p-4 border rounded-2xl ${b.active ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex justify-between">
                                <h3 className="font-bold text-[#151d48]">{b.title}</h3>
                                <span className="font-black text-emerald-500">${Number(b.rewardAmount).toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{b.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#151d48] mb-6 flex items-center space-x-2">
                    <span>Pending Proof Reviews</span>
                    {pendingSubmissions.length > 0 && (
                        <span className="bg-red-100 text-red-600 text-sm py-0.5 px-2 rounded-full">{pendingSubmissions.length} Action(s) Required</span>
                    )}
                </h2>

                {pendingSubmissions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 font-medium">No pending submissions to review.</div>
                ) : (
                    <div className="space-y-4">
                        {pendingSubmissions.map(sub => (
                            <div key={sub.id} className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex items-center justify-between group hover:border-orange-200 transition-colors">
                                <div className="flex-1">
                                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">{sub.bountyTitle} &bull; ${Number(sub.rewardAmount).toFixed(2)}</p>
                                    <p className="text-sm font-medium text-[#151d48] mb-2"><span className="text-gray-400">User:</span> @{sub.user.username}</p>
                                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 break-all flex items-start space-x-3">
                                        <LinkIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <span>{sub.proofText}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-6 shrink-0">
                                    <button onClick={() => handleReview(sub.id, 'approved')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 px-6 rounded-xl flex items-center space-x-2 transition-colors">
                                        <Check className="w-4 h-4" /> <span>Approve & Pay</span>
                                    </button>
                                    <button onClick={() => handleReview(sub.id, 'rejected')} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-6 rounded-xl flex items-center space-x-2 transition-colors">
                                        <X className="w-4 h-4" /> <span>Reject</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
