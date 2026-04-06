import { db } from "@/lib/db";
import { vpnIpRanges, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Globe } from "lucide-react";
import VpnActionButtons from "./VpnActionButtons";
import VpnRangeManager from "./VpnRangeManager";

export default async function VpnDetectorPage() {
  const settings = await getSiteSettings();

  // Get active VPN ranges
  const vpnRanges = await db
    .select()
    .from(vpnIpRanges)
    .where(eq(vpnIpRanges.isActive, true));

  // Users whose login IPs are in VPN ranges
  const vpnUsers = vpnRanges.length > 0
    ? await db.execute(sql`
        SELECT
          u.username,
          u.id AS user_id,
          COUNT(DISTINCT av.ip_address) AS vpn_ips_used,
          COUNT(*) AS total_views,
          COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM vpn_ip_ranges vr
            WHERE vr.is_active = true
              AND av.ip_address::inet << vr.cidr::inet
          )) AS vpn_views,
          ROUND(
            COUNT(*) FILTER (WHERE EXISTS (
              SELECT 1 FROM vpn_ip_ranges vr WHERE vr.is_active = true AND av.ip_address::inet << vr.cidr::inet
            )) * 100.0 / NULLIF(COUNT(*), 0), 1
          ) AS vpn_pct
        FROM users u
        JOIN ad_views av ON av.user_id = u.id
        GROUP BY u.id, u.username
        HAVING COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM vpn_ip_ranges vr WHERE vr.is_active = true AND av.ip_address::inet << vr.cidr::inet
        )) > 0
        ORDER BY vpn_pct DESC
        LIMIT 100
      `)
    : { rows: [] };

  const rows = ((vpnUsers as any) ?? []) as any[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Globe size={24} className="text-[#f97316]" />
          VPN / Proxy Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Cross-referenced login IPs against {vpnRanges.length} known VPN/proxy ranges — {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Users Detected via VPN", value: rows.length, color: "text-red-600 bg-red-50" },
          { label: "100% VPN Users", value: rows.filter(r => Number(r.vpn_pct) === 100).length, color: "text-orange-600 bg-orange-50" },
          { label: "Known VPN Ranges", value: vpnRanges.length, color: "text-blue-600 bg-blue-50" },
          { label: "KYC Required", value: 0, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color.split(" ")[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#151d48]">Flagged VPN Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-right">VPN Usage %</th>
                  <th className="px-6 py-3 text-right">VPN Views</th>
                  <th className="px-6 py-3 text-right">Total Activity</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#151d48]">@{row.username}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-red-500`} style={{ width: `${row.vpn_pct}%` }} />
                        </div>
                        <span className={`font-bold ${Number(row.vpn_pct) === 100 ? "text-red-600" : "text-orange-600"}`}>
                          {row.vpn_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700">{row.vpn_views}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{row.total_views}</td>
                    <td className="px-6 py-4">
                      <VpnActionButtons userId={row.user_id} username={row.username} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VPN Range Database Section */}
      <VpnRangeManager initialRanges={vpnRanges} />
    </div>
  );
}
