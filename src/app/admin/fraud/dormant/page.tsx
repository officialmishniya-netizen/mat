import { db } from "@/lib/db";
import { adWatchLog, withdrawals, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Clock, AlertTriangle } from "lucide-react";

export default async function DormantRevivalPage() {
  const settings = await getSiteSettings();

  // Find accounts dormant 60+ days then suddenly active
  const dormant = await db.execute(sql`
    WITH last_before AS (
      SELECT DISTINCT ON (user_id)
        user_id,
        created_at AS last_activity_before
      FROM ad_watch_log
      WHERE created_at < NOW() - INTERVAL '60 days'
      ORDER BY user_id, created_at DESC
    ),
    first_after AS (
      SELECT DISTINCT ON (user_id)
        user_id,
        created_at AS revival_date,
        ip_address AS revival_ip
      FROM ad_watch_log
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY user_id, created_at ASC
    ),
    combined AS (
      SELECT
        fa.user_id,
        lb.last_activity_before,
        fa.revival_date,
        fa.revival_ip,
        EXTRACT(DAY FROM fa.revival_date - lb.last_activity_before) AS days_dormant
      FROM first_after fa
      JOIN last_before lb ON lb.user_id = fa.user_id
      WHERE fa.revival_date - lb.last_activity_before > INTERVAL '60 days'
    )
    SELECT
      c.*,
      u.username,
      (SELECT COUNT(*) FROM withdrawals w WHERE w.user_id = c.user_id AND w.created_at >= c.revival_date AND w.created_at <= c.revival_date + INTERVAL '48 hours') AS early_wd_count
    FROM combined c
    JOIN users u ON u.id = c.user_id
    ORDER BY c.days_dormant DESC
    LIMIT 100
  `);

  const rows = (dormant as any) as any[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Clock size={24} className="text-[#f97316]" />
          Dormant Account Revival Alerts
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Inactive 60+ days then suddenly active — {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revived Accounts", value: rows.length, color: "text-red-600" },
          { label: "With Early Withdrawal", value: rows.filter(r => Number(r.early_wd_count) > 0).length, color: "text-orange-600" },
          { label: "Avg Days Dormant", value: rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.days_dormant), 0) / rows.length) : 0, color: "text-blue-600" },
          { label: "Auto-Holds Applied", value: 0, color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#151d48]">Dormant Account Revivals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Username</th>
                <th className="px-6 py-3 text-left">Days Dormant</th>
                <th className="px-6 py-3 text-left">Revival Date</th>
                <th className="px-6 py-3 text-left">Early Withdrawal</th>
                <th className="px-6 py-3 text-left">Signals</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300">No dormant revivals detected</td></tr>
              )}
              {rows.map((row, i) => {
                const signals = Number(row.early_wd_count) > 0 ? 2 : 1;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#151d48]">@{row.username}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-orange-600">{Math.round(Number(row.days_dormant))} days</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(row.revival_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {Number(row.early_wd_count) > 0 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">Yes</span>
                      ) : (
                        <span className="text-gray-300 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {Array.from({ length: signals }).map((_, j) => (
                          <div key={j} className="w-2 h-2 rounded-full bg-orange-400" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">Hold 7d</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Re-Verify</button>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100">Clear</button>
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
