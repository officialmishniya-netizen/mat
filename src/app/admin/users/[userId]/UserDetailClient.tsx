'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, ShieldAlert, Activity, DollarSign, Package,
    Lock, FileText, Send, History, AlertTriangle, ArrowUpRight,
    ArrowDownRight, CheckCircle, XCircle
} from 'lucide-react';
import {
    freezeUser, unfreezeUser, banUser, unbanUser,
    addBalance, deductBalance, zeroBalance, sendDirectMessage, addAdminNote
} from '@/app/actions/adminUserManagement';
import { toast } from 'react-hot-toast';

export default function UserDetailClient({ userData }: { userData: any }) {
    const [activeTab, setActiveTab] = useState('overview');

    // Action handlers
    const handleAction = async (actionFn: Function, actionName: string, ...args: any[]) => {
        if (!confirm(`Are you sure you want to perform: ${actionName}?`)) return;
        const reason = prompt('Reason for this action:');
        if (!reason) return;

        const toastId = toast.loading(`Processing ${actionName}...`);
        const res = await actionFn(...args, reason);
        if (res.success) {
            toast.success(`${actionName} completed successfully. Reload to see changes.`, { id: toastId });
        } else {
            toast.error(res.error || `Failed to ${actionName}`, { id: toastId });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'bg-green-500/20 text-green-500 border-green-500/50';
        if (['frozen', 'banned', 'deleted'].includes(status.toLowerCase())) {
            color = 'bg-red-500/20 text-red-500 border-red-500/50';
        } else if (status.toLowerCase().includes('pending')) {
            color = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
        }

        return (
            <span className={`px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-full border ${color}`}>
                {status}
            </span>
        );
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'plans', label: 'Plans', icon: <Package className="w-4 h-4" /> },
        { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
        { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
        { id: 'messages', label: 'Messages', icon: <Send className="w-4 h-4" /> },
        { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-[#09090f] text-[#f8fafc] p-8 font-sans">
            <div className="max-w-[1600px] mx-auto">
                <Link href="/admin/users" className="flex items-center text-[#94a3b8] hover:text-[#f97316] mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Users
                </Link>

                <div className="grid grid-cols-12 gap-8">
                    {/* LEFT PANEL */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Identity Card */}
                        <div className="bg-[#0f0f1a] border border-[#1f1f35] rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold font-syne text-white">@{userData.user.username}</h2>
                                    <p className="text-[#94a3b8] text-sm">{userData.user.email}</p>
                                </div>
                                <StatusBadge status={userData.status.status} />
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex justify-between text-sm border-b border-[#1f1f35] pb-2">
                                    <span className="text-[#475569]">User ID</span>
                                    <span className="text-white font-mono truncate w-32" title={userData.user.id}>{userData.user.id.split('-')[0]}...</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-[#1f1f35] pb-2">
                                    <span className="text-[#475569]">Role</span>
                                    <span className="text-white capitalize">{userData.user.role}</span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-[#1f1f35] pb-2">
                                    <span className="text-[#475569]">Rank</span>
                                    <span className="text-[#f97316] font-bold">{userData.user.rank}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#475569]">Joined</span>
                                    <span className="text-white">{new Date(userData.user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Financials */}
                        <div className="bg-[#0f0f1a] border border-[#1f1f35] rounded-xl p-6">
                            <h3 className="text-sm font-bold text-[#475569] uppercase tracking-wider mb-4">Balance</h3>
                            <div className="text-3xl font-mono text-[#f59e0b] mb-4">${userData.financials.totalBalance}</div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleAction(addBalance, 'Add Balance', userData.user.id, prompt('Amount to add:'))}
                                    className="w-full bg-[#1a1a2e] border border-[#1f1f35] hover:border-green-500 text-green-500 px-4 py-2 rounded-lg transition-all text-sm font-bold flex justify-center items-center gap-2"
                                >
                                    <ArrowDownRight className="w-4 h-4" /> Credit Funds
                                </button>
                                <button
                                    onClick={() => handleAction(deductBalance, 'Deduct Balance', userData.user.id, prompt('Amount to deduct:'))}
                                    className="w-full bg-[#1a1a2e] border border-[#1f1f35] hover:border-red-500 text-red-500 px-4 py-2 rounded-lg transition-all text-sm font-bold flex justify-center items-center gap-2"
                                >
                                    <ArrowUpRight className="w-4 h-4" /> Debit Funds
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-[#1a0f12] border border-[#3f191f] rounded-xl p-6">
                            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4" /> Danger Zone
                            </h3>
                            <div className="space-y-3">
                                {userData.status.status === 'active' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(freezeUser, 'Freeze Account', userData.user.id, 'full')}
                                            className="w-full bg-red-500/10 border border-red-500/20 hover:border-red-500 text-red-500 py-2 rounded-lg text-sm transition-all text-left px-4"
                                        >
                                            Freeze Account
                                        </button>
                                        <button
                                            onClick={() => handleAction(banUser, 'Ban Account', userData.user.id, 'permanent')}
                                            className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 py-2 rounded-lg text-sm transition-all text-left px-4"
                                        >
                                            Ban User
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleAction(unfreezeUser, 'Unfreeze Account', userData.user.id)}
                                            className="w-full bg-green-500/10 border border-green-500/20 hover:border-green-500 text-green-500 py-2 rounded-lg text-sm transition-all text-left px-4"
                                        >
                                            Unfreeze
                                        </button>
                                        <button
                                            onClick={() => handleAction(unbanUser, 'Unban Account', userData.user.id)}
                                            className="w-full bg-green-500/10 border border-green-500/20 hover:border-green-500 text-green-500 py-2 rounded-lg text-sm transition-all text-left px-4"
                                        >
                                            Unban
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="col-span-12 lg:col-span-9 flex flex-col h-[calc(100vh-8rem)]">
                        {/* Tabs Navigation */}
                        <div className="flex overflow-x-auto border-b border-[#1f1f35] mb-6 slim-scrollbar flex-shrink-0">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id
                                            ? 'border-[#f97316] text-[#f97316]'
                                            : 'border-transparent text-[#94a3b8] hover:text-white hover:border-[#475569]'
                                        }`}
                                >
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto pr-2 slim-scrollbar relative">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#1f1f35]">
                                            <p className="text-[#94a3b8] text-sm mb-2">Total Earned</p>
                                            <p className="text-2xl font-bold text-white">${userData.financials.totalEarned}</p>
                                        </div>
                                        <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#1f1f35]">
                                            <p className="text-[#94a3b8] text-sm mb-2">Total Withdrawn</p>
                                            <p className="text-2xl font-bold text-white">${userData.financials.totalWithdrawn}</p>
                                        </div>
                                        <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#1f1f35]">
                                            <p className="text-[#94a3b8] text-sm mb-2">Total Cycles</p>
                                            <p className="text-2xl font-bold text-white">{userData.financials.totalCycles}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#0f0f1a] p-6 rounded-xl border border-[#1f1f35]">
                                        <h3 className="text-lg font-bold text-white mb-4">Referral Network</h3>
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[#475569] text-sm">Sponsor</p>
                                                <p className="text-white">{userData.sponsor ? `@${userData.sponsor.username}` : 'None'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[#475569] text-sm">Direct Referrals</p>
                                                <p className="text-white">{userData.referralsCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'financial' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-[#0f0f1a] border border-[#1f1f35] rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-[#1f1f35] bg-[#1a1a2e]">
                                            <h3 className="font-bold text-white">Ledger History</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-[#0f0f1a] text-[#475569] text-sm border-b border-[#1f1f35]">
                                                    <tr>
                                                        <th className="p-4">Date</th>
                                                        <th className="p-4">Type</th>
                                                        <th className="p-4">Reference</th>
                                                        <th className="p-4 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userData.ledger.map((l: any, i: number) => (
                                                        <tr key={i} className="border-b border-[#1f1f35]/50 hover:bg-[#141425]">
                                                            <td className="p-4 text-sm text-[#94a3b8]">{new Date(l.created_at).toLocaleString()}</td>
                                                            <td className="p-4 text-sm text-white capitalize">{l.type.replace('_', ' ')}</td>
                                                            <td className="p-4 text-sm font-mono text-[#475569] truncate max-w-[120px]">{l.reference_id || '—'}</td>
                                                            <td className={`p-4 text-right font-mono ${parseFloat(l.amount) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {parseFloat(l.amount) > 0 ? '+' : ''}{l.amount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {userData.ledger.length === 0 && (
                                                        <tr><td colSpan={4} className="p-8 text-center text-[#475569]">No ledger entries found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'plans' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-6">
                                        {userData.activePlans.map((p: any) => (
                                            <div key={p.id} className="bg-[#1a1a2e] border border-[#1f1f35] rounded-xl p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-xl font-bold text-white">{p.planName}</h3>
                                                    <StatusBadge status={p.status} />
                                                </div>
                                                <div className="space-y-2 text-sm text-[#94a3b8] mb-6">
                                                    <div className="flex justify-between">
                                                        <span>Position ID</span>
                                                        <span className="font-mono text-xs">{p.id.split('-')[0]}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Ads Today</span>
                                                        <span>{p.adsWatchedToday} / {p.dailyAds}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Locked Balance</span>
                                                        <span className="text-white">${p.lockedBalance} / ${p.clickGoal}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Total Cycles</span>
                                                        <span>{p.totalCycles}</span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-[#0f0f1a] h-2 rounded-full overflow-hidden mb-6 border border-[#1f1f35]">
                                                    <div
                                                        className="h-full bg-[#f97316]"
                                                        style={{ width: `${Math.min(100, (p.lockedBalance / p.clickGoal) * 100)}%` }}
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="flex-1 bg-[#1a1a2e] border border-[#1f1f35] hover:border-white text-white py-2 rounded text-sm transition-all">
                                                        Force Cycle
                                                    </button>
                                                    <button className="flex-1 bg-red-500/10 border border-red-500/20 hover:border-red-500 text-red-500 py-2 rounded text-sm transition-all">
                                                        Terminate
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {userData.activePlans.length === 0 && (
                                            <div className="col-span-2 p-12 text-center border border-dashed border-[#1f1f35] rounded-xl text-[#475569]">
                                                No active plans found for this user.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'audit' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-[#0f0f1a] border border-[#1f1f35] rounded-xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#1a1a2e] text-[#475569] text-sm border-b border-[#1f1f35]">
                                                <tr>
                                                    <th className="p-4">Date</th>
                                                    <th className="p-4">Admin</th>
                                                    <th className="p-4">Action</th>
                                                    <th className="p-4">Description</th>
                                                    <th className="p-4 text-center">Severity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userData.auditLogs.map((a: any, i: number) => (
                                                    <tr key={i} className="border-b border-[#1f1f35]/50 hover:bg-[#141425]">
                                                        <td className="p-4 text-xs text-[#94a3b8] whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</td>
                                                        <td className="p-4 text-sm text-white">@{a.adminUsername}</td>
                                                        <td className="p-4 text-sm">
                                                            <span className="bg-[#1a1a2e] border border-[#1f1f35] px-2 py-1 rounded text-xs text-[#94a3b8]">
                                                                {a.action}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-sm text-[#94a3b8]">{a.description}</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`w-2 h-2 inline-block rounded-full ${a.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                                                                    a.severity === 'high' ? 'bg-orange-500' :
                                                                        a.severity === 'medium' ? 'bg-yellow-500' :
                                                                            'bg-slate-500'
                                                                }`} title={a.severity}></span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {userData.auditLogs.length === 0 && (
                                                    <tr><td colSpan={5} className="p-8 text-center text-[#475569]">No audit logs available.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Placeholders for remaining tabs to avoid huge file size initially */}
                            {['security', 'notes', 'messages'].includes(activeTab) && (
                                <div className="p-12 text-center border border-dashed border-[#1f1f35] rounded-xl text-[#475569] animate-fade-in">
                                    <h3 className="text-xl mb-2 text-white capitalize">{activeTab} panel</h3>
                                    <p>Detailed implementation for {activeTab} goes here. It integrates directly with the server actions.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
