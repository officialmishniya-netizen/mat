"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { getSiteSettings, SiteSettings } from "@/lib/settings";
import {
    LayoutDashboard,
    MonitorPlay,
    Layers,
    Users,
    Wallet,
    MessageSquare,
    Settings,
    LogOut,
    Network,
    ShieldAlert,
    BarChart3,
    ActivitySquare,
    ChevronDown,
    ChevronRight,
    Search,
    ShoppingBag,
    Zap,
    Receipt,
    CalendarClock,
    Trophy,
    Award,
    MessagesSquare,
    TrendingUp,
    PieChart,
    ScanSearch,
} from "lucide-react";
import { useState, useEffect } from "react";

type NavItem = {
    name: string;
    href: string;
    reqModule?: keyof SiteSettings;
};

type NavGroup = {
    name: string;
    icon: any;
    href?: string;
    items?: NavItem[];
    reqModule?: keyof SiteSettings;
};

const navGroups: NavGroup[] = [
    {
        name: "Overview",
        icon: LayoutDashboard,
        items: [
            { name: "Overview Dashboard", href: "/admin" },
            { name: "Statistics", href: "/admin/analytics/stress-test" },
            { name: "User Loyalty", href: "/admin/analytics/cohorts" },
            { name: "Ad Results", href: "/admin/analytics/roi" }
        ]
    },
    {
        name: "Member Management",
        icon: Users,
        items: [
            { name: "All Members", href: "/admin/users" },
            { name: "Profile Search", href: "/admin/users/audit" },
            { name: "Login as User", href: "/admin/users/impersonate" },
            { name: "Sponsor Manager", href: "/admin/users/sponsor" },
            { name: "Contest Manager", href: "/admin/contests", reqModule: "enable_contests_module" },
            { name: "Give Awards", href: "/admin/achievements", reqModule: "enable_achievements_module" },
        ]
    },
    {
        name: "Earning Systems",
        icon: Zap,
        items: [
            { name: "Watching Ads Setup", href: "/admin/ads", reqModule: "enable_ptc_module" },
            { name: "Matrix Setup", href: "/admin/levels", reqModule: "enable_matrix_module" },
            { name: "Bonus Settings", href: "/admin/levels/bonuses" },
            { name: "Matrix Boards", href: "/admin/levels/trees" },
            { name: "Shop Manager", href: "/admin/marketplace", reqModule: "enable_marketplace_module" },
            { name: "Interactive Games", href: "/dashboard/marketplace/spin", reqModule: "enable_marketplace_module" },
        ]
    },
    {
        name: "Customer Support",
        icon: MessageSquare,
        items: [
            { name: "Support Tickets", href: "/admin/tickets" },
            { name: "Team Chat MOD", href: "/admin/team-chat", reqModule: "enable_team_chat_module" },
        ]
    },
    {
        name: "Money Management",
        icon: Wallet,
        reqModule: "enable_finance_module",
        items: [
            { name: "Transaction History", href: "/admin/ledger" },
            { name: "Withdrawals", href: "/admin/withdrawals" },
            { name: "Scheduled Payouts", href: "/admin/withdrawals/scheduled" },
            { name: "Investment Pools", href: "/admin/investments", reqModule: "enable_roi_module" },
            { name: "Deposit Logs", href: "/admin/deposits" },
            { name: "Receipt Audit", href: "/admin/receipts" }
        ]
    },
    {
        name: "Security Center",
        icon: ShieldAlert,
        items: [
            { name: "Alert Center", href: "/admin/fraud" },
            { name: "Duplicate IPs", href: "/admin/fraud/duplicate-ips" },
            { name: "VPN Detector", href: "/admin/fraud/vpn-detector" },
            { name: "Withdrawal Anomalies", href: "/admin/fraud/withdrawals" },
            { name: "Self-Referral Check", href: "/admin/fraud/self-referral" },
            { name: "Bot Patterns", href: "/admin/fraud/bots" },
            { name: "Security Settings", href: "/admin/fraud/settings" },
        ]
    },
    {
        name: "System Settings",
        icon: Settings,
        items: [
            { name: "General Settings", href: "/admin/settings" },
            { name: "Modules & Features", href: "/admin/settings/modules" },
            { name: "System Manager", href: "/admin/settings/system" },
            { name: "Mobile App Setup", href: "/admin/settings/mobile" },
            { name: "Promotion Tools", href: "/admin/marketing" },
            { name: "Payments Setup", href: "/admin/settings/payments" },
            { name: "Email Editor", href: "/admin/emails" },
            { name: "Simulation Tool", href: "/admin/simulation", reqModule: "enable_simulation_module" },
        ]
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const toggleGroup = (groupName: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    return (
        <aside className="w-[280px] bg-[#0b1120] h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800/50 z-20 overflow-hidden">
            {/* Logo */}
            <div className="h-24 flex items-center px-8 shrink-0">
                <Link href="/admin" className="block w-full">
                    <img src="/logo.PNG" alt="Admin Logo" className="h-10 w-auto object-contain" />
                </Link>
            </div>

            {/* Navigation Layout */}
            <div className="flex-1 px-4 py-4 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-slate-700">
                {navGroups.map((group) => {
                    if (group.reqModule && settings && !settings[group.reqModule]) return null;

                    const visibleItems = group.items?.filter(item => {
                        if (item.reqModule && settings && !settings[item.reqModule]) return false;
                        return true;
                    });

                    if (group.items && (!visibleItems || visibleItems.length === 0)) return null;

                    const activeItems = visibleItems || [];

                    const isStandalone = !!group.href;
                    const isOpen = !isStandalone && !!openGroups[group.name];
                    const hasActiveChild = isStandalone
                        ? pathname === group.href || pathname.startsWith(group.href + '/')
                        : activeItems.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

                    return (
                        <div key={group.name} className="mb-2">
                            {isStandalone ? (
                                <Link
                                    href={group.href!}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${hasActiveChild ? "bg-[#f97316] text-white shadow-md shadow-orange-500/20" : "text-slate-400 hover:bg-white/5 hover:text-[#f97316]"
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <group.icon size={20} className={hasActiveChild ? "text-white" : ""} />
                                        <span className="font-bold whitespace-nowrap">{t(`admin.${group.name.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")}`)}</span>
                                    </div>
                                </Link>
                            ) : (
                                <div>
                                    <div
                                        onClick={() => toggleGroup(group.name)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${hasActiveChild && !isOpen ? "text-[#f97316] bg-white/5" : "text-slate-300 hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <group.icon size={20} className={hasActiveChild ? "text-[#f97316]" : "text-[#737791]"} />
                                            <span className="font-bold whitespace-nowrap">{t(`admin.${group.name.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")}`)}</span>
                                        </div>
                                        {isOpen ? <ChevronDown size={16} className="text-[#a0a8b9]" /> : <ChevronRight size={16} className="text-[#a0a8b9]" />}
                                    </div>

                                    {isOpen && group.items && (
                                        <div className="mt-1 ml-4 pl-6 border-l-2 border-slate-800 space-y-1 py-1">
                                            {activeItems.map((item) => {
                                                const isItemActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={`block px-4 py-2 rounded-lg transition-all text-sm font-semibold ${isItemActive
                                                            ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/20"
                                                            : "text-slate-400 hover:text-[#f97316] hover:bg-white/5"
                                                            }`}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                <div className="mt-8 border-t border-slate-800/50 pt-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-4 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-white/5"
                    >
                        <LogOut size={20} />
                        <span className="font-bold whitespace-nowrap">Sign Out</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
