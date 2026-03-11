import { db } from "@/lib/db";
import { vpnIpRanges, adViews, users } from "@/lib/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Globe, Shield } from "lucide-react";

export default async function VpnDetectorPage() {
  const settings = await getSiteSettings();

  // Get active VPN ranges
  const vpnRanges = await db
    .select()
    .from(vpnIpRanges)
    .where(eq(vpnIpRanges.isActive, true));

  // Users whose login IPs are in VPN ranges
  // Since SQL CIDR matching requires pg extension, we do a simplified check
  // with a raw query using the << operator (INET contained within)
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

  const rows = ((vpnUsers as any).rows ?? []) as any[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Globe size={24} className="text-[#f97316]" />
          VPN / Proxy Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Cross-referenced login IPs against {vpnRanges.length} known VPN/proxy ranges â€” {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Users Detected via VPN", value: rows.length, color: "text-red-600" },
          { label: "100% VPN Users", value: rows.filter(r => Number(r.vpn_pct) === 100).length, color: "text-orange-600" },
          { label: "Known VPN Ranges", value: vpnRanges.length, color: "text-blue-600" },
          { label: "KYC Required", value: 0, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {vpnRanges.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center mb-6">
          <Globe size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 font-semibold">No VPN IP ranges loaded</p>
          <p className="text-xs text-gray-300 mt-2">Add VPN CIDR ranges in the VPN Range Database tab below to enable detection.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#151d48]">VPN Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-right">VPN %</th>
                  <th className="px-6 py-3 text-right">VPN Views</th>
                  <th className="px-6 py-3 text-right">Total Views</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#151d48]">@{row.username}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${Number(row.vpn_pct) === 100 ? "text-red-600" : "text-orange-600"}`}>
                        {row.vpn_pct}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{row.vpn_views}</td>
                    <td className="px-6 py-4 text-right text-gray-400">{row.total_views}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Require KYC</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">Block WD</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Whitelist</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VPN Range Database */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[#151d48]">VPN Range Database</h2>
          <span className="text-xs text-gray-400">{vpnRanges.length} CIDR ranges loaded</span>
        </div>
        <div className="p-6">
          <form action="/api/admin/fraud/vpn-ranges" method="POST" className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              Paste CIDR ranges (one per line, e.g. 10.8.0.0/8)
            </label>
            <textarea
              name="ranges"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder={"10.8.0.0/8\n185.220.101.0/24"}
            />
            <div className="flex gap-3 mt-3">
              <input name="providerName" placeholder="Provider name (e.g. NordVPN)" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              <select name="rangeType" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="vpn">VPN</option>
                <option value="proxy">Proxy</option>
                <option value="tor">Tor</option>
                <option value="datacenter">Datacenter</option>
              </select>
              <button type="submit" className="bg-[#f97316] text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-orange-600 transition-colors">
                Upload Ranges
              </button>
            </div>
          </form>
          <div className="divide-y divide-gray-50">
            {vpnRanges.slice(0, 20).map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <code className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{r.cidr}</code>
                  <span className="text-xs text-gray-400">{r.providerName}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                    ${r.rangeType === "tor" ? "bg-red-100 text-red-700" :
                      r.rangeType === "proxy" ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"}`}>
                    {r.rangeType}
                  </span>
                </div>
                <button className="text-red-400 hover:text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">Remove</button>
              </div>
            ))}
            {vpnRanges.length === 0 && (
              <p className="py-6 text-center text-gray-300 text-xs">No ranges loaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
