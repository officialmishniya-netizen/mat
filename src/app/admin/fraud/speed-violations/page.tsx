import { db } from "@/lib/db";
import { adWatchLog, userAdPositions, adPlans, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Timer, AlertTriangle } from "lucide-react";

export default async function SpeedViolationsPage() {
  const settings = await getSiteSettings();

  // Detect watches submitted faster than (token_issued_at + required_duration - grace_margin)
  // Only rows where tokenIssuedAt is populated
  const violations = await db.execute(sql`
    SELECT
      u.username,
      u.id AS user_id,
      al.name AS plan_name,
      al.ad_timer_seconds AS required_secs,
      ROUND(EXTRACT(EPOCH FROM (awl.created_at - awl.token_issued_at))) AS actual_secs,
      COUNT(*) OVER (PARTITION BY awl.user_id) AS lifetime_violations,
      COUNT(*) FILTER (WHERE awl.created_at >= NOW() - INTERVAL '24 hours') OVER (PARTITION BY awl.user_id) AS violations_today,
      MIN(awl.created_at) OVER (PARTITION BY awl.user_id) AS first_violation,
      MAX(awl.created_at) OVER (PARTITION BY awl.user_id) AS last_violation
    FROM ad_watch_log awl
    JOIN users u ON u.id = awl.user_id
    JOIN user_ad_positions uap ON uap.user_id = awl.user_id
    JOIN ad_plans al ON al.id = uap.ad_plan_id
    WHERE awl.token_issued_at IS NOT NULL
      AND EXTRACT(EPOCH FROM (awl.created_at - awl.token_issued_at)) < (al.ad_duration_seconds - 3)
    ORDER BY lifetime_violations DESC
    LIMIT 100
  `);

  const rows = (violations as any) as any[];
  const uniqueUsers = new Set(rows.map((r) => r.user_id)).size;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Timer size={24} className="text-[#f97316]" />
          Speed Violation Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Ad submissions faster than required watch duration — {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Violations", value: rows.length, color: "text-red-600" },
          { label: "Unique Users", value: uniqueUsers, color: "text-orange-600" },
          { label: "Grace Margin", value: "3s", color: "text-gray-500" },
          { label: "Auto-Bans Triggered", value: 0, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Timer size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-300 font-semibold">No speed violations detected</p>
          <p className="text-xs text-gray-300 mt-2">Speed detection requires <code>tokenIssuedAt</code> to be populated when ads are served.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#151d48]">Speed Violation Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-left">Plan</th>
                  <th className="px-6 py-3 text-right">Required (s)</th>
                  <th className="px-6 py-3 text-right">Actual (s)</th>
                  <th className="px-6 py-3 text-right">Lifetime</th>
                  <th className="px-6 py-3 text-right">Today</th>
                  <th className="px-6 py-3 text-left">Risk</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const risk = Number(row.lifetime_violations) >= 50 ? "critical" : Number(row.lifetime_violations) >= 20 ? "high_risk" : "suspicious";
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-[#151d48]">@{row.username}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{row.plan_name}</td>
                      <td className="px-6 py-4 text-right font-mono">{row.required_secs}s</td>
                      <td className="px-6 py-4 text-right font-mono text-red-600 font-bold">{row.actual_secs}s</td>
                      <td className="px-6 py-4 text-right font-bold text-orange-600">{row.lifetime_violations}</td>
                      <td className="px-6 py-4 text-right text-red-500 font-semibold">{row.violations_today}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full
                          ${risk === "critical" ? "bg-red-100 text-red-700" : risk === "high_risk" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {risk.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">Warn</button>
                          <button className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">Suspend</button>
                          <button className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Ban</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
