"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MousePointerClick,
    Users,
    RefreshCcw,
    Megaphone,
    MessageSquare,
    Landmark,
    Wallet,
    ArrowUpRight,
    ListOrdered,
    ShieldCheck,
    Globe,
    Settings,
    ChevronDown,
    LogOut,
    User,
    Store,
    Zap,
    Receipt,
    CalendarClock,
    Trophy,
    Award,
    MessagesSquare,
    Gamepad2
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { logoutAction } from "@/app/actions/auth";
import { useState, useEffect } from "react";
import { getSiteSettings, SiteSettings } from "@/lib/settings";

export function DashboardNav({ userRole, unreadMessagesCount = 0 }: { userRole: string, unreadMessagesCount?: number }) {
    const pathname = usePathname();
    const { t, language, setLanguage } = useTranslation();
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
    };

    return (
        <div className="flex flex-col flex-1 bg-white overflow-hidden min-h-0">
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar min-h-0">
                {[
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Account Summary' },
                    { href: '/dashboard/profile', icon: User, label: 'My Profile' },
                    { href: '/dashboard/ads', icon: MousePointerClick, label: t("dashboard.watch_ads_now"), reqModule: 'enable_ptc_module' },
                    { href: '/dashboard/matrix', icon: Users, label: t("dashboard.my_matrix"), reqModule: 'enable_matrix_module' },
                    { href: '/dashboard/cycles', icon: RefreshCcw, label: t("dashboard.ad_cycles"), reqModule: 'enable_ptc_module' },
                    { href: '/dashboard/marketplace', icon: Store, label: 'Marketplace', reqModule: 'enable_marketplace_module' },
                    { href: '/dashboard/marketplace/spin', icon: Gamepad2, label: 'Spin Wheel', reqModule: 'enable_marketplace_module' },
                    { href: '/dashboard/promotion', icon: Globe, label: t("dashboard.promo_center"), isCustomIcon: true },
                    { href: '/dashboard/community', icon: Users, label: t("dashboard.community") || 'Leaderboard' },
                    { href: '/dashboard/shoutbox', icon: MessageSquare, label: 'Shoutbox', reqModule: 'enable_shoutbox_module' },
                    { href: '/dashboard/wallet/withdraw', icon: Landmark, label: 'Withdraw Funds', reqModule: 'enable_finance_module' },
                    { href: '/dashboard/wallet/deposit', icon: Wallet, label: 'Deposit Balance', reqModule: 'enable_finance_module' },
                    { href: '/dashboard/wallet/transfer', icon: ArrowUpRight, label: 'P2P Transfer', reqModule: 'enable_finance_module' },
                    { href: '/dashboard/wallet/ledger', icon: ListOrdered, label: 'My Ledger', reqModule: 'enable_finance_module' },
                    { href: '/dashboard/support', icon: ShieldCheck, label: 'Support Center' },
                    { href: '/dashboard/invest', icon: Zap, label: t("dashboard.invest"), reqModule: 'enable_roi_module' },
                    { href: '/dashboard/wallet/schedule', icon: CalendarClock, label: t("dashboard.schedule"), reqModule: 'enable_finance_module' },
                    { href: '/dashboard/wallet/receipts', icon: Receipt, label: t("dashboard.receipts"), reqModule: 'enable_finance_module' },
                    { href: '/dashboard/contests', icon: Trophy, label: t("dashboard.contests"), reqModule: 'enable_contests_module' },
                    { href: '/dashboard/achievements', icon: Award, label: t("dashboard.achievements"), reqModule: 'enable_achievements_module' },
                    { href: '/dashboard/team-chat', icon: MessagesSquare, label: t("dashboard.team_chat"), reqModule: 'enable_team_chat_module' }
                ].filter(item => !item.reqModule || (settings && settings[item.reqModule as keyof SiteSettings])).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 border-2 ${pathname === item.href
                            ? 'bg-white border-primary/20 text-[#151d48] shadow-lg shadow-primary/10 scale-[1.02]'
                            : 'bg-transparent border-transparent text-[#737791] hover:bg-white hover:border-gray-100 hover:shadow-md'
                            }`}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${pathname === item.href ? 'bg-primary text-white' : 'bg-gray-100 text-[#737791] group-hover:bg-primary/10 group-hover:text-primary'
                            }`}>
                            {item.isCustomIcon ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a2.828 2.828 0 1 0 4-4L13 5.5a2.828 2.828 0 1 0-4 4L11.5 12" /><path d="M7 16.5 9.5 14" /><path d="m15 5 2.5 2.5" /><path d="m3 21 3.5-3.5" /></svg>
                            ) : (
                                <item.icon size={20} />
                            )}
                        </div>
                        <span className={`text-sm tracking-tight ${pathname === item.href ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                    </Link>
                ))}

                <div className="pt-6 pb-2 px-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Team & Promo</p>
                </div>

                {[
                    { href: '/dashboard/team', icon: Users, label: 'Downline Overview' },
                    { href: '/dashboard/team/messages', icon: MessagesSquare, label: 'Direct Messages', badge: unreadMessagesCount },
                    { href: '/dashboard/team/invites', icon: Landmark, label: 'Invite Manager' },
                    { href: '/dashboard/team/email', icon: MessageSquare, label: 'Email My Team' },
                    { href: '/dashboard/team/tracking-links', icon: Globe, label: 'Tracking Links' },
                    { href: '/dashboard/team/referral-page', icon: User, label: 'My Referral Page' },
                    { href: '/dashboard/team/proof-cards', icon: Award, label: 'Earning Proof Cards' },
                    { href: '/dashboard/team/follow-ups', icon: CalendarClock, label: 'Scheduled Follow-Ups' },
                    { href: '/dashboard/team/leaderboard', icon: Trophy, label: 'Team Leaderboard' },
                    { href: '/dashboard/team/training', icon: ShieldCheck, label: 'Referral Training Hub' }
                ].map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 border-2 ${pathname.startsWith(item.href) && (item.href !== '/dashboard/team' || pathname === '/dashboard/team')
                            ? 'bg-orange-50/50 border-orange-200 text-[#151d48] shadow-sm scale-[1.02]'
                            : 'bg-transparent border-transparent text-[#737791] hover:bg-orange-50/30 hover:border-orange-100 hover:shadow-sm'
                            }`}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${pathname.startsWith(item.href) && (item.href !== '/dashboard/team' || pathname === '/dashboard/team') ? 'bg-orange-500 text-white' : 'bg-gray-100 text-[#737791] group-hover:bg-orange-100 group-hover:text-orange-600'
                            }`}>
                            <item.icon size={20} />
                        </div>
                        <span className={`text-sm tracking-tight ${pathname.startsWith(item.href) && (item.href !== '/dashboard/team' || pathname === '/dashboard/team') ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </Link>
                ))}

                {userRole === 'admin' && (
                    <Link href="/admin" className="flex items-center space-x-3 text-red-600 bg-red-50/50 hover:bg-red-50 p-3.5 rounded-2xl mt-8 font-black border-2 border-red-100 shadow-sm transition-all group overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 w-1 bg-red-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                        <Settings size={20} className="group-hover:rotate-45 transition-transform" /> <span>{t("dashboard.admin_panel")}</span>
                    </Link>
                )}
            </nav>

            {/* Language & Logout Footer */}
            <div className="p-4 border-t border-gray-100 space-y-2 bg-white shrink-0">
                <div className="relative group">
                    <button className="flex w-full items-center justify-between space-x-3 text-gray-600 hover:bg-gray-50 p-2 rounded-xl transition-colors border border-transparent">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                                <Globe size={16} />
                            </div>
                            <span className="text-sm font-bold">
                                {language === "en" && "English"}
                                {language === "es" && "EspaÃ±ol"}
                                {language === "fr" && "FranÃ§ais"}
                                {language === "de" && "Deutsch"}
                                {language === "pt" && "PortuguÃªs"}
                                {language === "ru" && "Ð ÑƒÑÑÐºÐ¸Ð¹"}
                            </span>
                        </div>
                        <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 space-y-1">
                        <button
                            onClick={() => setLanguage("en")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'en' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡ºðŸ‡¸</span> <span>English</span>
                        </button>
                        <button
                            onClick={() => setLanguage("es")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'es' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡ªðŸ‡¸</span> <span>EspaÃ±ol</span>
                        </button>
                        <button
                            onClick={() => setLanguage("fr")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'fr' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡«ðŸ‡·</span> <span>FranÃ§ais</span>
                        </button>
                        <button
                            onClick={() => setLanguage("de")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'de' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡©ðŸ‡ª</span> <span>Deutsch</span>
                        </button>
                        <button
                            onClick={() => setLanguage("pt")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'pt' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡§ðŸ‡·</span> <span>PortuguÃªs</span>
                        </button>
                        <button
                            onClick={() => setLanguage("ru")}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-black ${language === 'ru' ? 'bg-orange-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="text-lg">ðŸ‡·ðŸ‡º</span> <span>Ð ÑƒÑÑÐºÐ¸Ð¹</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-3 text-gray-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all duration-300 font-bold group"
                >
                    <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                        <LogOut size={16} />
                    </div>
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
}
