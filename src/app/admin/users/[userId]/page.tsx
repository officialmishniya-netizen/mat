import { db } from "@/lib/db";
import {
    users, userAccountStatus, ledger, userAdPositions,
    adPlans, withdrawals, adminUserNotes, adminMessages, adminAuditLog
} from "@/lib/db/schema";
import { eq, desc, and, sum } from "drizzle-orm";
import UserDetailClient from "./UserDetailClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
    const userId = params.userId;

    // 1. Base User + Status
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });
    if (!user) return notFound();

    let status = await db.query.userAccountStatus.findFirst({
        where: eq(userAccountStatus.userId, userId)
    });

    if (!status) {
        // Fallback default status if missing
        status = {
            id: 'mock', userId, status: 'active', isFrozen: false,
            isBanned: false, isDeleted: false, riskScore: 0,
            withdrawalsEnabled: true, earningsEnabled: true,
            twoFaEnabled: false
        } as any;
    }

    // Ensure status is treated as non-nullable for the rest of the function
    const activeStatus = status!;

    // 2. Ledger Aggregates
    const ledgerTotals = await db.select({
        totalBalance: sum(ledger.amount)
    }).from(ledger).where(eq(ledger.user_id, userId));

    const totalEarnedQuery = await db.select({
        totalEarned: sum(ledger.amount)
    }).from(ledger).where(and(eq(ledger.user_id, userId), eq(ledger.type, 'cycle_revenue'))); // or total credits > 0

    const totalWithdrawnQuery = await db.select({
        totalWithdrawn: sum(withdrawals.amount)
    }).from(withdrawals).where(and(eq(withdrawals.user_id, userId), eq(withdrawals.status, 'paid')));

    const totalBalance = Number(ledgerTotals[0]?.totalBalance || 0).toFixed(2);
    const totalEarned = Number(totalEarnedQuery[0]?.totalEarned || 0).toFixed(2);
    const totalWithdrawn = Number(totalWithdrawnQuery[0]?.totalWithdrawn || 0).toFixed(2);

    // 3. Ledger History
    const ledgerHistory = await db.query.ledger.findMany({
        where: eq(ledger.user_id, userId),
        orderBy: [desc(ledger.created_at)],
        limit: 50
    });

    // 4. Active Plans
    const activePlans = await db.select({
        id: userAdPositions.id,
        planName: adPlans.name,
        clickGoal: userAdPositions.clickGoalSnapshot,
        lockedBalance: userAdPositions.lockedBalance,
        adsWatchedToday: userAdPositions.adsWatchedToday,
        dailyAds: adPlans.dailyAds,
        totalCycles: (userAdPositions as any).totalCycles || 0,
        status: userAdPositions.status
    }).from(userAdPositions)
        .innerJoin(adPlans, eq(userAdPositions.adPlanId, adPlans.id))
        .where(eq(userAdPositions.userId, userId));

    const totalCyclesCount = activePlans.reduce((sum, p) => sum + (p.totalCycles || 0), 0);

    // 5. Withdrawals
    const userWithdrawals = await db.query.withdrawals.findMany({
        where: eq(withdrawals.user_id, userId),
        orderBy: [desc(withdrawals.created_at)],
    });

    // 6. Notes
    const notes = await db.query.adminUserNotes.findMany({
        where: eq(adminUserNotes.userId, userId),
        orderBy: [desc(adminUserNotes.isPinned), desc(adminUserNotes.createdAt)],
    });

    // 7. Messages
    const messages = await db.query.adminMessages.findMany({
        where: eq(adminMessages.toUserId, userId),
        orderBy: [desc(adminMessages.sentAt)],
    });

    // 8. Audit Log
    const auditLogs = await db.query.adminAuditLog.findMany({
        where: eq(adminAuditLog.targetUserId, userId),
        orderBy: [desc(adminAuditLog.createdAt)],
        limit: 100
    });

    // 9. Referrals info
    const referralsCount = await db.select().from(users).where(eq(users.sponsor_id, userId));
    const sponsor = user.sponsor_id ? await db.query.users.findFirst({ where: eq(users.id, user.sponsor_id) }) : null;

    // Compile prop object
    const userData = {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            rank: user.rank,
            createdAt: user.created_at?.toISOString() || '',
            sponsorId: user.sponsor_id,
        },
        sponsor: sponsor ? { id: sponsor.id, username: sponsor.username } : null,
        referralsCount: referralsCount.length,
        status: {
            ...activeStatus,
            frozenAt: activeStatus?.frozenAt?.toISOString() || null,
            frozenUntil: activeStatus?.frozenUntil?.toISOString() || null,
            bannedAt: activeStatus?.bannedAt?.toISOString() || null,
            banExpiresAt: activeStatus?.banExpiresAt?.toISOString() || null,
            deletedAt: activeStatus?.deletedAt?.toISOString() || null,
            withdrawalHoldUntil: activeStatus?.withdrawalHoldUntil?.toISOString() || null,
        },
        financials: {
            totalBalance,
            totalEarned,
            totalWithdrawn,
            totalCycles: totalCyclesCount,
        },
        ledger: ledgerHistory.map(l => ({
            ...l,
            created_at: l.created_at?.toISOString() || ''
        })),
        activePlans,
        withdrawals: userWithdrawals.map(w => ({
            ...w,
            createdAt: w.created_at?.toISOString() || ''
        })),
        notes: notes.map(n => ({
            ...n,
            createdAt: n.createdAt?.toISOString() || ''
        })),
        messages: messages.map(m => ({
            ...m,
            sentAt: m.sentAt?.toISOString() || ''
        })),
        auditLogs: auditLogs.map(a => ({
            ...a,
            createdAt: a.createdAt?.toISOString() || ''
        }))
    };

    return <UserDetailClient userData={userData as any} />;
}
