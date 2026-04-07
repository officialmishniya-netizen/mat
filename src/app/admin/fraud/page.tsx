import { db } from "@/lib/db";
import { fraudAlerts, users } from "@/lib/db/schema";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import {
  ShieldAlert, AlertTriangle, CheckCircle, Clock, TrendingUp, Users as UsersIcon, XCircle, Eye
} from "lucide-react";

const SEVERITY_COLORS: Record<string, string> = {
  suspicious: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high_risk: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  under_review: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  false_positive: "bg-gray-100 text-gray-500",
};

const DETECTOR_LABELS: Record<string, string> = {
  duplicate_ip: "Duplicate IP", speed_violation: "Speed Violation",
  vpn: "VPN Detector", withdrawal_anomaly: "Withdrawal Anomaly",
  self_referral: "Self-Referral", device_cluster: "Device Cluster",
  bot_pattern: "Bot Pattern", earnings_mismatch: "Earnings Mismatch",
  dormant_revival: "Dormant Revival", network_graph: "Network Graph",
  burst_registration: "Burst Registration",
};

export default async function FraudAlertCenter() {
  const settings = await getSiteSettings();
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const dayAgo = new Date(); dayAgo.setDate(dayAgo.getDate() - 1);

  const allAlerts = await db
    .select()
    .from(fraudAlerts)
    .orderBy(desc(fraudAlerts.createdAt))
    .limit(200);

  const todayAlerts = allAlerts.filter(a => a.createdAt >= dayAgo);
  const criticalNew = allAlerts.filter(a => a.severity === "critical" && a.status === "new");
  const weekAlerts = allAlerts.filter(a => a.createdAt >= weekAgo);
  const resolvedCount = allAlerts.filter(a => a.status === "resolved").length;
  const fpCount = allAlerts.filter(a => a.status === "false_positive").length;
  const totalReviewed = resolvedCount + fpCount;
  const fpRate = totalReviewed > 0 ? Math.round((fpCount / totalReviewed) * 100) : 0;

  /* weekly bar chart data */
  const detectorCounts: Record<string, number> = {};
  weekAlerts.forEach(a => {
    detectorCounts[a.detectorType] = (detectorCounts[a.detectorType] ?? 0) + 1;
  });
  const maxCount = Math.max(...Object.values(detectorCounts), 1);

  const statCards = [
    { label: "Active Alerts Today", value: todayAlerts.length, icon: ShieldAlert, color: "text-blue-600 bg-blue-50" },
    { label: "Critical Unreviewed", value: criticalNew.length, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
    { label: "Flagged This Week", value: weekAlerts.length, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
    { label: "Resolved This Month", value: resolvedCount, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "False Positive Rate", value: `${fpRate}%`, icon: XCircle, color: "text-purple-600 bg-purple-50" },
    { label: "Total in Audit Trail", value: allAlerts.length, icon: Clock, color: "text-gray-600 bg-gray-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[#151d48] flex items-center gap-2">
          <ShieldAlert size={24} className="text-[#f97316]" />
          Fraud Alert Center
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Unified live feed from all 11 detectors — {settings.site_name}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <div className="text-2xl font-black text-[#151d48]">{card.value}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alert Feed */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#151d48]">Live Alert Feed</h2>
            <span className="text-xs text-gray-400">{allAlerts.length} total</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[620px] overflow-y-auto">
            {allAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                <CheckCircle size={40} className="mb-3" />
                <p className="font-semibold">No alerts yet — all clear!</p>
              </div>
            )}
            {allAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[alert.severity] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {alert.severity.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                        {DETECTOR_LABELS[alert.detectorType] ?? alert.detectorType}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[alert.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {alert.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e2a4a] truncate">{alert.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{alert.description}</p>
                    {alert.involvedUsernames && (alert.involvedUsernames as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(alert.involvedUsernames as string[]).map((u) => (
                          <span key={u} className="text-[11px] bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-lg">
                            @{u}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-gray-300">{new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="flex gap-1 mt-2 justify-end">
                      <button className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                        <Eye size={12} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <XCircle size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#151d48]">This Week by Detector</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            {Object.entries(detectorCounts).length === 0 && (
              <p className="text-xs text-gray-300 text-center py-8">No alerts this week</p>
            )}
            {Object.entries(detectorCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">{DETECTOR_LABELS[type] ?? type}</span>
                    <span className="font-bold text-[#151d48]">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f97316] rounded-full"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
