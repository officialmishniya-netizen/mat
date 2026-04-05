'use server';

import { db } from '@/lib/db';
import {
    marketplaceCategories,
    marketplaceItems,
    flashSaleEvents,
    discountCodes,
    marketplaceLayout,
    users
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('unauthorized');

    const admin = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });
    if (admin?.role !== 'admin') throw new Error('unauthorized_admin');
    return user.id;
}

// ─────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────
export async function upsertCategory(data: any) {
    try {
        await checkAdmin();
        const { id, ...values } = data;
        if (id) {
            await db.update(marketplaceCategories)
                .set({ ...values, updatedAt: new Date() })
                .where(eq(marketplaceCategories.id, id));
        } else {
            await db.insert(marketplaceCategories).values(values);
        }
        revalidatePath('/admin/marketplace');
        return { success: true };
    } catch (err: any) {
        console.error('upsertCategory error:', err);
        return { success: false, error: err.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        await checkAdmin();
        await db.delete(marketplaceCategories).where(eq(marketplaceCategories.id, id));
        revalidatePath('/admin/marketplace');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────────────────
export async function upsertMarketplaceItem(data: any) {
    try {
        const adminId = await checkAdmin();
        const { id, ...values } = data;
        if (id) {
            await db.update(marketplaceItems)
                .set({ ...values, updatedAt: new Date() })
                .where(eq(marketplaceItems.id, id));
        } else {
            await db.insert(marketplaceItems).values({ ...values, createdByAdminId: adminId });
        }
        revalidatePath('/admin/marketplace');
        revalidatePath('/dashboard/marketplace');
        return { success: true };
    } catch (err: any) {
        console.error('upsertItem error:', err);
        return { success: false, error: err.message };
    }
}

export async function deleteMarketplaceItem(id: string) {
    try {
        await checkAdmin();
        await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));
        revalidatePath('/admin/marketplace');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────
// FLASH SALES
// ─────────────────────────────────────────────────────────
export async function upsertFlashSale(data: any) {
    try {
        await checkAdmin();
        const { id, ...values } = data;
        if (id) {
            await db.update(flashSaleEvents)
                .set({ ...values })
                .where(eq(flashSaleEvents.id, id));
        } else {
            await db.insert(flashSaleEvents).values(values);
        }
        revalidatePath('/admin/marketplace');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────
// DISCOUNT CODES
// ─────────────────────────────────────────────────────────
export async function upsertDiscountCode(data: any) {
    try {
        await checkAdmin();
        const { id, ...values } = data;
        if (id) {
            await db.update(discountCodes)
                .set({ ...values })
                .where(eq(discountCodes.id, id));
        } else {
            await db.insert(discountCodes).values(values);
        }
        revalidatePath('/admin/marketplace');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────
export async function updateMarketplaceLayout(sections: any[]) {
    try {
        await checkAdmin();
        for (const section of sections) {
            const { id, ...values } = section;
            if (id) {
                await db.update(marketplaceLayout)
                    .set({ ...values, updatedAt: new Date() })
                    .where(eq(marketplaceLayout.id, id));
            } else {
                await db.insert(marketplaceLayout).values(values);
            }
        }
        revalidatePath('/admin/marketplace');
        revalidatePath('/dashboard/marketplace');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
