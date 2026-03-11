import Link from "next/link";
import { usePathname } from "next/navigation";

const fraudSubNav = [
  { label: "Alert Center", href: "/admin/fraud" },
  { label: "Dup IPs", href: "/admin/fraud/duplicate-ips" },
  { label: "Speed", href: "/admin/fraud/speed-violations" },
  { label: "VPN", href: "/admin/fraud/vpn-detector" },
  { label: "Withdrawals", href: "/admin/fraud/withdrawals" },
  { label: "Self-Referral", href: "/admin/fraud/self-referral" },
  { label: "Devices", href: "/admin/fraud/devices" },
  { label: "Bots", href: "/admin/fraud/bots" },
  { label: "Mismatch", href: "/admin/fraud/earnings-mismatch" },
  { label: "Dormant", href: "/admin/fraud/dormant" },
  { label: "Network", href: "/admin/fraud/network" },
  { label: "Burst Reg.", href: "/admin/fraud/burst-registrations" },
  { label: "Settings", href: "/admin/fraud/settings" },
];

export default function FraudLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Sub-nav */}
      <FraudSubNav />
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FraudSubNav() {
  "use client";
  // next/navigation requires client â€” wrap in its own file below
  return null;
}
