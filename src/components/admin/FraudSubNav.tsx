"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

const FRAUD_NAV = [
  { label: "Alert Center",       href: "/admin/fraud" },
  { label: "Duplicate IPs",      href: "/admin/fraud/duplicate-ips" },
  { label: "Speed Violations",   href: "/admin/fraud/speed-violations" },
  { label: "VPN Detector",       href: "/admin/fraud/vpn-detector" },
  { label: "Withdrawals",        href: "/admin/fraud/withdrawals" },
  { label: "Self-Referral",      href: "/admin/fraud/self-referral" },
  { label: "Device Clusters",    href: "/admin/fraud/devices" },
  { label: "Bot Patterns",       href: "/admin/fraud/bots" },
  { label: "Earnings Mismatch",  href: "/admin/fraud/earnings-mismatch" },
  { label: "Dormant Revivals",   href: "/admin/fraud/dormant" },
  { label: "Network Graph",      href: "/admin/fraud/network" },
  { label: "Burst Reg.",         href: "/admin/fraud/burst-registrations" },
  { label: "Settings",           href: "/admin/fraud/settings" },
];

export default function FraudSubNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/fraud") return pathname === "/admin/fraud";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-6 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 text-[#f97316] shrink-0 mr-1 border-r border-gray-100">
        <ShieldAlert size={15} />
        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Fraud</span>
      </div>
      {FRAUD_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
            ${isActive(item.href)
              ? "bg-[#f97316] text-white shadow-sm shadow-orange-500/25"
              : "text-gray-500 hover:text-[#f97316] hover:bg-orange-50"
            }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
