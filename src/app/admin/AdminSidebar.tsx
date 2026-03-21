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
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin"
    },
    {
        name: "Marketing Hub",
        icon: ShieldAlert,
        href: "/admin/marketing"
    },
    {
        name: "Marketplace",
        icon: ShoppingBag,
        href: "/admin/marketplace",
        reqModule: "enable_marketplace_module"
    },
    {
        name: "User Management",
        icon: Users,
        items: [
            { name: "All Users", href: "/admin/users" },
            { name: "Deep Audit Tool", href: "/admin/users/audit" },
            { name: "Impersonate", href: "/admin/users/impersonate" },
            { name: "Sponsor Manager", href: "/admin/users/sponsor" }
        ]
    },
    {
        name: "Ad Cycle Center",
        icon: MonitorPlay,
        reqModule: "enable_ptc_module",
        items: [
            { name: "Ad Level Creation", href: "/admin/ads" },
            { name: "Global Ad Settings", href: "/admin/ads/settings" },
            { name: "Anti-Cheat Logs", href: "/admin/ads/anticheat" }
        ]
    },
    {
        name: "Matrix & Levels",
        icon: Layers,
        reqModule: "enable_matrix_module",
        items: [
            { name: "Level Configurator", href: "/admin/levels" },
            { name: "Bonus Settings", href: "/admin/levels/bonuses" },
            { name: "Live Trees", href: "/admin/levels/trees" }
        ]
    },
    {
        name: "Finance & Ledger",
        icon: Wallet,
        reqModule: "enable_finance_module",
        items: [
            { name: "Master Ledger", href: "/admin/ledger" },
            { name: "Withdrawals", href: "/admin/withdrawals" },
            { name: "Scheduled Payouts", href: "/admin/withdrawals/scheduled" },
            { name: "Investment Pools", href: "/admin/investments", reqModule: "enable_roi_module" },
            { name: "Deposit Logs", href: "/admin/deposits" },
            { name: "Receipt Audit", href: "/admin/receipts" }
        ]
    },
    {
        name: "Analytics",
        icon: PieChart,
        items: [
            { name: "Stress Test", href: "/admin/analytics/stress-test" },
            { name: "Cohort Retention", href: "/admin/analytics/cohorts" },
            { name: "Advertiser ROI", href: "/admin/analytics/roi" }
        ]
    },
    {
        name: "Engagement",
        icon: Trophy,
        items: [
            { name: "Contest Manager", href: "/admin/contests", reqModule: "enable_contests_module" },
            { name: "Badge Manager", href: "/admin/achievements", reqModule: "enable_achievements_module" },
            { name: "Team Chat MOD", href: "/admin/team-chat", reqModule: "enable_team_chat_module" }
        ]
    },
    {
        name: "System Settings",
        icon: Settings,
        items: [
            { name: "White-Label UI", href: "/admin/settings" },
            { name: "Modules", href: "/admin/settings/modules" },
            { name: "Payments Config", href: "/admin/settings/payments" },
            { name: "Email Templates", href: "/admin/emails" },
            { name: "Simulation Engine", href: "/admin/simulation", reqModule: "enable_simulation_module" }
        ]
    },
    {
        name: "Fraud Intelligence",
        icon: ScanSearch,
        items: [
            { name: "Alert Center", href: "/admin/fraud" },
            { name: "Duplicate IPs", href: "/admin/fraud/duplicate-ips" },
            { name: "Speed Violations", href: "/admin/fraud/speed-violations" },
            { name: "VPN Detector", href: "/admin/fraud/vpn-detector" },
            { name: "Withdrawal Anomalies", href: "/admin/fraud/withdrawals" },
            { name: "Self-Referral", href: "/admin/fraud/self-referral" },
            { name: "Device Clusters", href: "/admin/fraud/devices" },
            { name: "Bot Patterns", href: "/admin/fraud/bots" },
            { name: "Earnings Mismatch", href: "/admin/fraud/earnings-mismatch" },
            { name: "Dormant Revivals", href: "/admin/fraud/dormant" },
            { name: "Network Graph", href: "/admin/fraud/network" },
            { name: "Burst Registrations", href: "/admin/fraud/burst-registrations" },
            { name: "Fraud Settings", href: "/admin/fraud/settings" },
        ]
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        "Dashboard": true,
        "Ad Click Center": true,
        "Matrix & Levels": true
    });

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
        <aside className="w-[280px] bg-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-100 z-20 overflow-hidden">
            {/* Logo */}
            <div className="h-24 flex items-center px-8 shrink-0">
                <Link href="/admin" className="block w-full">
                    <img src="/logo.PNG" alt="Admin Logo" className="h-10 w-auto object-contain" />
                </Link>
            </div>

            {/* Navigation Layout */}
            <div className="flex-1 px-4 py-4 overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-gray-200">
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
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${hasActiveChild ? "bg-[#f97316] text-white shadow-md shadow-orange-500/20" : "text-[#737791] hover:bg-orange-50 hover:text-[#f97316]"
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
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${hasActiveChild && !isOpen ? "text-[#f97316] bg-orange-50" : "text-[#444a6d] hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <group.icon size={20} className={hasActiveChild ? "text-[#f97316]" : "text-[#737791]"} />
                                            <span className="font-bold whitespace-nowrap">{t(`admin.${group.name.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_")}`)}</span>
                                        </div>
                                        {isOpen ? <ChevronDown size={16} className="text-[#a0a8b9]" /> : <ChevronRight size={16} className="text-[#a0a8b9]" />}
                                    </div>

                                    {isOpen && group.items && (
                                        <div className="mt-1 ml-4 pl-6 border-l-2 border-orange-100 space-y-1 py-1">
                                            {activeItems.map((item) => {
                                                const isItemActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={`block px-4 py-2 rounded-lg transition-all text-sm font-semibold ${isItemActive
                                                            ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/20"
                                                            : "text-[#737791] hover:text-[#f97316] hover:bg-orange-50"
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

                <div className="mt-8 border-t border-gray-100 pt-4">
                    <Link
                        href="/"
                        className="flex items-center space-x-4 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50"
                    >
                        <LogOut size={20} />
                        <span className="font-bold whitespace-nowrap">Sign Out</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
