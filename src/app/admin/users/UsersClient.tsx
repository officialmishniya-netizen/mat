'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, Users, Eye, Zap, Lock, Unlock, Ban, Mail, Trash2,
    DownloadCloud, X, DollarSign, ShieldAlert, ShieldCheck,
    RefreshCw, Globe, FileText, UserCog, MinusCircle, AlertTriangle,
    CheckCircle, ChevronRight, Loader2
} from 'lucide-react';
import {
    freezeUserAccount, unfreezeUserAccount, banUser, softDeleteUser,
    addBalance, deductBalance, sendDirectMessage, banIPAddress,
    bulkUserAction, getUserDetailForPanel, getUserIPLogs, changeUserRole
} from '@/app/actions/adminUserManagement';
import { toast } from 'react-hot-toast';

interface UserData {
    id: string; username: string; email: string | null;
    role: string; createdAt: string; status: string;
    riskScore: number; balance: string; plan: string;
}

const STATUS_CFG: Record<string, { dot: string; badge: string }> = {
    Active: { dot: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200' },
    Frozen: { dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    Banned: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' },
    Pending: { dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    Deleted: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-orange-100 text-orange-700',
    user: 'bg-gray-100 text-gray-600',
    advertiser: 'bg-purple-100 text-purple-700',
};

/* â”€â”€ Generic Modal â”€â”€ */
function Modal({ open, onClose, title, wide, children }: { open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode }) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [onClose]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-4xl' : 'max-w-md'} flex flex-col`} style={{ maxHeight: '90vh', minHeight: wide ? '70vh' : 'auto' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-700" /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 min-h-0">{children}</div>
            </div>
        </div>
    );
}

/* â”€â”€ Detail tabs modal â”€â”€ */
type TabKey = 'profile' | 'ledger' | 'plans' | 'audit' | 'notes' | 'withdrawals';
function DetailModal({ user, open, onClose }: { user: UserData; open: boolean; onClose: () => void }) {
    const [tab, setTab] = useState<TabKey>('profile');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) { setData(null); return; }
        setData(null);
        setLoading(true);
        getUserDetailForPanel(user.id).then(r => {
            if (r.success) setData(r.data);
            else toast.error(r.error || 'Failed to load');
            setLoading(false);
        });
    }, [open, user.id]);

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'profile', label: 'Profile' },
        { key: 'ledger', label: 'Ledger' },
        { key: 'plans', label: 'Ad Plans' },
        { key: 'withdrawals', label: 'Withdrawals' },
        { key: 'audit', label: 'Audit Log' },
        { key: 'notes', label: 'Notes' },
    ];

    const Td = ({ c }: { c: string }) => <td className="px-3 py-2 text-xs text-gray-600">{c}</td>;
    const Th = ({ c }: { c: string }) => <th className="px-3 py-2 text-xs font-semibold text-gray-400 text-left uppercase tracking-wide">{c}</th>;

    return (
        <Modal open={open} onClose={onClose} title={`@${user.username} â€” Details`} wide>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading && <div className="flex items-center justify-center" style={{ minHeight: '40vh' }}><Loader2 className="h-10 w-10 animate-spin text-orange-400" /></div>}

            {!loading && !data && <div className="flex items-center justify-center text-gray-400" style={{ minHeight: '40vh' }}>Could not load data.</div>}

            {!loading && data && (
                <>
                    {/* Profile */}
                    {tab === 'profile' && (
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ['ID', data.user.id],
                                ['Username', data.user.username || 'â€”'],
                                ['Email', data.user.email || 'â€”'],
                                ['Role', data.user.role],
                                ['Rank', data.user.rank || 'â€”'],
                                ['Joined', data.user.created_at ? new Date(data.user.created_at).toLocaleDateString() : 'â€”'],
                                ['Telegram', data.user.telegramUsername || 'Not linked'],
                                ['2FA', data.user.two_fa_enabled ? 'Enabled' : 'Disabled'],
                            ].map(([k, v]) => (
                                <div key={k} className="bg-gray-50 rounded-xl p-3">
                                    <div className="text-xs text-gray-400 mb-1">{k}</div>
                                    <div className="text-sm font-semibold text-gray-800">{v}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ledger */}
                    {tab === 'ledger' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="border-b border-gray-100"><Th c="Type" /><Th c="Amount" /><Th c="Reference" /><Th c="Date" /></tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(data.ledger || []).length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No ledger entries</td></tr>}
                                    {(data.ledger || []).map((l: any) => (
                                        <tr key={l.id}>
                                            <Td c={l.type} />
                                            <td className={`px-3 py-2 text-xs font-bold ${Number(l.amount) >= 0 ? 'text-green-600' : 'text-red-500'}`}>${Number(l.amount).toFixed(4)}</td>
                                            <Td c={l.reference_id || 'â€”'} />
                                            <Td c={l.created_at ? new Date(l.created_at).toLocaleString() : 'â€”'} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Plans */}
                    {tab === 'plans' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="border-b border-gray-100"><Th c="Plan ID" /><Th c="Status" /><Th c="Locked Bal" /><Th c="Ads Today" /><Th c="Total Cycles" /></tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(data.plans || []).length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No plans</td></tr>}
                                    {(data.plans || []).map((p: any) => (
                                        <tr key={p.id}>
                                            <td className="px-3 py-2 text-xs text-gray-500 font-mono">{p.id.slice(0, 8)}â€¦</td>
                                            <Td c={p.status} />
                                            <Td c={`$${Number(p.lockedBalance || 0).toFixed(2)}`} />
                                            <Td c={String(p.adsWatchedToday || 0)} />
                                            <Td c={String(p.totalCycles || 0)} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Withdrawals */}
                    {tab === 'withdrawals' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="border-b border-gray-100"><Th c="Amount" /><Th c="Status" /><Th c="Method" /><Th c="Date" /></tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(data.withdrawals || []).length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No withdrawals</td></tr>}
                                    {(data.withdrawals || []).map((w: any) => (
                                        <tr key={w.id}>
                                            <td className="px-3 py-2 text-xs font-bold text-gray-800">${Number(w.amount).toFixed(2)}</td>
                                            <Td c={w.status} />
                                            <Td c={w.payment_method || 'â€”'} />
                                            <Td c={w.created_at ? new Date(w.created_at).toLocaleDateString() : 'â€”'} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Audit */}
                    {tab === 'audit' && (
                        <div className="space-y-2">
                            {(data.audit || []).length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No audit entries</p>}
                            {(data.audit || []).map((a: any) => (
                                <div key={a.id} className="bg-gray-50 rounded-xl p-3 flex items-start gap-3">
                                    <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-400' : 'bg-gray-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-gray-800">{a.action}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{a.description}</div>
                                        <div className="text-xs text-gray-400 mt-1">by {a.adminUsername} Â· {a.createdAt ? new Date(a.createdAt).toLocaleString() : 'â€”'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {tab === 'notes' && (
                        <div className="space-y-2">
                            {(data.notes || []).length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No notes</p>}
                            {(data.notes || []).map((n: any) => (
                                <div key={n.id} className="border-l-4 border-orange-300 bg-orange-50 rounded-r-xl p-3">
                                    <div className="text-xs font-semibold text-gray-800">{n.category}</div>
                                    <div className="text-sm text-gray-700 mt-1">{n.note}</div>
                                    <div className="text-xs text-gray-400 mt-1">{n.adminUsername} Â· {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'â€”'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
}

/* â”€â”€ IP Log + Ban Modal â”€â”€ */
function IPBanModal({ user, open, onClose }: { user: UserData; open: boolean; onClose: () => void }) {
    const [ips, setIps] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState('');
    const [reason, setReason] = useState('');
    const [banning, setBanning] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        getUserIPLogs(user.id).then(r => {
            if (r.success) setIps(r.data || []);
            setLoading(false);
        });
    }, [open, user.id]);

    const doBan = async (ip: string) => {
        if (!reason) { toast.error('Enter a reason'); return; }
        setBanning(true);
        const r = await banIPAddress(ip, reason);
        if (r.success) { toast.success(`IP ${ip} banned`); onClose(); }
        else toast.error(r.error || 'Failed');
        setBanning(false);
    };

    return (
        <Modal open={open} onClose={onClose} title={`IP Logs â€” @${user.username}`} wide>
            <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Ban Reason (applied to selected IP)</label>
                <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Fraud activity, multiple accountsâ€¦"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50" />
            </div>

            {loading && <div className="flex justify-center py-8"><Loader2 className="h-7 w-7 animate-spin text-orange-400" /></div>}

            {!loading && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <th className="px-4 py-3 text-left">IP Address</th>
                                <th className="px-4 py-3 text-left">Hits</th>
                                <th className="px-4 py-3 text-left">Last Seen</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ips.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No IP logs found for this user</td></tr>
                            )}
                            {ips.map((ip: any) => (
                                <tr key={ip.ip} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-sm text-gray-800">{ip.ip}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{ip.count}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{ip.lastSeen ? new Date(ip.lastSeen).toLocaleString() : 'â€”'}</td>
                                    <td className="px-4 py-3">
                                        {ip.isBanned
                                            ? <span className="bg-red-50 text-red-600 border border-red-200 text-xs px-2 py-0.5 rounded-full font-semibold">Banned</span>
                                            : <span className="bg-green-50 text-green-600 border border-green-200 text-xs px-2 py-0.5 rounded-full font-semibold">Clean</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {!ip.isBanned && (
                                            <button onClick={() => doBan(ip.ip)} disabled={banning || !reason}
                                                className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg transition-all">
                                                {banning ? 'â€¦' : 'Ban IP'}
                                            </button>
                                        )}
                                        {ip.isBanned && <span className="text-xs text-gray-400">Already banned</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Or enter IP manually</label>
                <div className="flex gap-2">
                    <input value={selected} onChange={e => setSelected(e.target.value)} placeholder="192.168.x.x"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50" />
                    <button onClick={() => doBan(selected)} disabled={!selected || !reason || banning}
                        className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl transition-all">
                        Ban
                    </button>
                </div>
            </div>
        </Modal>
    );
}

/* â”€â”€ Action Slide-over â”€â”€ */
type ActionModal = 'freeze' | 'unfreeze' | 'ban' | 'msg' | 'add_bal' | 'deduct_bal' | 'delete' | 'ip_ban' | 'detail' | 'role' | null;

function UserPanel({ user, onClose }: { user: UserData; onClose: () => void }) {
    const [modal, setModal] = useState<ActionModal>(null);
    const [newRole, setNewRole] = useState(user.role);
    const [reason, setReason] = useState('');
    const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent');
    const [banDays, setBanDays] = useState('7');
    const [freezeType, setFreezeType] = useState<'soft' | 'hard'>('soft');
    const [amt, setAmt] = useState('');
    const [balType, setBalType] = useState('admin_credit');
    const [balDesc, setBalDesc] = useState('');
    const [msgSubj, setMsgSubj] = useState('');
    const [msgBody, setMsgBody] = useState('');
    const [msgCh, setMsgCh] = useState<'platform' | 'telegram'>('platform');
    const [loading, setLoading] = useState(false);

    const reset = () => { setReason(''); setAmt(''); setBalDesc(''); setMsgSubj(''); setMsgBody(''); };
    const sc = STATUS_CFG[user.status] || { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 border-gray-200' };

    const run = async (fn: () => Promise<{ success: boolean; error?: string }>, msg: string) => {
        setLoading(true);
        try {
            const r = await fn();
            if (r.success) { toast.success(msg); setModal(null); reset(); }
            else toast.error(r.error || 'Failed');
        } catch { toast.error('Error'); }
        setLoading(false);
    };

    const inp = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
        <input {...props} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-all" />;
    const ta = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
        <textarea {...props} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50 resize-none" />;
    const sel = (props: React.SelectHTMLAttributes<HTMLSelectElement>, ch: React.ReactNode) =>
        <select {...props} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-gray-50">{ch}</select>;
    const lbl = (t: string, el: React.ReactNode) => <div><label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">{t}</label>{el}</div>;
    const confirmBtn = (label: string, fn: () => void, danger = false) => (
        <button onClick={fn} disabled={loading} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
            {loading ? 'Processingâ€¦' : label}
        </button>
    );
    const cancelBtn = () => <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>;

    const viewTabs = [
        { label: 'Full Profile', icon: <Eye className="h-3.5 w-3.5" /> },
        { label: 'Ledger & Logs', icon: <FileText className="h-3.5 w-3.5" /> },
        { label: 'Ad Plans', icon: <Zap className="h-3.5 w-3.5" /> },
        { label: 'Audit Log', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
        { label: 'Notes & Messages', icon: <Mail className="h-3.5 w-3.5" /> },
    ];

    const actions = [
        { label: '+ Add Balance', icon: <DollarSign className="h-4 w-4" />, onClick: () => setModal('add_bal'), cls: 'text-green-600 hover:bg-green-50 border-green-200' },
        { label: 'âˆ’ Deduct Balance', icon: <MinusCircle className="h-4 w-4" />, onClick: () => setModal('deduct_bal'), cls: 'text-yellow-600 hover:bg-yellow-50 border-yellow-200' },
        { label: 'Send Message', icon: <Mail className="h-4 w-4" />, onClick: () => setModal('msg'), cls: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
        { label: 'Freeze Account', icon: <Lock className="h-4 w-4" />, onClick: () => setModal('freeze'), cls: 'text-blue-700 hover:bg-blue-50 border-blue-200' },
        { label: 'Unfreeze Account', icon: <Unlock className="h-4 w-4" />, onClick: () => setModal('unfreeze'), cls: 'text-teal-600 hover:bg-teal-50 border-teal-200' },
        { label: 'Ban User', icon: <Ban className="h-4 w-4" />, onClick: () => setModal('ban'), cls: 'text-red-600 hover:bg-red-50 border-red-200' },
        { label: 'IP Logs & Ban', icon: <Globe className="h-4 w-4" />, onClick: () => setModal('ip_ban'), cls: 'text-red-500 hover:bg-red-50 border-red-200' },
        { label: 'Force PW Reset', icon: <RefreshCw className="h-4 w-4" />, onClick: () => toast('PW reset queued'), cls: 'text-gray-600 hover:bg-gray-50 border-gray-200' },
        { label: 'Change Role', icon: <UserCog className="h-4 w-4" />, onClick: () => setModal('role'), cls: 'text-gray-600 hover:bg-gray-50 border-gray-200' },
        { label: 'Soft Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setModal('delete'), cls: 'text-red-700 hover:bg-red-50 border-red-200' },
    ];

    return (
        <>
            {/* Slide-over */}
            <div className="fixed inset-0 z-40" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto flex flex-col z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 bg-orange-50 border-b border-orange-100 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 text-sm">@{user.username}</div>
                                <div className="text-xs text-gray-500">{user.email || 'â€”'}</div>
                            </div>
                        </div>
                        <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100 bg-gray-50 text-xs">
                        {[['Balance', `$${user.balance}`], ['Risk', `${user.riskScore}/100`], ['Role', user.role], ['Status', user.status]].map(([k, v]) => (
                            <div key={k} className="bg-white rounded-lg p-2.5 border border-gray-100">
                                <div className="text-gray-400">{k}</div>
                                <div className="font-bold text-gray-800 mt-0.5">{v}</div>
                            </div>
                        ))}
                    </div>

                    {/* View Details â€” all inline, no navigation */}
                    <div className="p-4 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">View Details</p>
                        {viewTabs.map(t => (
                            <button key={t.label} onClick={() => setModal('detail')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors group text-left">
                                <span className="text-gray-400 group-hover:text-orange-500">{t.icon}</span>
                                {t.label}
                                <ChevronRight className="h-3.5 w-3.5 ml-auto text-gray-300 group-hover:text-orange-400" />
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="p-4 space-y-1.5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Actions</p>
                        {actions.map(a => (
                            <button key={a.label} onClick={a.onClick}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all text-left ${a.cls}`}>
                                {a.icon}{a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Tabs Modal */}
            <DetailModal user={user} open={modal === 'detail'} onClose={() => setModal(null)} />

            {/* IP Ban Modal */}
            <IPBanModal user={user} open={modal === 'ip_ban'} onClose={() => setModal(null)} />

            {/* Add Balance */}
            <Modal open={modal === 'add_bal'} onClose={() => setModal(null)} title={`Add Balance â€” @${user.username}`}>
                <div className="space-y-4">
                    {lbl('Amount (USD)', inp({ type: 'number', min: '0.01', step: '0.01', placeholder: '0.00', value: amt, onChange: e => setAmt(e.target.value) }))}
                    {lbl('Type', sel({ value: balType, onChange: e => setBalType(e.target.value) }, <><option value="admin_credit">Admin Credit</option><option value="bonus">Bonus</option><option value="refund">Refund</option><option value="cycle_correction">Cycle Correction</option></>))}
                    {lbl('Reason', ta({ placeholder: 'Reasonâ€¦', value: balDesc, onChange: e => setBalDesc(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Add Balance', () => run(() => addBalance(user.id, amt, balType, balDesc), `$${amt} added`))}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Deduct Balance */}
            <Modal open={modal === 'deduct_bal'} onClose={() => setModal(null)} title={`Deduct Balance â€” @${user.username}`}>
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 flex gap-2"><AlertTriangle className="h-4 w-4 flex-shrink-0" />This reduces the user's wallet.</div>
                    {lbl('Amount', inp({ type: 'number', min: '0.01', step: '0.01', placeholder: '0.00', value: amt, onChange: e => setAmt(e.target.value) }))}
                    {lbl('Type', sel({ value: balType, onChange: e => setBalType(e.target.value) }, <><option value="admin_deduct">Admin Deduction</option><option value="fee_recovery">Fee Recovery</option><option value="fraud_recovery">Fraud Recovery</option></>))}
                    {lbl('Reason', ta({ placeholder: 'Reasonâ€¦', value: balDesc, onChange: e => setBalDesc(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Deduct', () => run(() => deductBalance(user.id, amt, balType, balDesc), `$${amt} deducted`), true)}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Message */}
            <Modal open={modal === 'msg'} onClose={() => setModal(null)} title={`Message @${user.username}`}>
                <div className="space-y-4">
                    {lbl('Channel', sel({ value: msgCh, onChange: e => setMsgCh(e.target.value as any) }, <><option value="platform">Platform Inbox</option><option value="telegram">Telegram</option></>))}
                    {lbl('Subject', inp({ placeholder: 'Subjectâ€¦', value: msgSubj, onChange: e => setMsgSubj(e.target.value) }))}
                    {lbl('Message', ta({ placeholder: 'Write your messageâ€¦', value: msgBody, onChange: e => setMsgBody(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Send', () => run(() => sendDirectMessage(user.id, msgSubj, msgBody, msgCh), 'Message sent'))}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Freeze */}
            <Modal open={modal === 'freeze'} onClose={() => setModal(null)} title={`Freeze @${user.username}`}>
                <div className="space-y-4">
                    {lbl('Freeze Type', sel({ value: freezeType, onChange: e => setFreezeType(e.target.value as any) }, <><option value="soft">Soft (view-only)</option><option value="hard">Hard (full lockout)</option></>))}
                    {lbl('Reason', ta({ placeholder: 'Why are you freezing this account?', value: reason, onChange: e => setReason(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Freeze', () => run(() => freezeUserAccount(user.id, reason, freezeType), `@${user.username} frozen`))}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Unfreeze */}
            <Modal open={modal === 'unfreeze'} onClose={() => setModal(null)} title={`Unfreeze @${user.username}`}>
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex gap-2"><CheckCircle className="h-4 w-4 flex-shrink-0" />Restores normal access.</div>
                    {lbl('Note (optional)', ta({ placeholder: 'Optional noteâ€¦', value: reason, onChange: e => setReason(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Unfreeze', () => run(() => unfreezeUserAccount(user.id, reason), `@${user.username} unfrozen`))}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Ban */}
            <Modal open={modal === 'ban'} onClose={() => setModal(null)} title={`Ban @${user.username}`}>
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex gap-2"><Ban className="h-4 w-4 flex-shrink-0" />User loses all platform access.</div>
                    {lbl('Type', sel({ value: banType, onChange: e => setBanType(e.target.value as any) }, <><option value="permanent">Permanent</option><option value="temporary">Temporary</option></>))}
                    {banType === 'temporary' && lbl('Duration (days)', inp({ type: 'number', min: '1', value: banDays, onChange: e => setBanDays(e.target.value) }))}
                    {lbl('Reason', ta({ placeholder: 'Ban reasonâ€¦', value: reason, onChange: e => setReason(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Ban User', () => run(() => banUser(user.id, reason, banType, banType === 'temporary' ? new Date(Date.now() + parseInt(banDays) * 86400000) : undefined), `@${user.username} banned`), true)}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Delete */}
            <Modal open={modal === 'delete'} onClose={() => setModal(null)} title={`Delete @${user.username}`}>
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex gap-2"><AlertTriangle className="h-4 w-4 flex-shrink-0" />Soft delete â€” data preserved but account deactivated.</div>
                    {lbl('Reason', ta({ placeholder: 'Reason for deletionâ€¦', value: reason, onChange: e => setReason(e.target.value) }))}
                    <div className="flex gap-3 pt-1">{confirmBtn('Confirm Delete', () => run(() => softDeleteUser(user.id, reason), `@${user.username} deleted`), true)}{cancelBtn()}</div>
                </div>
            </Modal>

            {/* Change Role */}
            <Modal open={modal === 'role'} onClose={() => setModal(null)} title={`Change Role â€” @${user.username}`}>
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 flex gap-2"><ShieldCheck className="h-4 w-4 flex-shrink-0" />Changing a user's role affects their platform permissions.</div>
                    {lbl('New Role', sel({ value: newRole, onChange: e => setNewRole(e.target.value) },
                        <>
                            <option value="user">User</option>
                            <option value="advertiser">Advertiser</option>
                            <option value="admin">Admin</option>
                        </>
                    ))}
                    <div className="flex gap-3 pt-1">
                        {confirmBtn('Update Role', () => run(() => changeUserRole(user.id, newRole as any, 'Admin changed role'), `Role changed to ${newRole}`))}
                        {cancelBtn()}
                    </div>
                </div>
            </Modal>
        </>
    );
}

/* â”€â”€ Main Page â”€â”€ */
export default function UsersClient({ initialUsers }: { initialUsers: UserData[] }) {
    const [search, setSearch] = useState('');
    const [statusF, setStatusF] = useState('All');
    const [roleF, setRoleF] = useState('All');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [users] = useState<UserData[]>(initialUsers);
    const [page, setPage] = useState(1);
    const [activeUser, setActiveUser] = useState<UserData | null>(null);
    const PER = 20;

    const filtered = useMemo(() => users.filter(u => {
        const s = search.toLowerCase();
        return (u.username.toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s))
            && (statusF === 'All' || u.status === statusF)
            && (roleF === 'All' || u.role.toLowerCase() === roleF.toLowerCase());
    }), [users, search, statusF, roleF]);

    const pages = Math.max(1, Math.ceil(filtered.length / PER));
    const paged = filtered.slice((page - 1) * PER, page * PER);

    const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => setSelected(e.target.checked ? new Set(paged.map(u => u.id)) : new Set());
    const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

    const bulk = async (action: string) => {
        const reason = prompt(`Reason for "${action}":`);
        if (!reason) return;
        const tid = toast.loading('Processingâ€¦');
        const r = await bulkUserAction(Array.from(selected), action, reason);
        r.success ? toast.success('Done.', { id: tid }) : toast.error(r.error || 'Failed', { id: tid });
    };

    const cfg = (s: string) => STATUS_CFG[s] || { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 border-gray-200' };

    return (
        <div className="min-h-screen bg-[#f7f8fa] p-6">
            {activeUser && <UserPanel user={activeUser} onClose={() => setActiveUser(null)} />}

            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-100 rounded-2xl"><Users className="h-6 w-6 text-orange-600" /></div>
                    <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1><p className="text-sm text-gray-500">{filtered.length} users</p></div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"><DownloadCloud className="h-4 w-4" /> Export CSV</button>
                    <Link href="/admin/audit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"><ShieldAlert className="h-4 w-4" /> Global Audit</Link>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm">+ Add User</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                {[
                    { l: 'Total', v: users.length, i: <Users className="h-5 w-5 text-orange-500" />, bg: 'bg-orange-50' },
                    { l: 'Active', v: users.filter(u => u.status === 'Active').length, i: <ShieldCheck className="h-5 w-5 text-green-500" />, bg: 'bg-green-50' },
                    { l: 'Frozen', v: users.filter(u => u.status === 'Frozen').length, i: <Lock className="h-5 w-5 text-blue-500" />, bg: 'bg-blue-50' },
                    { l: 'Banned', v: users.filter(u => u.status === 'Banned').length, i: <Ban className="h-5 w-5 text-red-500" />, bg: 'bg-red-50' },
                    { l: 'High Risk', v: users.filter(u => u.riskScore > 50).length, i: <ShieldAlert className="h-5 w-5 text-yellow-500" />, bg: 'bg-yellow-50' },
                ].map(s => (
                    <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
                        <div className={`p-2 rounded-xl ${s.bg}`}>{s.i}</div>
                        <div><div className="text-2xl font-bold text-gray-900">{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search username or emailâ€¦" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-orange-400 transition-all" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400" /></button>}
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                        {['All', 'Active', 'Frozen', 'Banned', 'Pending', 'Deleted'].map(s => (
                            <button key={s} onClick={() => { setStatusF(s); setPage(1); }}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${statusF === s ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{s}</button>
                        ))}
                    </div>
                    <select value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-orange-400">
                        {['All Roles', 'User', 'Admin', 'Advertiser'].map(r => <option key={r} value={r === 'All Roles' ? 'All' : r}>{r}</option>)}
                    </select>
                    {selected.size > 0 && (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 ml-auto">
                            <span className="text-sm font-semibold text-orange-700">{selected.size} selected</span>
                            <div className="w-px h-4 bg-orange-200" />
                            {[['freeze', 'Freeze'], ['unfreeze', 'Unfreeze'], ['ban', 'ðŸš« Ban'], ['send_notification', 'Message']].map(([a, l]) => (
                                <button key={a} onClick={() => bulk(a)} className={`text-xs font-semibold hover:underline ${a === 'ban' ? 'text-red-600' : 'text-orange-600'}`}>{l}</button>
                            ))}
                            <button onClick={() => setSelected(new Set())}><X className="h-3.5 w-3.5 text-gray-400" /></button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100 bg-gray-50/70">
                                <th className="px-4 py-3 w-10 text-center"><input type="checkbox" className="accent-orange-500 h-4 w-4" checked={paged.length > 0 && paged.every(u => selected.has(u.id))} onChange={toggleAll} /></th>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Plan</th>
                                <th className="px-4 py-3 text-right">Balance</th>
                                <th className="px-4 py-3 text-left">Risk</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Joined</th>
                                <th className="px-4 py-3 text-center">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paged.map(user => {
                                const sc = cfg(user.status);
                                return (
                                    <tr key={user.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-4 py-3.5 text-center"><input type="checkbox" className="accent-orange-500 h-4 w-4" checked={selected.has(user.id)} onChange={() => toggleOne(user.id)} /></td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <button onClick={() => setActiveUser(user)} className="font-semibold text-gray-900 hover:text-orange-600 transition-colors text-left">@{user.username}</button>
                                                    <div className="text-xs text-gray-400">{user.email || 'â€”'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[user.role] || 'bg-gray-100 text-gray-600'}`}>{user.role}</span></td>
                                        <td className="px-4 py-3.5"><span className={`text-xs px-2 py-0.5 rounded-md font-medium ${user.plan && user.plan !== 'None' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-100 text-gray-400'}`}>{user.plan || 'None'}</span></td>
                                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900 font-mono">${user.balance}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${user.riskScore > 70 ? 'bg-red-500' : user.riskScore > 40 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${Math.min(user.riskScore, 100)}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-500">{user.riskScore}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />{user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'â€”'}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button onClick={() => setActiveUser(user)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paged.length === 0 && (
                                <tr><td colSpan={9} className="py-16 text-center text-gray-400">
                                    <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                                    <p>No users match your filters.</p>
                                    <button onClick={() => { setSearch(''); setStatusF('All'); setRoleF('All'); }} className="mt-2 text-sm text-orange-500 hover:underline">Clear filters</button>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
                    <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PER + 1}â€“{Math.min(page * PER, filtered.length)} of {filtered.length}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50">â†</button>
                        {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-lg border transition-colors ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>{p}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 rounded-lg border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50">â†’</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
