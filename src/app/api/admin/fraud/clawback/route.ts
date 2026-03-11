import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ledger, userAccountStatus, adminAuditLog } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
// Need to import an auth check here in a real app, assuming admin is authorized for this example

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, amount, reason, banUser, adminId, adminUsername } = await req.json();

    if (!targetUserId || !amount || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create a negative ledger entry to deduct the amount
    await db.insert(ledger).values({
      userId: targetUserId,
      type: "admin_deduction",
      amount: (-Math.abs(Number(amount))).toString(),
      details: { reason, note: "Clawback for fraudulent activity" },
    });

    // 2. Ban user if requested
    if (banUser) {
      await db.update(userAccountStatus)
        .set({
          isBanned: true,
          bannedAt: new Date(),
          bannedByAdminId: adminId,
          banReason: reason,
          banType: 'permanent'
        })
        .where(eq(userAccountStatus.userId, targetUserId));
    }

    // 3. Log to audit trail
    await db.insert(adminAuditLog).values({
      adminId: adminId || "00000000-0000-0000-0000-000000000000",
      adminUsername: adminUsername || "System Admin",
      action: "clawback_bonus",
      category: "financial",
      description: `Clawed back $${amount}. Reason: ${reason}${banUser ? ' (and banned user)' : ''}`,
      targetUserId: targetUserId,
      reason: reason,
      severity: "high",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Clawback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
