import { db } from "@/lib/db";
import { adViews, users, fraudWhitelist } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Network, AlertTriangle } from "lucide-react";
import FraudActionButtons from "./FraudActionButtons";

export default async function DuplicateIPsPage() {
  const settings = await getSiteSettings();

  // Get whitelisted IPs
  const whitelist = await db
    .select({ value: fraudWhitelist.value })
    .from(fraudWhitelist)
    .where(eq(fraudWhitelist.type, "ip"));
  const whitelistedIps = new Set(whitelist.map((w) => w.value));

  // Group adViews by IP, count distinct users, and capture user IDs
  const rawGroups = await db
    .select({
      ip: adViews.ip_address,
      userCount: sql<number>`COUNT(DISTINCT ${adViews.user_id})`,
      userIds: sql<string[]>`array_agg(DISTINCT ${adViews.user_id})`,
      latestView: sql<string>`MAX(${adViews.completed_at})`,
    })
    .from(adViews)
    .groupBy(adViews.ip_address)
    .having(sql`COUNT(DISTINCT ${adViews.user_id}) >= 2`);

  const flaggedGroups = rawGroups.filter(
    (g) => g.ip && !whitelistedIps.has(g.ip)
  );

  // Stats
  const totalFlaggedIps = flaggedGroups.length;
  const totalAccounts = flaggedGroups.reduce((s, g) => s + Number(g.userCount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Network size={24} className="text-[#f97316]" />
          Duplicate IP Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          IPs with 2+ distinct accounts — {settings.site_name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Flagged IPs", value: totalFlaggedIps, color: "text-red-600 bg-red-50" },
          { label: "Accounts Involved", value: totalAccounts, color: "text-orange-600 bg-orange-50" },
          { label: "Whitelisted IPs", value: whitelistedIps.size, color: "text-green-600 bg-green-50" },
          { label: "Avg Accounts/IP", value: totalFlaggedIps ? (totalAccounts / totalFlaggedIps).toFixed(1) : "0", color: "text-blue-600 bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color.split(" ")[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#151d48]">Flagged IP Groups</h2>
          <span className="text-xs text-gray-400">{totalFlaggedIps} groups</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">IP Address</th>
                <th className="px-6 py-3 text-left">Account Count</th>
                <th className="px-6 py-3 text-left">Last Activity</th>
                <th className="px-6 py-3 text-left">Risk</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flaggedGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-300 text-sm">
                    No duplicate IPs detected
                  </td>
                </tr>
              )}
              {flaggedGroups.map((group) => {
                const risk = Number(group.userCount) >= 5 ? "critical" : Number(group.userCount) >= 3 ? "high_risk" : "suspicious";
                return (
                  <tr key={group.ip} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{group.ip ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                        <AlertTriangle size={14} />
                        {group.userCount} accounts
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {group.latestView ? new Date(group.latestView).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full
                        ${risk === "critical" ? "bg-red-100 text-red-700" :
                          risk === "high_risk" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"}`}>
                        {risk.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <FraudActionButtons ip={group.ip!} userIds={group.userIds} />
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
