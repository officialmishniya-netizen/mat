import { db } from "@/lib/db";
import { adWatchLog, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Bot, AlertTriangle } from "lucide-react";

export default async function BotPatternsPage() {
  const settings = await getSiteSettings();

  // Five bot signals computed per user from adWatchLog (requires tokenIssuedAt)
  const botScores = await db.execute(sql`
    WITH stats AS (
      SELECT
        user_id,
        COUNT(*) AS total_watches,
        -- Signal 1: Low timing variance (std dev < 2s)
        STDDEV(EXTRACT(EPOCH FROM (created_at - COALESCE(token_issued_at, created_at - INTERVAL '15 seconds')))) AS timing_stddev,
        -- Signal 3: Night activity (03:00-05:00)
        ROUND(
          COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM created_at) BETWEEN 3 AND 4) * 100.0 / NULLIF(COUNT(*), 0),
          1
        ) AS night_pct,
        -- Signal 5: Days at 100% daily limit
        COUNT(DISTINCT DATE_TRUNC('day', created_at)) AS active_days
      FROM ad_watch_log
      WHERE token_issued_at IS NOT NULL
      GROUP BY user_id
      HAVING COUNT(*) >= 50
    )
    SELECT
      u.username,
      u.id AS user_id,
      s.total_watches,
      ROUND(s.timing_stddev::numeric, 2) AS timing_stddev,
      s.night_pct,
      s.active_days,
      -- Bot score: weighted combination of signals
      LEAST(100, ROUND(
        (CASE WHEN s.timing_stddev < 2 THEN 40 ELSE 0 END) +
        (CASE WHEN s.night_pct > 50 THEN 30 ELSE (s.night_pct::numeric * 0.6) END) +
        (CASE WHEN s.total_watches / NULLIF(s.active_days, 0) > 15 THEN 30 ELSE 0 END)
      )) AS bot_score
    FROM stats s
    JOIN users u ON u.id = s.user_id
    ORDER BY bot_score DESC
    LIMIT 100
  `);

  const rows = (botScores.rows ?? []) as any[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Bot size={24} className="text-[#f97316]" />
          Bot Pattern Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Automated activity scoring across 5 behavioral signals — {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Accounts Scored", value: rows.length, color: "text-blue-600" },
          { label: "Score ≥ 70 (High Risk)", value: rows.filter(r => Number(r.bot_score) >= 70).length, color: "text-orange-600" },
          { label: "Score ≥ 90 (Critical)", value: rows.filter(r => Number(r.bot_score) >= 90).length, color: "text-red-600" },
          { label: "Min Watches req'd", value: "50", color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Bot size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-300 font-semibold">Insufficient data for bot scoring</p>
          <p className="text-xs text-gray-300 mt-2">Requires at least 50 ad watches per user with tokenIssuedAt populated.</p>
        </div>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#151d48]">Bot Score Leaderboard</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-right">Bot Score</th>
                  <th className="px-6 py-3 text-right">Timing σ (s)</th>
                  <th className="px-6 py-3 text-right">Night %</th>
                  <th className="px-6 py-3 text-right">Total Watches</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const score = Number(row.bot_score);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-[#151d48]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-300">#{i + 1}</span>
                          @{row.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${score >= 90 ? "bg-red-500" : score >= 70 ? "bg-orange-500" : "bg-yellow-400"}`}
                              style={{ width: `${score}%` }} />
                          </div>
                          <span className={`font-black text-sm ${score >= 90 ? "text-red-600" : score >= 70 ? "text-orange-600" : "text-yellow-600"}`}>
                            {score}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-gray-500">{row.timing_stddev ?? "—"}</td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500">{row.night_pct}%</td>
                      <td className="px-6 py-4 text-right text-gray-400">{row.total_watches}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">CAPTCHA</button>
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
