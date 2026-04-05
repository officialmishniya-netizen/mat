import { db } from "@/lib/db";
import { users, adViews, ledger } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { getSiteSettings } from "@/lib/settings";
import NetworkGraphClient from "./NetworkGraphClient";
import { Network } from "lucide-react";

export default async function NetworkGraphPage() {
  const settings = await getSiteSettings();

  // Build graph nodes: users with their status, earnings, risk score
  const nodesRaw = await db.execute(sql`
    SELECT
      u.id,
      u.username,
      u.created_at,
      COALESCE(uas.risk_score, 0) AS risk_score,
      COALESCE(uas.is_banned, false) AS is_banned,
      COALESCE(uas.is_frozen, false) AS is_frozen,
      COALESCE(uas.is_high_risk, false) AS is_high_risk,
      COALESCE(SUM(l.amount) FILTER (WHERE l.amount > 0), 0) AS total_earned
    FROM users u
    LEFT JOIN user_account_status uas ON uas.user_id = u.id
    LEFT JOIN ledger l ON l.user_id = u.id
    GROUP BY u.id, u.username, u.created_at, uas.risk_score, uas.is_banned, uas.is_frozen, uas.is_high_risk
    LIMIT 500
  `);

  // Build edges: shared IPs
  const ipEdges = await db.execute(sql`
    SELECT DISTINCT
      av1.user_id AS source,
      av2.user_id AS target,
      'shared_ip' AS type,
      av1.ip_address AS value
    FROM ad_views av1
    JOIN ad_views av2 ON av2.ip_address = av1.ip_address AND av2.user_id > av1.user_id
    LIMIT 1000
  `);

  // Referral edges
  const refEdges = await db.execute(sql`
    SELECT id AS source, sponsor_id AS target, 'referral' AS type
    FROM users
    WHERE sponsor_id IS NOT NULL
    LIMIT 500
  `);

  const nodes = (nodesRaw as any) as any[];
  const edges = [
    ...(ipEdges as any).map((e: any) => ({ ...e, color: "#f97316" })),
    ...(refEdges as any).map((e: any) => ({ ...e, color: "#3b82f6" })),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <Network size={24} className="text-[#f97316]" />
          Account Network Graph
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Visual map of connections — {settings.site_name} · {nodes.length} nodes · {edges.length} edges
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold">
        {[
          { color: "#f97316", label: "Shared IP" },
          { color: "#3b82f6", label: "Referral" },
          { color: "#ef4444", label: "Money Transfer" },
          { color: "#a855f7", label: "Shared Device" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-gray-100">
            <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-gray-500">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 ml-4">
          {[
            { color: "#22c55e", label: "Active" },
            { color: "#3b82f6", label: "Frozen" },
            { color: "#ef4444", label: "Banned" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <NetworkGraphClient nodes={nodes} edges={edges} />
    </div>
  );
}
