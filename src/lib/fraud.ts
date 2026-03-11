import { db } from "@/lib/db";
import {
  adminAuditLog,
  fraudAlerts,
  fraudWhitelist,
  userAccountStatus,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Insert a fraud alert row. */
export async function insertFraudAlert(opts: {
  detectorType: string;
  severity: "suspicious" | "high_risk" | "critical";
  title: string;
  description: string;
  involvedUserIds?: string[];
  involvedUsernames?: string[];
  metadata?: Record<string, unknown>;
}) {
  return db.insert(fraudAlerts).values({
    detectorType: opts.detectorType,
    severity: opts.severity,
    title: opts.title,
    description: opts.description,
    involvedUserIds: opts.involvedUserIds ?? [],
    involvedUsernames: opts.involvedUsernames ?? [],
    metadata: opts.metadata ?? {},
    status: "new",
  });
}

/** Log every admin action to the existing adminAuditLog table. */
export async function logAdminAction(opts: {
  adminId: string;
  adminUsername: string;
  action: string;
  category: string;
  description: string;
  targetUserId?: string;
  targetUsername?: string;
  metadata?: Record<string, unknown>;
  severity?: "low" | "medium" | "high" | "critical";
  ipAddress?: string;
}) {
  return db.insert(adminAuditLog).values({
    adminId: opts.adminId,
    adminUsername: opts.adminUsername,
    action: opts.action,
    category: opts.category,
    description: opts.description,
    targetUserId: opts.targetUserId,
    targetUsername: opts.targetUsername,
    metadata: opts.metadata ?? {},
    severity: opts.severity ?? "medium",
    ipAddress: opts.ipAddress,
  });
}

/** Add delta to a user's risk score (clamped 0–100) and optionally push a flag. */
export async function updateRiskScore(userId: string, delta: number, flag?: string) {
  const existing = await db.query.userAccountStatus.findFirst({
    where: eq(userAccountStatus.userId, userId),
    columns: { riskScore: true, fraudFlags: true },
  });
  if (!existing) return;
  const newScore = Math.min(100, Math.max(0, (existing.riskScore ?? 0) + delta));
  const flags = (existing.fraudFlags as string[]) ?? [];
  if (flag && !flags.includes(flag)) flags.push(flag);
  await db
    .update(userAccountStatus)
    .set({ riskScore: newScore, fraudFlags: flags, isHighRisk: newScore >= 70 })
    .where(eq(userAccountStatus.userId, userId));
}

/** Check if an IP or user ID is in the fraud whitelist. */
export async function isWhitelisted(type: "ip" | "user", value: string): Promise<boolean> {
  const row = await db.query.fraudWhitelist.findFirst({
    where: (t, { and, eq }) =>
      and(eq(t.type, type), eq(t.value, value), eq(t.isActive, true)),
  });
  return !!row;
}
