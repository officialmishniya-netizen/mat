import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Zap, Users as UsersIcon, AlertTriangle } from "lucide-react";

export default async function BurstRegistrationsPage() {
  const settings = await getSiteSettings();

  // Detect bursts: groups of 5+ users registered within 60-minute windows
  // Group by 1-hour buckets using date_trunc
  const burstRaw = await db
    .select({
      bucket: sql<string>`date_trunc('hour', ${users.created_at})`,
      count: sql<number>`COUNT(*)`,
      ips: sql<string>`STRING_AGG(DISTINCT u2.ip, ', ') FILTER (WHERE u2.ip IS NOT NULL)`,
    })
    .from(users)
    .groupBy(sql`date_trunc('hour', ${users.created_at})`)
    .having(sql`COUNT(*) >= 5`)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(50);

  const totalBursts = burstRaw.length;
  const totalAffected = burstRaw.reduce((s, b) => s + Number(b.count), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Zap size={24} className="text-[#f97316]" />
          Burst Registration Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Coordinated fake signup campaigns — {settings.site_name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Burst Events Detected", value: totalBursts, color: "text-red-600" },
          { label: "Total Accounts Affected", value: totalAffected, color: "text-orange-600" },
          { label: "Auto-Contained", value: 0, color: "text-green-600" },
          { label: "Avg Accounts / Burst", value: totalBursts ? (totalAffected / totalBursts).toFixed(1) : "0", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#151d48]">Detected Burst Events</h2>
          <p className="text-xs text-gray-400 mt-1">Default threshold: 5+ registrations within 60 minutes. Adjust in Fraud Settings.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Time Window (Hourly)</th>
                <th className="px-6 py-3 text-left">Registrations</th>
                <th className="px-6 py-3 text-left">Severity</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {burstRaw.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-300">
                    No burst registrations detected
                  </td>
                </tr>
              )}
              {burstRaw.map((burst) => {
                const count = Number(burst.count);
                const severity = count >= 20 ? "critical" : count >= 10 ? "high_risk" : "suspicious";
                return (
                  <tr key={burst.bucket} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {burst.bucket ? new Date(burst.bucket).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4 font-bold text-orange-600">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        {count} accounts
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full
                        ${severity === "critical" ? "bg-red-100 text-red-700" :
                          severity === "high_risk" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"}`}>
                        {severity.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">View Accounts</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">Freeze All</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">Ban All</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
