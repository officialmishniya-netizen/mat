'use client';

import React, { useState, useTransition } from 'react';
import { addVpnRangeAction, removeVpnRangeAction } from '@/app/actions/fraud-admin';
import { toast } from 'react-hot-toast';
import { Globe, Trash2, Plus } from 'lucide-react';

interface Range {
    id: string;
    cidr: string;
    providerName: string | null;
    rangeType: string;
}

interface Props {
    initialRanges: Range[];
}

export default function VpnRangeManager({ initialRanges }: Props) {
    const [ranges, setRanges] = useState<string>('');
    const [provider, setProvider] = useState<string>('');
    const [type, setType] = useState<string>('vpn');
    const [isPending, startTransition] = useTransition();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ranges.trim()) return;

        const cidrList = ranges.split('\n').map(r => r.trim()).filter(r => r);
        if (!cidrList.length) return;

        startTransition(async () => {
            let successCount = 0;
            for (const cidr of cidrList) {
                const res = await addVpnRangeAction(cidr, provider, type);
                if (res.success) successCount++;
            }
            toast.success(`Uploaded ${successCount} ranges`);
            setRanges('');
            setProvider('');
        });
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this CIDR range?')) return;
        startTransition(async () => {
            const res = await removeVpnRangeAction(id);
            if (res.success) {
                toast.success('Range removed');
            } else {
                toast.error(res.error || 'Failed to remove');
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-[#151d48]">VPN Range Database</h2>
                <span className="text-xs text-gray-400 font-medium">{initialRanges.length} CIDR ranges loaded</span>
            </div>
            <div className="p-6">
                <form onSubmit={handleUpload} className="mb-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">
                        Bulk IP Range Import (CIDR)
                    </label>
                    <textarea
                        value={ranges}
                        onChange={(e) => setRanges(e.target.value)}
                        rows={4}
                        className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary/20 transition-all mb-4"
                        placeholder={"10.8.0.0/8\n185.220.101.0/24"}
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            placeholder="Provider (e.g. NordVPN)"
                            className="flex-1 bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/20"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        >
                            <option value="vpn">VPN / Proxy</option>
                            <option value="tor">Tor Exit Node</option>
                            <option value="datacenter">Datacenter / Bot</option>
                        </select>
                        <button
                            type="submit"
                            disabled={isPending || !ranges.trim()}
                            className="bg-primary text-white font-black px-8 py-2.5 rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 justify-center disabled:opacity-50"
                        >
                            <Plus size={18} />
                            <span>Upload Ranges</span>
                        </button>
                    </div>
                </form>

                <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 px-2">Active CIDR Rules (Showing latest 50)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {initialRanges.slice(0, 50).map((r) => (
                            <div key={r.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:border-primary/10 transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${r.rangeType === 'tor' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                        <Globe size={16} />
                                    </div>
                                    <div>
                                        <code className="font-mono text-sm font-bold text-[#151d48]">{r.cidr}</code>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            {r.providerName || 'Unknown Provider'} • <span className="uppercase tracking-tighter">{r.rangeType}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(r.id)}
                                    disabled={isPending}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {initialRanges.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe size={24} className="text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-medium">No ranges loaded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
