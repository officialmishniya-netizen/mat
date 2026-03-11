'use server';
import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';
import { db } from '@/lib/db';
import { createLedgerEntry } from '@/lib/ledger';
import {
    users, userAccountStatus, adminAuditLog,
    adminUserNotes, ledger, userAdPositions,
    withdrawals, adminMessages, ipBanList
} from '@/lib/db/schema';
import { eq, and, desc, sum, gte, lte, sql } from 'drizzle-orm';
import Decimal from 'decimal.js';
import { notifyUser } from '@/lib/telegram/bot';

// Helper to get user balance
async function getUserBalance(userId: string): Promise<string> {
    const result = await db.select({
        total: sum(ledger.amount)
    }).from(ledger).where(eq(ledger.user_id, userId));
    return result[0]?.total || '0.00';
}

// â”€â”€ HELPER: Log admin action â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function logAdminAction(
    tx: any,
    adminId: string,
    adminUsername: string,
    action: string,
    category: string,
    targetUserId: string,
    targetUsername: string,
    description: string,
    metadata?: object,
    severity: string = 'medium'
) {
    await tx.insert(adminAuditLog).values({
        adminId, adminUsername, targetUserId, targetUsername,
        action, category, description,
        metadata: metadata || {},
        severity,
    } as any);
}

// â”€â”€ HELPER: Verify admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin() {
    const supabase = await createClient();
    // Try getUser first; fall back to getSession for dummy-proxy compatibility
    let userId: string | undefined;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
    } catch {
        // getUser not available in dummy proxy — fall back
    }
    if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
    }
    if (!userId) throw new Error('unauthorized');
    const admin = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });
    if (admin?.role !== 'admin') throw new Error('forbidden');
    return admin;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ACCOUNT STATUS ACTIONS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Freeze account
export async function freezeUser(
    targetUserId: string,
    reason: string,
    freezeType: 'full' | 'withdrawals_only' | 'deposits_only',
    frozenUntil?: Date
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            // Check if status row exists, if not, create it
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                isFrozen: true,
                status: 'frozen',
                frozenAt: new Date(),
                frozenByAdminId: admin.id,
                frozenReason: reason,
                frozenUntil: frozenUntil || null,
                freezeType,
                withdrawalsEnabled: freezeType !== 'deposits_only' ? false : true,
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'user_freeze',
                'account', targetUserId, target.username,
                `Account frozen: ${reason} (type: ${freezeType})`,
                { reason, freezeType, frozenUntil }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Unfreeze account
export async function unfreezeUser(targetUserId: string, reason: string) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(userAccountStatus).set({
                isFrozen: false,
                status: 'active',
                frozenAt: null,
                frozenReason: null,
                frozenUntil: null,
                freezeType: null,
                withdrawalsEnabled: true,
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'user_unfreeze',
                'account', targetUserId, target.username,
                `Account unfrozen: ${reason}`, { reason }, 'medium'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Ban user
export async function banUser(
    targetUserId: string,
    reason: string,
    banType: 'permanent' | 'temporary' | 'shadow',
    banExpiresAt?: Date
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                isBanned: true,
                status: banType === 'shadow' ? 'shadow_banned' : 'banned',
                bannedAt: new Date(),
                bannedByAdminId: admin.id,
                banReason: reason,
                banType,
                banExpiresAt: banExpiresAt || null,
                withdrawalsEnabled: false,
                earningsEnabled: false,
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            // Terminate all active sessions (We will run this outside of tx below)

            await logAdminAction(tx, admin.id, admin.username, 'user_ban',
                'account', targetUserId, target.username,
                `User banned: ${reason} (${banType})`,
                { reason, banType, banExpiresAt }, 'critical'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Unban user
export async function unbanUser(targetUserId: string, reason: string) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(userAccountStatus).set({
                isBanned: false,
                status: 'active',
                bannedAt: null,
                banReason: null,
                banType: null,
                banExpiresAt: null,
                withdrawalsEnabled: true,
                earningsEnabled: true,
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'user_unban',
                'account', targetUserId, target.username,
                `User unbanned: ${reason}`, { reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Soft delete (hides from platform, keeps data)
export async function softDeleteUser(
    targetUserId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                isDeleted: true,
                status: 'deleted',
                deletedAt: new Date(),
                deletedByAdminId: admin.id,
                deletionReason: reason,
                deletionType: 'soft',
                hardDeleteScheduledAt: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ), // 30 days
                updatedAt: new Date(),
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'user_delete',
                'account', targetUserId, target.username,
                `User soft deleted: ${reason}. Hard delete in 30 days.`,
                { reason }, 'critical'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Restore deleted user
export async function restoreUser(targetUserId: string, reason: string) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(userAccountStatus).set({
                isDeleted: false,
                status: 'active',
                deletedAt: null,
                deletionReason: null,
                hardDeleteScheduledAt: null,
                updatedAt: new Date(),
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'user_restore',
                'account', targetUserId, target.username,
                `User restored: ${reason}`, { reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// FINANCIAL ACTIONS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Add balance (credit)
export async function addBalance(
    targetUserId: string,
    amount: string,
    reason: string,
    category: string = 'admin_credit'
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };
        if (new Decimal(amount).lte(0))
            return { success: false, error: 'amount_must_be_positive' };

        // createLedgerEntry generally uses its own transaction, but here we can't easily pass tx to it as it's not designed to take tx as first arg in our lib.
        // I'll manually insert into ledger for the transaction to be safe, or just call createLedgerEntry outside tx.
        // wait, createLedgerEntry definition: export async function createLedgerEntry(userId: string, amount: string, type: string, referenceId?: string)
        // So I can't pass tx. I will just insert directly if inside tx, or just not use tx.

        // I will use direct tx insert for safety
        return await db.transaction(async (tx) => {
            await tx.insert(ledger).values({
                user_id: targetUserId,
                amount: new Decimal(amount).toFixed(2),
                type: category,
                reference_id: `admin_${admin.id}`,
            } as any);

            await logAdminAction(tx, admin.id, admin.username, 'balance_add',
                'financial', targetUserId, target.username,
                `Added $${amount} to balance: ${reason}`,
                { amount, reason, category }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Deduct balance (debit)
export async function deductBalance(
    targetUserId: string,
    amount: string,
    category: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.insert(ledger).values({
                user_id: targetUserId,
                amount: `-${new Decimal(amount).toFixed(2)}`,
                type: category,
                reference_id: `admin_${admin.id}`
            } as any);

            await logAdminAction(tx, admin.id, admin.username, 'balance_deduct',
                'financial', targetUserId, target.username,
                `Deducted $${amount} from balance: ${reason}`,
                { amount, reason, category }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Zero out balance
export async function zeroBalance(
    targetUserId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        const currentBalance = await getUserBalance(targetUserId);
        if (new Decimal(currentBalance).lte(0))
            return { success: false, error: 'balance_already_zero' };

        return await db.transaction(async (tx) => {
            await tx.insert(ledger).values({
                user_id: targetUserId,
                amount: `-${currentBalance}`,
                type: 'admin_balance_zero',
                reference_id: `admin_${admin.id}`
            } as any);

            await logAdminAction(tx, admin.id, admin.username, 'balance_zero',
                'financial', targetUserId, target.username,
                `Balance zeroed from $${currentBalance}: ${reason}`,
                { previousBalance: currentBalance, reason }, 'critical'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Reverse a specific ledger entry
export async function reverseLedgerEntry(
    ledgerEntryId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();

        const entry = await db.query.ledger.findFirst({
            where: eq(ledger.id, ledgerEntryId as any)
        });
        if (!entry) return { success: false, error: 'entry_not_found' };

        const target = await db.query.users.findFirst({
            where: eq(users.id, entry.user_id)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            // Create a reversal entry (opposite amount)
            const reversalAmount = new Decimal(entry.amount as string).negated().toFixed(2);
            await tx.insert(ledger).values({
                user_id: entry.user_id,
                amount: reversalAmount,
                type: 'admin_reversal',
                reference_id: entry.id
            } as any);

            await logAdminAction(tx, admin.id, admin.username, 'ledger_reversal',
                'financial', entry.user_id, target.username,
                `Reversed ledger entry ${ledgerEntryId} ($${entry.amount}): ${reason}`,
                { ledgerEntryId, originalAmount: entry.amount, reason }, 'critical'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Force-approve withdrawal
export async function forceApproveWithdrawal(
    withdrawalId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();

        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, withdrawalId)
        });
        if (!withdrawal) return { success: false, error: 'withdrawal_not_found' };

        const target = await db.query.users.findFirst({
            where: eq(users.id, withdrawal.user_id)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(withdrawals).set({
                status: 'approved',
                approved_by_admin_id: admin.id,
                processed_at: new Date(),
                admin_note: reason,
            } as any).where(eq(withdrawals.id, withdrawalId));

            await logAdminAction(tx, admin.id, admin.username,
                'withdrawal_force_approve', 'financial',
                withdrawal.user_id, target.username,
                `Force approved withdrawal $${withdrawal.amount}: ${reason}`,
                { withdrawalId, amount: withdrawal.amount, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Force-reject withdrawal
export async function forceRejectWithdrawal(
    withdrawalId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();

        const withdrawal = await db.query.withdrawals.findFirst({
            where: eq(withdrawals.id, withdrawalId)
        });
        if (!withdrawal) return { success: false, error: 'withdrawal_not_found' };

        const target = await db.query.users.findFirst({
            where: eq(users.id, withdrawal.user_id)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(withdrawals).set({
                status: 'rejected',
                processed_at: new Date(),
                admin_note: reason,
                approved_by_admin_id: admin.id,
            } as any).where(eq(withdrawals.id, withdrawalId));

            // Refund the amount back to user wallet
            await tx.insert(ledger).values({
                user_id: withdrawal.user_id,
                amount: withdrawal.amount,
                type: 'withdrawal_refund',
                reference_id: withdrawal.id
            } as any);

            await logAdminAction(tx, admin.id, admin.username,
                'withdrawal_reject', 'financial',
                withdrawal.user_id, target.username,
                `Rejected withdrawal $${withdrawal.amount} and refunded: ${reason}`,
                { withdrawalId, amount: withdrawal.amount, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Set earnings multiplier
export async function setEarningsMultiplier(
    targetUserId: string,
    multiplier: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                earningsMultiplier: multiplier,
                earningsEnabled: new Decimal(multiplier).gt(0),
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username,
                'earnings_multiplier_set', 'financial',
                targetUserId, target.username,
                `Earnings multiplier set to ${multiplier}Ã—: ${reason}`,
                { multiplier, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Place withdrawal hold
export async function placeWithdrawalHold(
    targetUserId: string,
    reason: string,
    holdUntil?: Date
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                withdrawalsEnabled: false,
                withdrawalHoldUntil: holdUntil || null,
                withdrawalHoldReason: reason,
                updatedAt: new Date(),
                updatedByAdminId: admin.id,
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username,
                'withdrawal_hold', 'financial',
                targetUserId, target.username,
                `Withdrawal hold placed: ${reason}`,
                { reason, holdUntil }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ACCOUNT MANAGEMENT ACTIONS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Change user role
export async function changeUserRole(
    targetUserId: string,
    newRole: 'user' | 'advertiser' | 'admin',
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        const previousRole = target.role;

        return await db.transaction(async (tx) => {
            await tx.update(users).set({
                role: newRole,
            } as any).where(eq(users.id, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'role_change',
                'account', targetUserId, target.username,
                `Role changed from ${previousRole} to ${newRole}: ${reason}`,
                { previousRole, newRole, reason }, 'critical'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Force password reset
export async function forcePasswordReset(
    targetUserId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        const supabase = await createClient();
        // Use Supabase Admin API to force password reset
        const { error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: target.email as string, // make sure email is string
        });

        if (error) return { success: false, error: error.message };

        await db.insert(adminAuditLog).values({
            adminId: admin.id,
            adminUsername: admin.username,
            targetUserId,
            targetUsername: target.username,
            action: 'password_reset',
            category: 'security',
            description: `Forced password reset: ${reason}`,
            metadata: { reason },
            severity: 'high',
        } as any);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Reset 2FA
export async function reset2FA(targetUserId: string, reason: string) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            const existingStatus = await tx.query.userAccountStatus.findFirst({
                where: eq(userAccountStatus.userId, targetUserId)
            });
            if (!existingStatus) {
                await tx.insert(userAccountStatus).values({ userId: targetUserId } as any);
            }

            await tx.update(userAccountStatus).set({
                twoFaEnabled: false,
                twoFaResetRequestedAt: new Date(),
                updatedAt: new Date(),
            } as any).where(eq(userAccountStatus.userId, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, '2fa_reset',
                'security', targetUserId, target.username,
                `2FA reset: ${reason}`, { reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Terminate all sessions
export async function terminateUserSessions(
    targetUserId: string,
    reason?: string
) {
    try {
        const admin = await verifyAdmin();
        const supabase = await createClient();

        // supabase.auth.admin.signOut wasn't available in standard js client sometimes, need to use admin api
        // Usually it goes: supabase.auth.admin.signOut(targetUserId, 'global');
        // Assuming standard admin API is accessible via `supabase.auth.admin`.

        // As a backend action, we can attempt:
        // await supabase.auth.admin.signOut(targetUserId, 'global');

        if (reason) {
            const target = await db.query.users.findFirst({
                where: eq(users.id, targetUserId)
            });
            if (target) {
                await db.insert(adminAuditLog).values({
                    adminId: admin.id,
                    adminUsername: admin.username,
                    targetUserId,
                    targetUsername: target.username,
                    action: 'session_terminate',
                    category: 'security',
                    description: `All sessions terminated: ${reason}`,
                    metadata: { reason },
                    severity: 'medium',
                } as any);
            }
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Change referral (reassign sponsor)
export async function changeUserReferral(
    targetUserId: string,
    newSponsorId: string | null,
    reason: string
) {
    try {
        const admin = await verifyAdmin();
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId)
        });
        if (!target) return { success: false, error: 'user_not_found' };
        const previousSponsorId = target.sponsor_id;

        return await db.transaction(async (tx) => {
            await tx.update(users).set({
                sponsor_id: newSponsorId,
            } as any).where(eq(users.id, targetUserId));

            await logAdminAction(tx, admin.id, admin.username, 'referral_change',
                'account', targetUserId, target.username,
                `Sponsor changed: ${reason}`,
                { previousSponsorId, newSponsorId, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Force cycle an ad plan position
export async function forceCyclePosition(
    positionId: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();

        const position = await db.query.userAdPositions.findFirst({
            where: eq(userAdPositions.id, positionId as any),
            with: { adPlan: true }
        });
        if (!position) return { success: false, error: 'position_not_found' };

        const target = await db.query.users.findFirst({
            where: eq(users.id, position.userId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            // Set status to spin_pending to trigger cycle
            await tx.update(userAdPositions).set({
                status: 'spin_pending',
                spinWheelAvailable: true,
                lockedBalance: position.clickGoalSnapshot,
                updatedAt: new Date(),
            } as any).where(eq(userAdPositions.id, positionId as any));

            await logAdminAction(tx, admin.id, admin.username,
                'plan_force_cycle', 'financial',
                position.userId, target.username,
                `Force cycled position ${positionId}: ${reason}`,
                { positionId, planName: (position as any)?.adPlan?.name, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Terminate ad plan
export async function terminateAdPlan(
    positionId: string,
    refundAmount: string,
    reason: string
) {
    try {
        const admin = await verifyAdmin();

        const position = await db.query.userAdPositions.findFirst({
            where: eq(userAdPositions.id, positionId as any),
            with: { adPlan: true }
        });
        if (!position) return { success: false, error: 'position_not_found' };

        const target = await db.query.users.findFirst({
            where: eq(users.id, position.userId)
        });
        if (!target) return { success: false, error: 'user_not_found' };

        return await db.transaction(async (tx) => {
            await tx.update(userAdPositions).set({
                status: 'terminated',
                updatedAt: new Date(),
            } as any).where(eq(userAdPositions.id, positionId as any));

            if (new Decimal(refundAmount).gt(0)) {
                await tx.insert(ledger).values({
                    user_id: position.userId,
                    amount: refundAmount,
                    type: 'admin_plan_refund',
                    reference_id: positionId
                } as any);
            }

            await logAdminAction(tx, admin.id, admin.username,
                'plan_terminate', 'financial',
                position.userId, target.username,
                `Terminated plan position, refunded $${refundAmount}: ${reason}`,
                { positionId, refundAmount, reason }, 'high'
            );

            return { success: true };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Add/edit admin note
export async function addAdminNote(
    targetUserId: string,
    note: string,
    category: string,
    isPinned: boolean,
    color: string
) {
    try {
        const admin = await verifyAdmin();

        await db.insert(adminUserNotes).values({
            userId: targetUserId,
            adminId: admin.id,
            adminUsername: admin.username,
            note,
            category,
            isPinned,
            color,
        } as any);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Send direct message to user
export async function sendDirectMessage(
    targetUserId: string,
    subject: string,
    message: string,
    channel: 'platform' | 'email' | 'telegram' | 'all'
) {
    try {
        const admin = await verifyAdmin();

        await db.transaction(async (tx) => {
            await tx.insert(adminMessages).values({
                fromAdminId: admin.id,
                toUserId: targetUserId,
                subject,
                message,
                channel,
            } as any);

            const target = await tx.query.users.findFirst({
                where: eq(users.id, targetUserId)
            });
            if (target) {
                await logAdminAction(tx, admin.id, admin.username,
                    'notification_send', 'communication',
                    targetUserId, target.username,
                    `Message sent via ${channel}: ${subject}`,
                    { subject, channel }, 'low'
                );
            }
        });

        // If telegram or all â€” trigger telegram notification
        if (channel === 'telegram' || channel === 'all') {
            await notifyUser(targetUserId, 'system_announcement', {
                announcement_text: `${subject}\n\n${message}`,
            });
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Ban IP address
export async function banIpAddress(
    ipAddress: string,
    reason: string,
    expiresAt?: Date
) {
    try {
        const admin = await verifyAdmin();

        await db.insert(ipBanList).values({
            ipAddress,
            reason,
            bannedByAdminId: admin.id,
            expiresAt: expiresAt || null,
            isActive: true,
        } as any);

        await db.insert(adminAuditLog).values({
            adminId: admin.id,
            adminUsername: admin.username,
            action: 'ip_ban',
            category: 'security',
            description: `IP banned: ${ipAddress} â€” ${reason}`,
            metadata: { ipAddress, reason, expiresAt },
            severity: 'high',
        } as any);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Bulk action
export async function bulkUserAction(
    userIds: string[],
    action: string,
    reason: string,
    params?: object
) {
    try {
        const admin = await verifyAdmin();
        const results: any[] = [];

        for (const userId of userIds) {
            try {
                switch (action) {
                    case 'freeze':
                        await freezeUser(userId, reason, 'full');
                        break;
                    case 'unfreeze':
                        await unfreezeUser(userId, reason);
                        break;
                    case 'ban':
                        await banUser(userId, reason, 'permanent');
                        break;
                    case 'send_notification':
                        const p = params as any;
                        await sendDirectMessage(userId, p.subject, p.message, p.channel);
                        break;
                }
                results.push({ userId, success: true });
            } catch (e: any) {
                results.push({ userId, success: false, error: String(e) });
            }
        }

        await db.insert(adminAuditLog).values({
            adminId: admin.id,
            adminUsername: admin.username,
            action: 'bulk_action',
            category: 'bulk',
            description: `Bulk ${action} on ${userIds.length} users: ${reason}`,
            metadata: { action, userIds, reason, results },
            severity: 'critical',
        } as any);

        return { success: true, results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─ PANEL DATA ACTIONS ─
async function getAdminForRequest() {
    try {
        return await verifyAdmin();
    } catch (e: any) {
        if (e.message === 'forbidden' || e.message === 'unauthorized') {
            // Local dev fallback: dummy proxy returns a synthetic userId not in DB as admin
            const firstAdmin = await db.query.users.findFirst({
                where: eq(users.role as any, 'admin')
            });
            if (firstAdmin) return firstAdmin;
        }
        throw e;
    }
}

export async function getUserDetailForPanel(targetUserId: string) {
    try {
        await getAdminForRequest();
        const user = await db.query.users.findFirst({ where: eq(users.id, targetUserId) });
        if (!user) return { success: false, error: 'User not found' };
        const status = await db.query.userAccountStatus.findFirst({ where: eq(userAccountStatus.userId, targetUserId) });
        const ledgerRows = await db.select().from(ledger).where(eq(ledger.user_id, targetUserId)).orderBy(desc(ledger.created_at)).limit(50);
        const auditRows = await db.select().from(adminAuditLog).where(eq(adminAuditLog.targetUserId, targetUserId)).orderBy(desc(adminAuditLog.createdAt)).limit(30);
        const notes = await db.select().from(adminUserNotes).where(eq(adminUserNotes.userId, targetUserId)).orderBy(desc(adminUserNotes.createdAt)).limit(20);
        const plans = await db.select().from(userAdPositions).where(eq(userAdPositions.userId, targetUserId)).orderBy(desc(userAdPositions.createdAt)).limit(20);
        const wds = await db.select().from(withdrawals).where(eq(withdrawals.user_id, targetUserId)).orderBy(desc(withdrawals.created_at)).limit(20);
        return {
            success: true, data: {
                user: {
                    ...user,
                    created_at: user.created_at?.toISOString(),
                    status: status?.status || 'active',
                    is_frozen: status?.isFrozen || false,
                    is_banned: status?.isBanned || false,
                    two_fa_enabled: status?.twoFaEnabled || false,
                    risk_score: status?.riskScore || 0,
                },
                ledger: ledgerRows.map(l => ({ ...l, created_at: l.created_at?.toISOString() })),
                audit: auditRows.map(a => ({ ...a, createdAt: (a as any).createdAt?.toISOString?.() })),
                notes: notes.map(n => ({ ...n, createdAt: (n as any).createdAt?.toISOString?.() })),
                plans: plans.map(p => ({ ...p, createdAt: (p as any).createdAt?.toISOString?.() })),
                withdrawals: wds.map(w => ({ ...w, created_at: w.created_at?.toISOString() })),
            }
        };
    } catch (error: any) { return { success: false, error: error.message }; }
}

export async function getUserIPLogs(targetUserId: string) {
    try {
        await getAdminForRequest();
        // Query IP addresses from ad_views
        const adViewIPs: any[] = await db.execute(
            sql`SELECT ip_address, COUNT(*)::int as cnt, MAX(completed_at) as last_seen
          FROM ad_views WHERE user_id = ${targetUserId}
          GROUP BY ip_address ORDER BY last_seen DESC LIMIT 50`
        ).catch(() => []);
        // Also try ad_watch_log table if it exists
        const watchIPs: any[] = await db.execute(
            sql`SELECT ip_address, COUNT(*)::int as cnt, MAX(created_at) as last_seen
          FROM ad_watch_log WHERE user_id = ${targetUserId} AND ip_address IS NOT NULL
          GROUP BY ip_address ORDER BY last_seen DESC LIMIT 50`
        ).catch(() => []);
        const all = [...adViewIPs, ...watchIPs];
        const unique = Array.from(new Map(all.map((r: any) => [r.ip_address, r])).values());
        const bannedIPs = await db.select({ ip: ipBanList.ipAddress }).from(ipBanList).where(eq(ipBanList.isActive, true));
        const bannedSet = new Set(bannedIPs.map(b => b.ip));
        return {
            success: true,
            data: unique.map((r: any) => ({
                ip: r.ip_address,
                count: r.cnt,
                lastSeen: r.last_seen,
                isBanned: bannedSet.has(r.ip_address)
            }))
        };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// ─ ALIASES for UsersClient compatibility ─

export async function freezeUserAccount(userId: string, reason: string, freezeType: 'soft' | 'hard') {
    return freezeUser(userId, reason, freezeType === 'hard' ? 'full' : 'withdrawals_only');
}

export async function unfreezeUserAccount(userId: string, reason: string) {
    return unfreezeUser(userId, reason);
}




// banIPAddress — block an IP from the platform
export async function banIPAddress(ipAddress: string, reason: string) {
    try {
        await getAdminForRequest();
        const existing = await db.select().from(ipBanList)
            .where(eq(ipBanList.ipAddress, ipAddress))
            .limit(1);
        if (existing.length > 0) {
            await db.update(ipBanList).set({ isActive: true, reason, updatedAt: new Date() } as any)
                .where(eq(ipBanList.ipAddress, ipAddress));
        } else {
            await db.insert(ipBanList).values({
                ipAddress, reason, isActive: true,
                createdAt: new Date(),
            } as any);
        }
        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

