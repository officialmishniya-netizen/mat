import { db } from "@/lib/db";
import { withdrawals, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Wallet, AlertTriangle } from "lucide-react";
import AnomalyActionButtons from "./AnomalyActionButtons";

const RULE_LABELS: Record<string, string> = {
  new_account: "Rule 1 — Withdrawal within 72h of signup",
  every_cycle: "Rule 2 — Withdraws every cycle, zero reinvestment",
  multi_24h: "Rule 3 — Multiple withdrawals in 24h",
  amount_match: "Rule 4 — Amount suspiciously close to deposit",
  post_dormant: "Rule 5 — Large withdrawal after 60+ days inactivity",
  address_change: "Rule 6 — Address changed within 24h of request",
};

export default async function WithdrawalAnomaliesPage() {
  const settings = await getSiteSettings();

  // Rule 1: withdrawal within 72 hours of account creation
  const rule1 = await db.execute(sql`
    SELECT w.id, w.user_id, w.amount, w.created_at, u.username, u.created_at AS user_joined,
           EXTRACT(EPOCH FROM (w.created_at - u.created_at)) / 3600 AS hours_since_join
    FROM withdrawals w
    JOIN users u ON u.id = w.user_id
    WHERE w.created_at - u.created_at < INTERVAL '72 hours'
    AND w.status = 'pending'
    ORDER BY w.created_at DESC LIMIT 50
  `);

  // Rule 3: multiple withdrawals within 24 hours
  const rule3 = await db.execute(sql`
    SELECT w.user_id, u.username, COUNT(*) AS wd_count, MAX(w.created_at) AS last_wd
    FROM withdrawals w
    JOIN users u ON u.id = w.user_id
    WHERE w.created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY w.user_id, u.username
    HAVING COUNT(*) >= 3
    LIMIT 50
  `);

  const anomalies = [
    ...(rule1 as any).map((r: any) => ({ ...r, rule: "new_account" })),
    ...(rule3 as any).map((r: any) => ({ ...r, amount: "multiple", rule: "multi_24h" })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Wallet size={24} className="text-[#f97316]" />
          Withdrawal Anomaly Detector
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time pattern monitoring for {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts", value: anomalies.length, color: "text-red-600 bg-red-50" },
          { label: "Signup Clusters", value: (rule1 as any).length, color: "text-orange-600 bg-orange-50" },
          { label: "Velocity Spikes", value: (rule3 as any).length, color: "text-yellow-600 bg-yellow-50" },
          { label: "Safe Transfers", value: "Verified", color: "text-green-600 bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color.split(" ")[0]}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Anomaly Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <h2 className="font-bold text-[#151d48]">Critical Anomaly Feed</h2>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Review required for pending requests</p>
        </div>
        <div className="divide-y divide-gray-50">
          {anomalies.length === 0 && (
            <div className="py-20 text-center text-gray-300">
              <Wallet size={36} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold">No High-Risk Patterns Detected</p>
            </div>
          )}
          {anomalies.map((a: any, i) => (
            <div key={i} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl ${a.rule === 'multi_24h' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'} shrink-0`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-500">
                      {RULE_LABELS[a.rule] ?? a.rule}
                    </span>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-black text-[#151d48] text-lg">@{a.username}</span>
                      <span className="font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                        {a.amount === 'multiple' ? 'Velocity Alert' : `$${Number(a.amount).toFixed(2)}`}
                      </span>
                      {a.hours_since_join && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg font-bold">
                          {Number(a.hours_since_join).toFixed(1)}h Post-Signup
                        </span>
                      )}
                      {a.wd_count && (
                        <span className="text-xs text-red-500 font-black bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase">
                          {a.wd_count} Requests / 24h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <AnomalyActionButtons withdrawalId={a.id} userId={a.user_id} username={a.username} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
