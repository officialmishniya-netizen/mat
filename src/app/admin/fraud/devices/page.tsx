import { db } from "@/lib/db";
import { deviceFingerprints, users } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import { Fingerprint, Users as UsersIcon } from "lucide-react";

export default async function DeviceClustersPage() {
  const settings = await getSiteSettings();

  // Group by fingerprintHash to find clusters
  const clusters = await db.execute(sql`
    SELECT
      df.fingerprint_hash,
      df.browser,
      df.os,
      df.screen_resolution,
      df.timezone,
      COUNT(DISTINCT df.user_id) AS account_count,
      ARRAY_AGG(DISTINCT u.username) AS usernames,
      ARRAY_AGG(DISTINCT df.user_id) AS user_ids,
      MIN(df.created_at) AS first_seen,
      MAX(df.created_at) AS last_seen
    FROM device_fingerprints df
    JOIN users u ON u.id = df.user_id
    WHERE df.fingerprint_hash IS NOT NULL
    GROUP BY df.fingerprint_hash, df.browser, df.os, df.screen_resolution, df.timezone
    HAVING COUNT(DISTINCT df.user_id) >= 2
    ORDER BY account_count DESC
    LIMIT 50
  `);

  const rows = (clusters.rows ?? []) as any[];
  const totalAccounts = rows.reduce((s, r) => s + Number(r.account_count), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Fingerprint size={24} className="text-[#f97316]" />
          Device Fingerprint Clusters
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Multiple accounts sharing the same device fingerprint â€” {settings.site_name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Device Clusters", value: rows.length, color: "text-red-600" },
          { label: "Accounts in Clusters", value: totalAccounts, color: "text-orange-600" },
          { label: "Largest Cluster", value: rows[0] ? Number(rows[0].account_count) : 0, color: "text-yellow-600" },
          { label: "Fingerprints Collected", value: "â€“", color: "text-gray-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <Fingerprint size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-300 font-semibold">No device fingerprint clusters found</p>
          <p className="text-xs text-gray-300 mt-2">Collection starts automatically when users log in once device_fingerprints are being populated at login.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((cluster, i) => {
          const count = Number(cluster.account_count);
          const risk = count >= 5 ? "critical" : count >= 3 ? "high_risk" : "suspicious";
          const usernames = Array.isArray(cluster.usernames) ? cluster.usernames : [];
          return (
            <div key={i} className={`bg-white rounded-2xl border shadow-sm overflow-hidden
              ${risk === "critical" ? "border-red-200" : risk === "high_risk" ? "border-orange-200" : "border-gray-100"}`}>
              <div className={`px-5 py-3 border-b flex items-center justify-between
                ${risk === "critical" ? "bg-red-50 border-red-100" : risk === "high_risk" ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <Fingerprint size={14} className={risk === "critical" ? "text-red-600" : risk === "high_risk" ? "text-orange-600" : "text-gray-400"} />
                  <span className="text-xs font-mono text-gray-400">{cluster.fingerprint_hash?.slice(0, 12)}â€¦</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                  ${risk === "critical" ? "bg-red-100 text-red-700" : risk === "high_risk" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {risk.replace("_", " ")}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  <UsersIcon size={14} className="text-gray-400" />
                  <span className="text-sm font-bold text-[#151d48]">{count} accounts share this device</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {usernames.slice(0, 6).map((u: string) => (
                    <span key={u} className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-lg">@{u}</span>
                  ))}
                  {usernames.length > 6 && <span className="text-xs text-gray-400">+{usernames.length - 6} more</span>}
                </div>
                <div className="text-xs text-gray-300 space-y-0.5 mb-4">
                  {cluster.browser   && <div>Browser: <span className="text-gray-500">{cluster.browser}</span></div>}
                  {cluster.os        && <div>OS: <span className="text-gray-500">{cluster.os}</span></div>}
                  {cluster.timezone  && <div>TZ: <span className="text-gray-500">{cluster.timezone}</span></div>}
                  {cluster.screen_resolution && <div>Screen: <span className="text-gray-500">{cluster.screen_resolution}</span></div>}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs font-semibold py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">Ban Cluster</button>
                  <button className="flex-1 text-xs font-semibold py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">Investigate</button>
                  <button className="flex-1 text-xs font-semibold py-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">Whitelist</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
