"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    ShoppingBag, Tags, Zap, Ticket, Layout as LayoutIcon,
    BarChart3, Plus, Edit2, Trash2, Eye, EyeOff, Search,
    CheckCircle2, XCircle, ExternalLink,
    Loader2, X, Save, AlertCircle
} from 'lucide-react';
import { getMarketplaceData } from '@/app/actions/marketplace';
import {
    upsertCategory,
    deleteCategory,
    upsertMarketplaceItem,
    deleteMarketplaceItem
} from '@/app/actions/marketplace-admin';

// --- Local UI Components (Raw Tailwind) ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white border border-[#eff0f6] rounded-2xl overflow-hidden shadow-sm ${className}`}>
        {children}
    </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", ...props }: any) => {
    const variants: any = {
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/10",
        secondary: "bg-gray-50 hover:bg-gray-100 text-[#151d48] border border-gray-200",
        outline: "bg-transparent border border-gray-200 hover:bg-gray-50 text-[#737791]",
        ghost: "bg-transparent hover:bg-gray-50 text-[#737791] hover:text-[#151d48]",
        destructive: "bg-red-50 hover:bg-red-100 text-red-500 border border-red-100"
    };
    const sizes: any = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2"
    };
    return (
        <button className={`inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Input = ({ className = "", ...props }: any) => (
    <input
        className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#151d48] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 ${className}`}
        {...props}
    />
);

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <label className={`block text-[10px] font-black text-[#737791] uppercase tracking-[0.2em] mb-2 ${className}`}>
        {children}
    </label>
);

const Switch = ({ checked, onChange, label }: any) => (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
        <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        {label && <span className="text-sm font-semibold text-[#737791] group-hover:text-[#151d48] transition-colors">{label}</span>}
    </div>
);

const Badge = ({ children, variant = "default", className = "" }: any) => {
    const variants: any = {
        default: "bg-gray-100 text-[#737791] border-gray-200",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100",
        warning: "bg-amber-50 text-amber-600 border-amber-100",
        error: "bg-rose-50 text-rose-600 border-rose-100",
        blue: "bg-indigo-50 text-indigo-600 border-indigo-100"
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// --- Main Page Component ---

export default function AdminMarketplace() {
    const [activeTab, setActiveTab] = useState("items");
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeSales, setActiveSales] = useState<any[]>([]);

    const [modalMode, setModalMode] = useState<'item' | 'category' | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    // Custom Toast State
    const [toasts, setToasts] = useState<any[]>([]);

    const toast = useCallback((type: 'success' | 'error', message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    // Initial Fetch
    const refreshData = async () => {
        setLoading(true);
        const res = await getMarketplaceData();
        if (res.success && res.data) {
            setItems(res.data.items || []);
            setCategories(res.data.categories || []);
            setActiveSales(res.data.activeSales || []);
        } else {
            toast('error', "Failed to load marketplace data");
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const openModal = (mode: 'item' | 'category', data: any = null) => {
        setModalMode(mode);
        if (data) {
            setFormData(data);
            setSelectedId(data.id);
        } else {
            setFormData(mode === 'category' ? {
                isActive: true,
                isVisible: true,
                sortOrder: 0,
                colorHex: '#6366f1'
            } : {
                isActive: true,
                isVisible: true,
                sortOrder: 0,
                itemType: 'watch_booster',
                price: "0",
                effectMetadata: {}
            });
            setSelectedId(null);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let res;
        if (modalMode === 'category') {
            res = await upsertCategory(formData);
        } else {
            res = await upsertMarketplaceItem(formData);
        }

        if (res.success) {
            toast('success', `${modalMode} saved successfully`);
            setModalMode(null);
            refreshData();
        } else {
            toast('error', res.error || "Operation failed");
            setLoading(false);
        }
    };

    const handleDelete = async (mode: 'item' | 'category', id: string) => {
        if (!confirm(`Are you sure you want to delete this ${mode}?`)) return;
        setLoading(true);
        const res = mode === 'category' ? await deleteCategory(id) : await deleteMarketplaceItem(id);
        if (res.success) {
            toast('success', "Deleted successfully");
            refreshData();
        } else {
            toast('error', res.error || "Delete failed");
            setLoading(false);
        }
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-t-2 border-indigo-500 animate-spin" />
                    <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Marketplace...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-7xl px-4 md:px-8 space-y-12">

            {/* Custom Toasts Overlay */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map(t => (
                    <div key={t.id} className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/90 border-rose-500/30 text-rose-400'}`}>
                        {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="text-sm font-bold">{t.message}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-[#151d48] flex items-center gap-4">
                        Marketplace <span className="text-indigo-600 italic font-medium">Control</span>
                    </h1>
                    <p className="text-[#737791] font-medium">Powering the digital economy of MatClick.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="md" onClick={() => window.open('/dashboard/marketplace', '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2 text-indigo-600" />
                        Live Store
                    </Button>
                    <Button size="md" onClick={() => openModal('item')}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Item
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-inner scrollbar-none overflow-x-auto">
                {[
                    { id: 'items', icon: ShoppingBag, label: 'Items' },
                    { id: 'categories', icon: Tags, label: 'Categories' },
                    { id: 'sales', icon: Zap, label: 'Flash Sales' },
                    { id: 'discounts', icon: Ticket, label: 'Coupons' },
                    { id: 'layout', icon: LayoutIcon, label: 'Layout' },
                    { id: 'analytics', icon: BarChart3, label: 'Insights' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-y-[-2px]'
                            : 'text-[#737791] hover:text-[#151d48] hover:bg-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {activeTab === 'items' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737791]" />
                                <Input placeholder="Filter catalog..." className="pl-12 bg-white" />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#151d48] focus:outline-none focus:ring-1 focus:ring-indigo-600">
                                    <option>All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr className="text-[#737791] font-black uppercase tracking-[0.1em] text-[10px]">
                                            <th className="px-8 py-5">Product Details</th>
                                            <th className="px-8 py-5">Category</th>
                                            <th className="px-8 py-5">Item Class</th>
                                            <th className="px-8 py-5">Base Price</th>
                                            <th className="px-8 py-5">Sales Data</th>
                                            <th className="px-8 py-5">System state</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {items.map(item => (
                                            <tr key={item.id} className="hover:bg-indigo-50 transition-all group border-l-2 border-transparent hover:border-indigo-600">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                                            {item.iconEmoji}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-[#151d48] text-base">{item.name}</div>
                                                            <div className="text-[10px] text-indigo-600 font-mono italic tracking-tighter uppercase">{item.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <Badge variant="blue">{categories.find(c => c.id === item.categoryId)?.name || 'General'}</Badge>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs text-[#737791] font-mono font-bold bg-gray-100 px-2 py-1 rounded-md tracking-widest">{item.itemType}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="font-black text-[#151d48] text-lg tracking-tight">${item.price}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-bold text-[#151d48]">{item.totalPurchases || 0} <span className="text-[#737791] font-medium">units</span></div>
                                                        <div className="text-xs text-emerald-600 font-black">${item.totalRevenue || "0.00"}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {item.isActive ? (
                                                        <Badge variant="success">Online</Badge>
                                                    ) : (
                                                        <Badge variant="error">Disabled</Badge>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 pr-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openModal('item', item)}>
                                                            <Edit2 className="w-4 h-4 text-indigo-600" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="group/del" onClick={() => handleDelete('item', item.id)}>
                                                            <Trash2 className="w-4 h-4 text-red-500/50 group-hover/del:text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {items.length === 0 && (
                                    <div className="p-20 text-center space-y-4">
                                        <ShoppingBag className="w-12 h-12 text-slate-800 mx-auto" />
                                        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">The marketplace logic is clean. No items deployed yet.</p>
                                        <Button variant="outline" size="sm" onClick={() => openModal('item')}>Create First Item</Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map(cat => (
                            <Card key={cat.id} className="group relative transition-all hover:translate-y-[-8px] hover:shadow-indigo-600/10 active:scale-95 cursor-default">
                                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: cat.colorHex }} />
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 text-5xl flex items-center justify-center bg-gray-50 rounded-3xl shadow-inner border border-[#eff0f6]">
                                            {cat.iconEmoji}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openModal('category', cat)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-rose-500/50 hover:text-rose-600" onClick={() => handleDelete('category', cat.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-[#151d48] mb-2">{cat.name}</h3>
                                    <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mb-6 opacity-60">{cat.slug}</p>

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-3">
                                            {cat.isActive ? <Badge variant="success">Live</Badge> : <Badge>Draft</Badge>}
                                            {!cat.isVisible && <Badge variant="warning">Hidden</Badge>}
                                        </div>
                                        <div className="text-[10px] text-[#737791] font-black tracking-[0.2em] flex flex-col items-end">
                                            <span>PRIORITY</span>
                                            <span className="text-[#151d48] text-base leading-none">0{cat.sortOrder}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <button
                            onClick={() => openModal('category')}
                            className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-6 text-gray-400 hover:text-indigo-600 hover:border-indigo-600/50 hover:bg-indigo-50 transition-all group overflow-hidden relative"
                        >
                            <div className="p-6 rounded-full bg-white border border-gray-100 group-hover:scale-125 transition-transform duration-500 z-10">
                                <Plus className="w-8 h-8 text-indigo-600" />
                            </div>
                            <span className="font-black uppercase tracking-[0.2em] text-[10px] z-10 transition-colors group-hover:text-indigo-800">Catalog Extension</span>
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 group-hover:to-indigo-600/5 transition-all duration-700" />
                        </button>
                    </div>
                )}

                {['sales', 'discounts', 'layout'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center p-32 border-4 border-double border-gray-100 rounded-[3rem] bg-white text-center space-y-6">
                        <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 shadow-xl shadow-indigo-600/5">
                            {activeTab === 'sales' && <Zap className="w-16 h-16 text-amber-500 animate-pulse" />}
                            {activeTab === 'discounts' && <Ticket className="w-16 h-16 text-indigo-600 animate-bounce" />}
                            {activeTab === 'layout' && <LayoutIcon className="w-16 h-16 text-fuchsia-600 animate-spin-slow" />}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-[#151d48] tracking-tight uppercase">{activeTab} Interface</h3>
                            <p className="text-[#737791] max-w-md mx-auto text-base font-medium leading-relaxed">
                                Advanced {activeTab} orchestration is currently under development. All underlying ledger logic is ready.
                            </p>
                        </div>
                        <Button variant="secondary" className="px-10">Notify when Ready</Button>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-10">
                        <div className="grid gap-6 md:grid-cols-3">
                            {[
                                { label: 'Platform Revenue', value: `$${items.reduce((acc, i) => acc + parseFloat(i.totalRevenue || 0), 0).toFixed(2)}`, accent: 'from-emerald-600 to-teal-500' },
                                { label: 'Items Sold', value: items.reduce((acc, i) => acc + (i.totalPurchases || 0), 0), accent: 'from-indigo-600 to-blue-500' },
                                { label: 'Active Promotions', value: '0', accent: 'from-amber-600 to-orange-500' },
                            ].map((stat, idx) => (
                                <Card key={idx} className="p-8 group hover:border-gray-200 transition-colors">
                                    <div className="text-[10px] text-[#737791] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</div>
                                    <div className={`text-5xl font-black bg-gradient-to-r ${stat.accent} bg-clip-text text-transparent tracking-tighter`}>{stat.value}</div>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] text-[#737791] font-bold">
                                        <TrendingUp className="w-3 h-3" /> PREVIEW MODE ONLY
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <Card className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative border-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_100%)] animate-pulse" />
                            <BarChart3 className="w-24 h-24 text-gray-200 mb-6 relative z-10" />
                            <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs relative z-10">Data Visualization Engine Offline</p>
                        </Card>
                    </div>
                )}

            </div>

            {/* Modals --- System Overlays --- */}
            {modalMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#151d48]/40 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl border-indigo-600/10 shadow-[0_0_100px_-20px_rgba(99,102,241,0.1)] max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 bg-white">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-[#151d48] uppercase tracking-tight">{selectedId ? 'Modify' : 'Initialize'} {modalMode}</h2>
                                <p className="text-xs text-[#737791] mt-1 font-medium tracking-wide">Registry ID: {selectedId || 'SYSTEM_NEW'}</p>
                            </div>
                            <button onClick={() => setModalMode(null)} className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-[#737791] hover:text-[#151d48]">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
                            {modalMode === 'category' ? (
                                <div className="grid gap-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input
                                                placeholder="e.g. Premium Tools"
                                                value={formData.name || ''}
                                                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Registry Slug</Label>
                                            <Input
                                                placeholder="e.g. premium-tools"
                                                value={formData.slug || ''}
                                                onChange={(e: any) => setFormData({ ...formData, slug: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Visual Icon (Emoji)</Label>
                                            <Input
                                                placeholder="💎"
                                                value={formData.iconEmoji || ''}
                                                onChange={(e: any) => setFormData({ ...formData, iconEmoji: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Branding Color</Label>
                                            <Input
                                                type="color"
                                                value={formData.colorHex || '#6366f1'}
                                                onChange={(e: any) => setFormData({ ...formData, colorHex: e.target.value })}
                                                className="h-11 px-1 py-1 cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Display priority</Label>
                                            <Input
                                                type="number"
                                                value={formData.sortOrder || 0}
                                                onChange={(e: any) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-8 py-8 border-t border-gray-100">
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(val: any) => setFormData({ ...formData, isActive: val })}
                                            label="System state: Online"
                                        />
                                        <Switch
                                            checked={formData.isVisible}
                                            onChange={(val: any) => setFormData({ ...formData, isVisible: val })}
                                            label="Public Catalog Visibility"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Product Identifier</Label>
                                            <Input
                                                placeholder="e.g. Ultimate Booster"
                                                value={formData.name || ''}
                                                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category Assignment</Label>
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#151d48] focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                                value={formData.categoryId || ''}
                                                onChange={(e: any) => setFormData({ ...formData, categoryId: e.target.value })}
                                                required
                                            >
                                                <option value="">Choose Catalog Section...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Marketing Tagline</Label>
                                        <Input
                                            placeholder="Captivate the user with 1 sentence..."
                                            value={formData.tagline || ''}
                                            onChange={(e: any) => setFormData({ ...formData, tagline: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>Price (Nexus $)</Label>
                                            <Input
                                                type="number" step="0.01"
                                                value={formData.price || "0.00"}
                                                onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Product Icon</Label>
                                            <Input
                                                placeholder="📦"
                                                value={formData.iconEmoji || ''}
                                                onChange={(e: any) => setFormData({ ...formData, iconEmoji: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Effect Engine logic</Label>
                                            <select
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#151d48] focus:outline-none focus:ring-1 focus:ring-indigo-600"
                                                value={formData.itemType || 'watch_booster'}
                                                onChange={(e: any) => setFormData({ ...formData, itemType: e.target.value })}
                                                required
                                            >
                                                <option value="watch_booster">Watch Booster</option>
                                                <option value="cycle_accelerator">Cycle Accelerator</option>
                                                <option value="pool_ticket">Pool Ticket</option>
                                                <option value="surprise_box">Surprise Box</option>
                                                <option value="spin_token">Spin Token</option>
                                                <option value="ad_point_bundle">Ad Point Bundle</option>
                                                <option value="balance_bundle">Balance Bundle</option>
                                                <option value="plan_upgrade_credit">Plan Upgrade Credit</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-gray-50 rounded-[2rem] border-2 border-gray-100 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-indigo-600 font-extrabold italic mb-0">System Effect Metadata (JSON)</Label>
                                            <code className="text-[10px] text-[#737791] font-bold bg-white px-2 py-1 rounded border border-gray-100 uppercase tracking-tighter">Internal Engine Only</code>
                                        </div>
                                        <textarea
                                            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-[11px] font-mono text-indigo-600 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 whitespace-pre"
                                            placeholder='{\n  "extraAdsPerDay": 5,\n  "durationDays": 7\n}'
                                            value={typeof formData.effectMetadata === 'string' ? formData.effectMetadata : JSON.stringify(formData.effectMetadata || {}, null, 2)}
                                            onChange={(e: any) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setFormData({ ...formData, effectMetadata: parsed });
                                                } catch {
                                                    setFormData({ ...formData, effectMetadata: e.target.value });
                                                }
                                            }}
                                        />
                                        <p className="text-[10px] text-[#737791] font-medium leading-relaxed">Define technical triggers here. Incompatible JSON will cause effect engine failures.</p>
                                    </div>

                                    <div className="flex flex-wrap gap-x-10 gap-y-6 pt-6 border-t border-gray-100">
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(val: any) => setFormData({ ...formData, isActive: val })}
                                            label="Active state"
                                        />
                                        <Switch
                                            checked={formData.isVisible}
                                            onChange={(val: any) => setFormData({ ...formData, isVisible: val })}
                                            label="Store Listing"
                                        />
                                        <Switch
                                            checked={formData.isFeatured}
                                            onChange={(val: any) => setFormData({ ...formData, isFeatured: val })}
                                            label="Nexus Feature"
                                        />
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 rounded-b-3xl">
                            <Button variant="ghost" onClick={() => setModalMode(null)}>Discard</Button>
                            <Button onClick={handleFormSubmit} className="px-12">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                                Sync With Live Registry
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

// Helper icons
function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
