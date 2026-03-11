import { db } from "@/lib/db";
import { adWatchLog, ledger } from "@/lib/db/schema";
import { sql, desc } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

export default async function EarningsMismatchPage() {
  const settings = await getSiteSettings();

  // Expected = SUM(earnedAmount) from adWatchLog per user
  // Actual   = SUM(positive ledger entries of type 'ad_watch' or 'cycle_payout') per user
  const mismatch = await db.execute(sql`
    WITH expected AS (
      SELECT user_id, SUM(earned_amount) AS expected_total
      FROM ad_watch_log
      GROUP BY user_id
    ),
    actual AS (
      SELECT user_id, SUM(amount) AS actual_total
      FROM ledger
      WHERE amount > 0
        AND type IN ('ad_watch', 'cycle_payout', 'ad_click_reward')
      GROUP BY user_id
    )
    SELECT
      u.username,
      u.id AS user_id,
      COALESCE(e.expected_total, 0) AS expected,
      COALESCE(a.actual_total, 0) AS actual,
      COALESCE(a.actual_total, 0) - COALESCE(e.expected_total, 0) AS discrepancy,
      CASE WHEN COALESCE(e.expected_total, 0) > 0
        THEN ROUND(((COALESCE(a.actual_total, 0) - COALESCE(e.expected_total, 0)) / COALESCE(e.expected_total, 0)) * 100, 2)
        ELSE 0
      END AS discrepancy_pct
    FROM users u
    JOIN expected e ON e.user_id = u.id
    JOIN actual a   ON a.user_id = u.id
    WHERE COALESCE(a.actual_total, 0) > COALESCE(e.expected_total, 0) * 1.05
    ORDER BY discrepancy DESC
    LIMIT 100
  `);

  const rows = (mismatch.rows ?? []) as any[];
  const totalDiscrepancy = rows.reduce((s, r) => s + Number(r.discrepancy), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <TrendingUp size={24} className="text-[#f97316]" />
          Earnings Mismatch Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Actual ledger earnings exceeding explained watch history — {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Flagged Accounts", value: rows.length, color: "text-red-600" },
          { label: "Total Discrepancy", value: `$${totalDiscrepancy.toFixed(2)}`, color: "text-orange-600" },
          { label: "Tolerance Threshold", value: "5%", color: "text-gray-500" },
          { label: "Pending Deductions", value: 0, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#151d48]">Flagged Accounts — Earnings Beyond Watch History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-right">Expected ($)</th>
                <th className="px-6 py-3 text-right">Actual ($)</th>
                <th className="px-6 py-3 text-right">Discrepancy</th>
                <th className="px-6 py-3 text-right">%</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300">No mismatches detected above tolerance</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#151d48]">@{row.username}</td>
                  <td className="px-6 py-4 text-right text-gray-500 font-mono">${Number(row.expected).toFixed(4)}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold">${Number(row.actual).toFixed(4)}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">${Number(row.discrepancy).toFixed(4)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      +{Number(row.discrepancy_pct).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Audit Ledger</button>
                      <button className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">Deduct</button>
                      <button className="text-xs font-semibold px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100">Clear</button>
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
