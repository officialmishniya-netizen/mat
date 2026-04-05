"use client";

import {
    TrendingUp,
    Users,
    RefreshCcw,
    MousePointerClick,
    Zap,
    DollarSign,
    ArrowRight,
    ChevronRight,
    Download,
    Filter,
    MoreHorizontal,
    TrendingDown,
    Award,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Cpu,
    MessageSquare,
    MoreVertical,
    ArrowDownLeft,
    ArrowUpRight,
    ListOrdered,
    Landmark,
    Globe,
    ShoppingCart
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate, formatTime } from "@/lib/utils";
import { CopyButton } from "./promotion/CopyButton";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useState, useEffect } from "react";
import { getSiteSettings, SiteSettings } from "@/lib/settings";

interface DashboardOverviewProps {
    balance: string;
    purchaseBalance: string;
    totalEarnings: string;
    referralBonus: string;
    matchingBonus: string;
    adCredits: number;
    matrixCount: number;
    matrixCycles: number;
    referralCount: number;
    activeCycles: any;
    referralLink: string;
    adRewardTotal: string;
    recentTransactions: any[];
    communityPoolTotal: string;
    topEarners: any[];
    recentShouts: any[];
    dailyEarnings: number[];
}

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'deposit':
            return { icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-50', label: 'Deposit' };
        case 'withdrawal':
            return { icon: Landmark, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Withdrawal' };
        case 'ad_reward':
            return { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Ad View Reward' };
        case 'matrix_cycle':
            return { icon: RefreshCcw, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Matrix Cycle' };
        case 'referral_bonus':
            return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Referral Bonus' };
        case 'matching_bonus':
            return { icon: Globe, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Matching Bonus' };
        case 'matrix_purchase':
            return { icon: ShoppingCart, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Level Purchase' };
        case 'transfer_in':
            return { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'P2P Received' };
        case 'transfer_out':
            return { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50', label: 'P2P Sent' };
        default:
            return { icon: ListOrdered, color: 'text-gray-600', bg: 'bg-gray-100', label: type };
    }
};

// Simple Sparkline Component (SVG)
const Sparkline = ({ color = "#5d5fef", data = [30, 40, 35, 50, 49, 60, 70, 91] }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const width = 100;
    const height = 30;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} className="mt-2 overflow-visible">
            <path
                d={`M ${points}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export function DashboardOverview({
    balance,
    purchaseBalance,
    totalEarnings,
    referralBonus,
    matchingBonus,
    adCredits,
    matrixCount,
    matrixCycles,
    referralCount,
    activeCycles,
    referralLink,
    adRewardTotal,
    recentTransactions,
    communityPoolTotal,
    topEarners,
    recentShouts,
    dailyEarnings
}: DashboardOverviewProps) {
    const { t, language } = useTranslation();
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">Account Summary</h1>
                    <p className="text-[#737791] font-medium text-sm mt-1">{t("dashboard.welcome_back")}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden sm:flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm text-sm font-semibold text-[#444a6d]">
                        <Filter size={16} className="text-[#737791]" />
                        <span>Filter: All-time</span>
                        <ChevronRight size={14} className="rotate-90 text-[#a0a8b9]" />
                    </div>
                </div>
            </div>

            {/* KPI Cards Section - Row 1: Primary Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* Available Balance */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 flex flex-col justify-between h-[180px] hover:shadow-lg transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-[#737791] uppercase tracking-wider">{t("dashboard.available_balance")}</p>
                            <DollarSign size={18} className="text-primary opacity-40" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-black text-[#151d48] tracking-tighter">{formatMoney(balance)}</span>
                        </div>
                    </div>
                    <Sparkline color="#f97316" data={dailyEarnings.slice(-8)} />
                </div>

                {/* Locked Balance */}
                <div className="bg-white border-2 border-dashed border-gray-100 p-6 rounded-[32px] hover:border-orange-500/20 shadow-sm flex flex-col justify-between h-[180px] transition-all group relative overflow-hidden">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-black text-[#737791] uppercase tracking-widest">Locked Balance</p>
                            <div className="bg-gray-100 p-1.5 rounded-lg text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                                <Lock size={14} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-gray-400 tracking-tighter group-hover:text-[#151d48] transition-colors">
                                {formatMoney(activeCycles ? (activeCycles.clicks_completed / activeCycles.ad_levels.clicks_per_cycle) * parseFloat(activeCycles.ad_levels.withdrawal_on_completion) : 0)}
                            </span>
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Unlocks on cycle</span>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gray-300 group-hover:bg-orange-400 rounded-full transition-all duration-1000"
                            style={{ width: `${activeCycles ? (activeCycles.clicks_completed / activeCycles.ad_levels.clicks_per_cycle) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Purchase Balance */}
                <div className="bg-[#151d48] p-6 rounded-[32px] shadow-xl shadow-blue-900/10 border border-blue-900/20 flex flex-col justify-between h-[180px] hover:scale-[1.02] transition-all group text-white">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest">Purchase Balance</p>
                            <Download size={18} className="text-blue-400 opacity-60" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-black tracking-tighter">{formatMoney(purchaseBalance)}</span>
                        </div>
                    </div>
                    <Sparkline color="#3b82f6" data={dailyEarnings.slice(-8)} />
                </div>

                {/* Total Earnings */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 flex flex-col justify-between h-[180px] hover:shadow-lg transition-all group relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-green-500/5 rounded-full -mb-10 -mr-10"></div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-black text-[#737791] uppercase tracking-widest">Total Earnings</p>
                            <TrendingUp size={18} className="text-green-500 opacity-40" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-black text-[#151d48] tracking-tighter">{formatMoney(totalEarnings)}</span>
                        </div>
                    </div>
                    <Sparkline color="#22c55e" data={dailyEarnings.slice(-8)} />
                </div>

                {/* Ad Credits */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-[32px] shadow-lg shadow-orange-500/20 flex flex-col justify-between h-[180px] hover:shadow-xl transition-all group text-white">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-black text-orange-100 uppercase tracking-widest">Ad Credits</p>
                            <Zap size={18} className="text-white opacity-60" />
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-black tracking-tighter">{adCredits}</span>
                            <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded-full tracking-widest">CREDITS</span>
                        </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${i < 5 ? 'bg-white' : 'bg-white/30'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Community Pool Bucket */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-primary/10 flex flex-col justify-between h-[180px] hover:shadow-lg transition-all group relative overflow-hidden bg-gradient-to-br from-white to-primary/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 animate-pulse"></div>
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-black text-primary uppercase tracking-widest">Community Pool</p>
                            <Globe size={18} className="text-primary animate-spin-slow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-[#151d48] tracking-tighter">${parseFloat(communityPoolTotal || "0").toFixed(2)}</span>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Live Global Rewards</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=pool${i}`} alt="user" className="w-full h-full" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-[#737791] uppercase tracking-tighter">Verified Global Rewards</span>
                    </div>
                </div>
            </div>

            {/* Row 2: Bonuses & Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {/* Referral Bonus */}
                <div className="bg-white border-2 border-dashed border-gray-100 p-6 rounded-[32px] hover:border-primary/20 transition-all group">
                    <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                        <Users size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#737791] uppercase tracking-widest mb-1">Referral Bonus</p>
                    <h4 className="text-2xl font-black text-[#151d48]">{formatMoney(referralBonus)}</h4>
                </div>

                {/* Matching Bonus */}
                <div className="bg-white border-2 border-dashed border-gray-100 p-6 rounded-[32px] hover:border-green-500/20 transition-all group">
                    <div className="bg-green-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-green-500 mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#737791] uppercase tracking-widest mb-1">Matching Bonus</p>
                    <h4 className="text-2xl font-black text-[#151d48]">{formatMoney(matchingBonus)}</h4>
                </div>

                {/* Matrix Click Earnings */}
                <div className="bg-white border-2 border-dashed border-gray-100 p-6 rounded-[32px] hover:border-blue-500/20 transition-all group">
                    <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <MousePointerClick size={20} />
                    </div>
                    <p className="text-xs font-bold text-[#737791] uppercase tracking-widest mb-1">Ad Click Earnings</p>
                    <h4 className="text-2xl font-black text-[#151d48]">{formatMoney(adRewardTotal)}</h4>
                </div>

                {/* Matrix Status */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 group hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-[#737791] uppercase tracking-[0.2em]">Ad Click Mastery</p>
                        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                            <Award size={18} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex-1">
                            <h4 className="text-3xl font-black text-[#151d48] tracking-tighter">{matrixCycles}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">COMPLETED CYCLES</p>
                        </div>
                        <div className="flex -space-x-3">
                            {Array.from({ length: Math.min(3, matrixCycles) }).map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-2xl bg-orange-500 text-white border-4 border-white flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                                    <ShieldCheck size={18} />
                                </div>
                            ))}
                            {matrixCycles > 3 && (
                                <div className="w-10 h-10 rounded-2xl bg-[#151d48] border-4 border-white flex items-center justify-center text-xs font-black text-white shadow-lg">
                                    +{matrixCycles - 3}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active & Earning</span>
                    </div>
                </div>

                {/* Total Referrals */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 group hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black text-[#737791] uppercase tracking-[0.2em]">Network Force</p>
                        <div className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                            +{referralCount} New
                        </div>
                    </div>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-black text-[#151d48] tracking-tighter">{referralCount}</span>
                        <span className="text-[10px] font-black text-gray-400 pb-2 uppercase tracking-widest">PARTNERS</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full mt-6 overflow-hidden border border-gray-100 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full w-[65%] shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid (Chart + Side Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart Section */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-[#151d48] tracking-tight">Earning Pulse</h3>
                            <p className="text-sm font-medium text-[#737791]">Daily click and matrix cycle overview</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-[#151d48]/5 px-4 py-2 rounded-2xl text-[10px] font-black text-[#151d48] uppercase tracking-widest">
                            <span>Real-time Growth</span>
                            <TrendingUp size={14} className="text-green-500" />
                        </div>
                    </div>

                    {/* Real Bar Chart */}
                    <div className="flex-1 flex items-end justify-between gap-3 min-h-[300px] pb-6 px-2">
                        {dailyEarnings.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                                <div className="w-full relative">
                                    <div
                                        className={`w-full rounded-2xl transition-all duration-700 group-hover:scale-110 group-hover:shadow-lg ${i === dailyEarnings.length - 1 ? 'bg-primary' : (i % 2 === 0 ? 'bg-[#151d48] shadow-blue-900/10' : 'bg-primary/20 group-hover:bg-primary/40')}`}
                                        style={{ height: `${Math.max(10, val * 5)}px` }}
                                    ></div>
                                </div>
                                <span className="mt-4 text-[8px] font-black text-[#a0a8b9] uppercase tracking-tighter group-hover:text-primary transition-colors">D{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side Sections (Ad Level & Matrix Progress) */}
                <div className="space-y-8">
                    {/* Active Ad Cycle Progress */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8">
                            <div className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                {activeCycles ? `Lv. ${activeCycles.ad_level_id}` : 'No Level'}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-[#151d48] tracking-tight mb-8">Active Ad Cycle</h3>
                        {activeCycles ? (
                            <div className="space-y-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-orange-500/20 group-hover:rotate-12 transition-transform duration-500">
                                        <RefreshCcw size={32} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-black text-[#151d48] text-sm uppercase tracking-tight truncate">{activeCycles.ad_levels.name}</span>
                                            <span className="text-xl font-black text-orange-600 tracking-tighter">{Math.floor((activeCycles.clicks_completed / activeCycles.ad_levels.clicks_per_cycle) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,88,12,0.3)]"
                                                style={{ width: `${(activeCycles.clicks_completed / activeCycles.ad_levels.clicks_per_cycle) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-[#737791] uppercase tracking-widest mb-1">Cycle Payout</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-[#151d48] tracking-tighter">${parseFloat(activeCycles.ad_levels.withdrawal_on_completion).toFixed(2)}</span>
                                            <span className="text-xs font-bold text-green-500">REWARD</span>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/ads" className="w-14 h-14 bg-[#151d48] text-white rounded-3xl hover:bg-primary transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center group/btn">
                                        <ArrowRight size={28} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <Cpu className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-sm font-bold text-gray-500 mb-4">No active cycle found.</p>
                                <Link href="/dashboard/cycles" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:secondary transition-all">
                                    <span>Browse Plans</span>
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Global Goal / Recruitment Status */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                        <h3 className="text-xl font-bold text-[#151d48] mb-6">Downline Goal</h3>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 shadow-inner">
                                    <Users size={28} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-[#151d48] text-sm uppercase tracking-tight">Next Level Target</span>
                                        <span className="text-lg font-black text-green-600">{Math.min(100, Math.floor((referralCount / 10) * 100))}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-50 rounded-full mt-2 overflow-hidden border border-gray-100">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, (referralCount / 10) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#151d48] p-5 rounded-[2.5rem] shadow-xl shadow-blue-900/20 text-white group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                    <Users size={48} />
                                </div>
                                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Your Referral Link</p>
                                <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                                    <div className="flex-1 truncate text-xs font-bold text-blue-100 px-2 tracking-tight">
                                        {referralLink}
                                    </div>
                                    <CopyButton textToCopy={referralLink} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: User Leaderboard & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Leaderboard */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="text-xl font-bold text-[#151d48]">Global Hall of Fame</h3>
                        <Link href="/dashboard/community" className="text-xs font-black text-primary hover:secondary bg-primary/5 px-4 py-2 rounded-full transition-all">View Leaderboard</Link>
                    </div>
                    <div className="space-y-4">
                        {topEarners.length === 0 ? (
                            <div className="py-10 text-center text-gray-400 font-bold italic">No data yet.</div>
                        ) : (
                            topEarners.map((user, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group relative">
                                    <div className="flex items-center space-x-5">
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-2xl bg-primary/5 overflow-hidden shadow-inner flex items-center justify-center`}>
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} className="w-12 h-12" />
                                            </div>
                                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-[#151d48] shadow-md border border-gray-100">
                                                #{i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-black text-base text-[#151d48]">@{user.username}</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-[10px] text-[#737791] font-black uppercase tracking-widest">{user.ad_credits} Credits</p>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <p className="text-[10px] font-black text-primary uppercase">{user.rank || 'Member'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center pr-2">
                                        {i === 0 && <Award className="text-orange-500 mr-4" size={24} />}
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-green-50 text-green-600`}>
                                            <TrendingUp size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Rewards / History / Community Shout */}
                {settings?.enable_shoutbox_module !== false && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="text-xl font-bold text-[#151d48]">Community Shout</h3>
                            <MessageSquare size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 space-y-5">
                            {recentShouts.length === 0 ? (
                                <div className="py-10 text-center text-gray-400 font-bold italic">No shouts yet.</div>
                            ) : (
                                recentShouts.map((shout, i) => (
                                    <div key={i} className="flex space-x-4 p-4 rounded-3xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-all">
                                        <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-primary`}>
                                            {shout.users?.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-black text-[#151d48]">@{shout.users?.username}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{formatDate(shout.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-[#444a6d] font-medium leading-relaxed">{shout.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/dashboard/community" className="w-full mt-6 py-4 bg-[#151d48] text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:secondary transition-all flex items-center justify-center space-x-3 shadow-lg shadow-blue-900/20 group">
                            <span>Join the conversation</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Activity / Ledger Table */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-[#151d48] tracking-tight">Recent Transactions</h3>
                        <p className="text-sm font-medium text-[#737791]">Your latest earning and spending history</p>
                    </div>
                    <Link href="/dashboard/wallet/ledger" className="group flex items-center gap-2 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 px-6 py-3 rounded-2xl text-xs font-black text-[#151d48] transition-all uppercase tracking-widest">
                        View Full Ledger
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="pb-4 pl-4 font-black">Type</th>
                                <th className="pb-4 font-black">Date & Time</th>
                                <th className="pb-4 pr-4 text-right font-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-gray-400 font-bold italic">
                                        No recent activity to show.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((entry) => {
                                    const config = getTypeConfig(entry.type);
                                    const Icon = config.icon;
                                    const isPositive = parseFloat(entry.amount) > 0;
                                    return (
                                        <tr key={entry.id} className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors group">
                                            <td className="py-4 pl-0">
                                                <div className="flex items-center gap-4 pl-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} shrink-0 shadow-sm border border-white`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <span className="font-bold text-[#151d48] text-sm">{config.label}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-xs font-bold text-gray-500">
                                                {formatDate(entry.created_at)} <span className="text-gray-300 font-medium ml-1">{formatTime(entry.created_at)}</span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <span className={`text-sm font-black tracking-tighter ${isPositive ? 'text-green-600' : 'text-[#151d48]'}`}>
                                                    {isPositive ? '+' : ''}{parseFloat(entry.amount).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
