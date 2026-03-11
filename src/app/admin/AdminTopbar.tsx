"use client";

import { Search, Bell, ChevronDown, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

export default function AdminTopbar() {
    const pathname = usePathname();
    const { language, setLanguage, t } = useTranslation();

    // Simple logic to set title based on route
    const getPageTitle = () => {
        if (pathname === "/admin") return t("admin.dashboard");
        const pathSegments = pathname.split("/").filter(Boolean);
        if (pathSegments.length > 1) {
            const lastSegment = pathSegments[pathSegments.length - 1];
            // Try to find translation for the segment
            const translationKey = `admin.${lastSegment.toLowerCase().replace(/[- ]/g, "_")}`;
            const translated = t(translationKey);
            return translated !== translationKey ? translated : lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
        }
        return t("admin.dashboard");
    };

    return (
        <header className="h-[96px] bg-[#f8f9fa] flex items-center justify-between px-8 border-b border-gray-100/50 sticky top-0 z-10 w-full">
            {/* Title */}
            <h1 className="text-3xl font-bold text-[#151d48]">{getPageTitle()}</h1>

            {/* Right actions */}
            <div className="flex items-center space-x-6">

                {/* Search Bar */}
                <div className="relative group hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-[#a0a8b9]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search here..."
                        className="w-80 bg-white border-0 ring-1 ring-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm text-[#444a6d] placeholder:text-[#a0a8b9] focus:outline-none focus:ring-2 focus:ring-[#5d5fef] transition-all"
                    />
                </div>

                {/* Language Switcher */}
                <div className="relative group">
                    <div className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-xl ring-1 ring-gray-100 hover:bg-gray-50 transition-colors">
                        <span className="text-lg">{language === "en" ? "ðŸ‡ºðŸ‡¸" : "ðŸ‡ªðŸ‡¸"}</span>
                        <span className="text-sm font-semibold text-[#444a6d]">{language === "en" ? "Eng (US)" : "Esp (ES)"}</span>
                        <ChevronDown size={14} className="text-[#a0a8b9]" />
                    </div>

                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => setLanguage("en")}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold ${language === 'en' ? 'bg-orange-50 text-[#f97316]' : 'text-[#737791] hover:bg-gray-50'}`}
                            >
                                <span className="text-lg">ðŸ‡ºðŸ‡¸</span> <span>English</span>
                            </button>
                            <button
                                onClick={() => setLanguage("es")}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-bold ${language === 'es' ? 'bg-orange-50 text-[#f97316]' : 'text-[#737791] hover:bg-gray-50'}`}
                            >
                                <span className="text-lg">ðŸ‡ªðŸ‡¸</span> <span>EspaÃ±ol</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <button className="relative p-2 bg-[#ffeed1] bg-opacity-40 rounded-xl hover:bg-opacity-60 transition-colors">
                    <Bell size={22} className="text-[#ffb53a]" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3 cursor-pointer pl-4 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden ring-2 ring-gray-100">
                        {/* Placeholder avatar */}
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Musfiq&backgroundColor=e2e8f0"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-bold text-[#151d48]">Musfiq</p>
                        <p className="text-xs font-semibold text-[#737791]">Admin</p>
                    </div>
                    <ChevronDown size={16} className="text-[#a0a8b9]" />
                </div>

            </div>
        </header>
    );
}
