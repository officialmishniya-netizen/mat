import { db } from "@/lib/db";
import { users, adViews } from "@/lib/db/schema";
import { sql, eq, ne } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { UserCheck, AlertTriangle } from "lucide-react";

export default async function SelfReferralPage() {
  const settings = await getSiteSettings();

  // Find referral pairs where referrer and referred share an IP
  const pairs = await db.execute(sql`
    SELECT
      u1.username AS referrer_username,
      u1.id AS referrer_id,
      u1.created_at AS referrer_joined,
      u2.username AS referred_username,
      u2.id AS referred_id,
      u2.created_at AS referred_joined,
      COUNT(DISTINCT av1.ip_address) FILTER (
        WHERE av1.ip_address = av2.ip_address
      ) AS shared_ip_count,
      CASE
        WHEN COUNT(DISTINCT av1.ip_address) FILTER (WHERE av1.ip_address = av2.ip_address) >= 1
         AND DATE_TRUNC('day', u1.created_at) = DATE_TRUNC('day', u2.created_at)
          THEN 'critical'
        WHEN COUNT(DISTINCT av1.ip_address) FILTER (WHERE av1.ip_address = av2.ip_address) >= 1
          THEN 'high'
        ELSE 'medium'
      END AS confidence
    FROM users u1
    JOIN users u2 ON u2.sponsor_id = u1.id AND u2.id != u1.id
    LEFT JOIN ad_views av1 ON av1.user_id = u1.id
    LEFT JOIN ad_views av2 ON av2.user_id = u2.id
    WHERE u1.id IS NOT NULL
    GROUP BY u1.id, u1.username, u1.created_at, u2.id, u2.username, u2.created_at
    HAVING COUNT(DISTINCT av1.ip_address) FILTER (WHERE av1.ip_address = av2.ip_address) >= 1
    LIMIT 100
  `);

  const rows = (pairs.rows ?? []) as any[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <UserCheck size={24} className="text-[#f97316]" />
          Self-Referral Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Cross-referenced referral pairs with shared IPs â€” {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Suspected Self-Referrals", value: rows.length, color: "text-red-600" },
          { label: "Critical Confidence", value: rows.filter(r => r.confidence === "critical").length, color: "text-red-600" },
          { label: "High Confidence", value: rows.filter(r => r.confidence === "high").length, color: "text-orange-600" },
          { label: "Pending Review", value: rows.length, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#151d48]">Suspected Self-Referral Pairs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Referrer</th>
                <th className="px-6 py-3 text-left">Referred Account</th>
                <th className="px-6 py-3 text-left">Shared IPs</th>
                <th className="px-6 py-3 text-left">Confidence</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-300">
                    No self-referral patterns detected
                  </td>
                </tr>
              )}
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#151d48]">@{row.referrer_username}</span>
                    <div className="text-xs text-gray-400">{new Date(row.referrer_joined).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#151d48]">@{row.referred_username}</span>
                    <div className="text-xs text-gray-400">{new Date(row.referred_joined).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-orange-600">{row.shared_ip_count} IPs</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full
                      ${row.confidence === "critical" ? "bg-red-100 text-red-700" :
                        row.confidence === "high" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"}`}>
                      {row.confidence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">Clawback Bonus</button>
                      <button className="text-xs font-semibold px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">False Positive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
