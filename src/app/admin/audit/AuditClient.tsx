'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, History, ShieldAlert } from 'lucide-react';

interface AuditLog {
    id: string;
    adminId: string;
    adminUsername: string;
    targetUserId: string | null;
    targetUsername: string | null;
    action: string;
    category: string;
    description: string;
    severity: string;
    ipAddress: string | null;
    createdAt: string;
}

export default function AuditClient({ initialLogs }: { initialLogs: AuditLog[] }) {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');

    const filteredLogs = useMemo(() => {
        return initialLogs.filter(log => {
            const matchesSearch =
                log.adminUsername.toLowerCase().includes(search.toLowerCase()) ||
                (log.targetUsername && log.targetUsername.toLowerCase().includes(search.toLowerCase())) ||
                log.description.toLowerCase().includes(search.toLowerCase());

            const matchesAction = actionFilter === 'All' || log.category === actionFilter;
            const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;

            return matchesSearch && matchesAction && matchesSeverity;
        });
    }, [initialLogs, search, actionFilter, severityFilter]);

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const getSeverityIndicator = (severity: string) => {
        switch (severity) {
            case 'critical': return <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" title="Critical" />;
            case 'high': return <div className="w-3 h-3 rounded-full bg-orange-500" title="High" />;
            case 'medium': return <div className="w-3 h-3 rounded-full bg-yellow-500" title="Medium" />;
            default: return <div className="w-3 h-3 rounded-full bg-slate-500" title="Low" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#09090f] text-[#f8fafc] p-8 font-sans">
            <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-syne text-white flex items-center gap-3">
                        <History className="text-[#f97316] h-8 w-8" />
                        Global Audit Log
                    </h1>
                </div>

                {/* Filters & Search */}
                <div className="bg-[#0f0f1a] border border-[#1f1f35] p-4 rounded-xl mb-6 flex gap-4 items-center">
                    <div className="relative flex-1 ">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search logs: user, admin, action..."
                            className="w-full bg-[#1a1a2e] border border-[#1f1f35] focus:border-[#f97316] text-white pl-10 pr-4 py-2 rounded-lg outline-none transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-[#1a1a2e] border border-[#1f1f35] text-white px-4 py-2 rounded-lg outline-none focus:border-[#f97316]"
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="account">Account Changes</option>
                        <option value="financial">Financial</option>
                        <option value="security">Security</option>
                        <option value="bulk">Bulk Actions</option>
                        <option value="communication">Communication</option>
                    </select>

                    <select
                        className="bg-[#1a1a2e] border border-[#1f1f35] text-white px-4 py-2 rounded-lg outline-none focus:border-[#f97316]"
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value)}
                    >
                        <option value="All">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-[#0f0f1a] border border-[#1f1f35] rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1a1a2e] border-b border-[#1f1f35] text-[#94a3b8] text-sm uppercase tracking-wider">
                                <th className="p-4 w-24">Time</th>
                                <th className="p-4 w-48">Admin</th>
                                <th className="p-4 w-48">Target User</th>
                                <th className="p-4">Action & Description</th>
                                <th className="p-4 w-12 text-center">⚡</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="border-b border-[#1f1f35]/50 hover:bg-[#141425] transition-colors">
                                    <td className="p-4 text-sm text-[#475569] font-mono">
                                        {getTimeAgo(log.createdAt)}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className="text-[#f97316] font-medium">@{log.adminUsername}</span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {log.targetUsername ? (
                                            <Link href={`/admin/users/${log.targetUserId}`} className="text-white hover:text-[#f97316] hover:underline font-medium">
                                                @{log.targetUsername}
                                            </Link>
                                        ) : (
                                            <span className="text-[#475569] italic">System</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-[#1a1a2e] border border-[#1f1f35] px-2 py-0.5 rounded text-xs text-[#94a3b8] w-fit font-mono">
                                                {log.action}
                                            </span>
                                            <span className="text-sm text-[#cbd5e1]">{log.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 flex justify-center">
                                        {getSeverityIndicator(log.severity)}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-[#475569]">
                                        <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No audit logs found matching criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
