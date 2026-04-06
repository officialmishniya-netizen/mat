'use server';

import { db } from '@/lib/db';
import {
    fraudWhitelist,
    vpnIpRanges,
    userAccountStatus,
    users
} from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';
import { logAdminAction } from '@/lib/fraud';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthorized');

    const admin = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });
    if (admin?.role !== 'admin') throw new Error('unauthorized_admin');
    return admin;
}

/**
 * Whitelist an IP address or User ID
 */
export async function whitelistAction(type: 'ip' | 'user', value: string, reason: string) {
    try {
        const admin = await checkAdmin();

        await db.insert(fraudWhitelist).values({
            type,
            value,
            reason,
            approvedByAdminId: admin.id,
            approvedByUsername: admin.username,
            isActive: true
        });

        await logAdminAction({
            adminId: admin.id,
            adminUsername: admin.username,
            action: 'fraud_whitelist_add',
            category: 'security',
            description: `Added ${type} ${value} to whitelist: ${reason}`,
            metadata: { type, value, reason }
        });

        revalidatePath('/admin/fraud');
        return { success: true };
    } catch (err: any) {
        console.error('whitelistAction error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Ban all users associated with a specific IP (Duplicate IP Detector)
 */
export async function banUsersByIpAction(ip: string, reason: string) {
    try {
        const admin = await checkAdmin();

        // Find all users who have used this IP
        // Note: In a real system, we'd query a user_ips table. 
        // Here we'll search userAccountStatus which stores last_ip or similar, 
        // or we assume the caller provides the list of IDs.
        // For simplicity, let's assume we update statuses based on IP logic.

        // This is a placeholder for the actual bulk update logic.
        // In this architecture, we should probably call banUser from adminUserManagement
        // for each user, but for bulk from fraud center, we do a direct update.

        // Example: Update all users with this ip in metadata or some status field
        // Since schema doesn't have a direct "last_ip" in users, we'd need to join.
        // For now, let's implement the action to be called WITH user IDs.

        return { success: false, error: 'User IDs required for bulk ban' };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Bulk action on user IDs (Ban/Freeze/KYC)
 */
export async function bulkFraudAction(userIds: string[], action: 'ban' | 'freeze' | 'kyc' | 'unfreeze', reason: string) {
    try {
        const admin = await checkAdmin();
        if (!userIds.length) return { success: false, error: 'No users selected' };

        await db.transaction(async (tx) => {
            for (const uid of userIds) {
                const status = await tx.query.userAccountStatus.findFirst({
                    where: eq(userAccountStatus.userId, uid)
                });

                if (!status) {
                    await tx.insert(userAccountStatus).values({ userId: uid } as any);
                }

                const updates: any = {
                    updatedAt: new Date(),
                    updatedByAdminId: admin.id,
                };

                if (action === 'ban') {
                    updates.isBanned = true;
                    updates.status = 'banned';
                    updates.banReason = reason;
                    updates.bannedAt = new Date();
                    updates.bannedByAdminId = admin.id;
                } else if (action === 'freeze') {
                    updates.isFrozen = true;
                    updates.status = 'frozen';
                    updates.frozenReason = reason;
                    updates.frozenAt = new Date();
                    updates.frozenByAdminId = admin.id;
                } else if (action === 'kyc') {
                    updates.kycRequired = true;
                    updates.kycReason = reason;
                } else if (action === 'unfreeze') {
                    updates.isFrozen = false;
                    updates.isBanned = false;
                    updates.status = 'active';
                }

                await tx.update(userAccountStatus)
                    .set(updates)
                    .where(eq(userAccountStatus.userId, uid));
            }

            await logAdminAction({
                adminId: admin.id,
                adminUsername: admin.username,
                action: `bulk_fraud_${action}`,
                category: 'security',
                description: `${action} applied to ${userIds.length} users: ${reason}`,
                metadata: { userIds, action, reason }
            });
        });

        revalidatePath('/admin/fraud');
        return { success: true };
    } catch (err: any) {
        console.error('bulkFraudAction error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * VPN Range Management
 */
export async function addVpnRangeAction(cidr: string, provider: string, type: string = 'vpn') {
    try {
        const admin = await checkAdmin();
        await db.insert(vpnIpRanges).values({
            cidr,
            providerName: provider,
            rangeType: type,
            addedByAdminId: admin.id,
            isActive: true
        });
        revalidatePath('/admin/fraud/vpn-detector');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function removeVpnRangeAction(id: string) {
    try {
        await checkAdmin();
        await db.delete(vpnIpRanges).where(eq(vpnIpRanges.id, id));
        revalidatePath('/admin/fraud/vpn-detector');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
