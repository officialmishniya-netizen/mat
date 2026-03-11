'use server';
import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';
import { db } from '@/lib/db';
import { createLedgerEntry } from '@/lib/ledger';
import { applyItemEffect } from '@/lib/marketplace/effectHandlers';
import { executeSpin } from '@/lib/spinWheel';
import {
    marketplaceItems, marketplacePurchases, discountCodes,
    discountCodeUsages, flashSaleEvents,
    userAdPositions, marketplaceCategories
} from '@/lib/db/schema';
import { eq, and, lte, gte, isNull, or } from 'drizzle-orm';
import Decimal from 'decimal.js';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PURCHASE ITEM
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function purchaseMarketplaceItem(
    itemId: string,
    positionId?: string,
    discountCode?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'unauthorized' };

    try {
        return await db.transaction(async (tx) => {
            // 1. Fetch item
            const item = await tx.query.marketplaceItems.findFirst({
                where: and(
                    eq(marketplaceItems.id, itemId),
                    eq(marketplaceItems.isActive, true)
                )
            });
            if (!item) return { success: false, error: 'item_not_found' };

            // 2. Check availability window
            const now = new Date();
            if (item.availableFrom && now < item.availableFrom)
                return { success: false, error: 'item_not_available_yet' };
            if (item.availableUntil && now > item.availableUntil)
                return { success: false, error: 'item_no_longer_available' };

            // 3. Check stock
            if (item.stockRemaining !== null && item.stockRemaining <= 0)
                return { success: false, error: 'out_of_stock' };

            // 4. Check per-user purchase limit
            if (item.maxPerUser) {
                const existingCount = await getPurchaseCount(
                    tx, user.id, itemId, item.maxPerUserPeriod
                );
                if (existingCount >= item.maxPerUser)
                    return { success: false, error: 'purchase_limit_reached' };
            }

            // 5. Check purchase requirements
            const requirementCheck = await checkPurchaseRequirements(tx, user.id, item);
            if (!requirementCheck.pass)
                return { success: false, error: requirementCheck.reason };

            // 6. Calculate final price (flash sale + discount code)
            let finalPrice = new Decimal(item.price);

            // Apply active flash sale
            const flashSale = await getActiveFlashSale(tx, itemId, item.categoryId);
            if (flashSale) {
                const discount = finalPrice.times(new Decimal(flashSale.discountPct).div(100));
                finalPrice = finalPrice.minus(discount);
            }

            // Apply discount code
            let discountApplied = new Decimal(0);
            let codeRecord: any = null;
            if (discountCode) {
                const codeResult = await validateAndApplyCode(
                    user.id, discountCode, itemId, item.categoryId, finalPrice
                );
                if (codeResult.valid) {
                    discountApplied = codeResult.discount;
                    finalPrice = finalPrice.minus(discountApplied);
                    codeRecord = codeResult.code;
                }
            }

            finalPrice = Decimal.max(finalPrice, new Decimal(0));

            // 7. Debit wallet via ledger
            const ledgerId = await createLedgerEntry(
                user.id,
                `-${finalPrice.toFixed(2)}`,
                'marketplace_purchase',
                itemId
            );

            if (!ledgerId) {
                throw new Error('insufficient_funds_or_ledger_error');
            }

            // 8. Create purchase record
            const [purchase] = await tx.insert(marketplacePurchases).values({
                userId: user.id,
                itemId,
                positionId: positionId || null,
                pricePaid: finalPrice.toFixed(2),
                status: 'active',
                effectApplied: false,
                effectMetadataSnapshot: item.effectMetadata,
                ledgerEntryId: ledgerId,
            }).returning();

            // 9. Apply effect
            const effectResult = await applyItemEffect(
                tx, user.id, purchase.id, item, positionId
            );
            if (!effectResult.success) {
                throw new Error(effectResult.error); // rollback transaction
            }

            // 10. Mark effect applied
            await tx.update(marketplacePurchases).set({
                effectApplied: true,
                effectAppliedAt: new Date(),
                status: 'active',
            }).where(eq(marketplacePurchases.id, purchase.id));

            // 11. Update stock and stats
            await tx.update(marketplaceItems).set({
                stockRemaining: item.stockRemaining !== null ? item.stockRemaining - 1 : null,
                totalPurchases: item.totalPurchases + 1,
                totalRevenue: new Decimal(item.totalRevenue || 0)
                    .plus(finalPrice).toFixed(2),
            }).where(eq(marketplaceItems.id, itemId));

            // 12. Record discount code usage
            if (codeRecord && discountApplied.gt(0)) {
                await tx.insert(discountCodeUsages).values({
                    codeId: codeRecord.id,
                    userId: user.id,
                    purchaseId: purchase.id,
                    discountApplied: discountApplied.toFixed(2),
                });
                await tx.update(discountCodes).set({
                    usedCount: (codeRecord.usedCount || 0) + 1
                }).where(eq(discountCodes.id, codeRecord.id));
            }

            return {
                success: true,
                data: {
                    purchaseId: purchase.id,
                    finalPrice: finalPrice.toFixed(2),
                    effectResult: effectResult.result,
                    surpriseBoxResult: purchase.surpriseBoxResult,
                }
            };
        });
    } catch (err: any) {
        console.error('Purchase error:', err);
        return { success: false, error: err.message || 'purchase_failed' };
    }
}

/**
 * Wrapper for the UI-expected action name
 */
export async function buyMarketplaceItemAction(itemId: string, positionId?: string) {
    return await purchaseMarketplaceItem(itemId, positionId);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SPIN WHEEL ACTION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function spinWheelAction(configId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'unauthorized' };

    try {
        const result = await executeSpin(user.id, configId);
        return result;
    } catch (err: any) {
        console.error('Spin error:', err);
        return { success: false, error: err.message || 'spin_failed' };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET MARKETPLACE (for user frontend)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getMarketplaceData() {
    const now = new Date();

    try {
        const [categories, items, activeSales] = await Promise.all([
            db.query.marketplaceCategories.findMany({
                where: and(
                    eq(marketplaceCategories.isActive, true),
                    eq(marketplaceCategories.isVisible, true)
                ),
                orderBy: marketplaceCategories.sortOrder,
            }),
            db.query.marketplaceItems.findMany({
                where: and(
                    eq(marketplaceItems.isActive, true),
                    eq(marketplaceItems.isVisible, true),
                    or(
                        isNull(marketplaceItems.availableFrom),
                        lte(marketplaceItems.availableFrom, now)
                    ),
                    or(
                        isNull(marketplaceItems.availableUntil),
                        gte(marketplaceItems.availableUntil, now)
                    )
                ),
                orderBy: [marketplaceItems.sortOrder],
            }),
            db.query.flashSaleEvents.findMany({
                where: and(
                    eq(flashSaleEvents.isActive, true),
                    lte(flashSaleEvents.startsAt, now),
                    gte(flashSaleEvents.endsAt, now)
                )
            })
        ]);

        // Apply flash sale prices locally for UI
        const itemsWithPrices = items.map(item => {
            const sale = activeSales.find(s => {
                const itemIds = s.applicableItemIds as string[] | null;
                const catIds = s.applicableCategoryIds as string[] | null;
                return (!itemIds || itemIds.includes(item.id)) &&
                    (!catIds || catIds.includes(item.categoryId));
            });

            if (sale) {
                const original = new Decimal(item.price);
                const discounted = original.minus(
                    original.times(new Decimal(sale.discountPct).div(100))
                );
                return {
                    ...item,
                    salePrice: discounted.toFixed(2),
                    saleDiscountPct: sale.discountPct,
                    saleName: sale.name,
                    saleBanner: sale.bannerText,
                    saleEndsAt: sale.endsAt,
                };
            }
            return item;
        });

        return {
            success: true,
            data: {
                categories,
                items: itemsWithPrices,
                activeSales,
            }
        };
    } catch (err) {
        console.error('getMarketplaceData error:', err);
        return { success: false, error: 'fetch_failed' };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VALIDATE DISCOUNT CODE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function validateDiscountCode(
    code: string, itemId: string, userId: string
) {
    const codeRecord = await db.query.discountCodes.findFirst({
        where: and(
            eq(discountCodes.code, code.toUpperCase()),
            eq(discountCodes.isActive, true)
        )
    });

    if (!codeRecord) return { valid: false, error: 'invalid_code' };

    const now = new Date();
    if (codeRecord.validFrom && now < codeRecord.validFrom)
        return { valid: false, error: 'code_not_active_yet' };
    if (codeRecord.validUntil && now > codeRecord.validUntil)
        return { valid: false, error: 'code_expired' };
    if (codeRecord.maxUses && codeRecord.usedCount >= codeRecord.maxUses)
        return { valid: false, error: 'code_exhausted' };

    // Check per-user usage
    const usages = await db.query.discountCodeUsages.findMany({
        where: and(
            eq(discountCodeUsages.codeId, codeRecord.id),
            eq(discountCodeUsages.userId, userId)
        )
    });
    if (codeRecord.maxUsesPerUser &&
        usages.length >= codeRecord.maxUsesPerUser)
        return { valid: false, error: 'already_used_max_times' };

    return { valid: true, code: codeRecord };
}

// â”€â”€ INTERNAL HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function getActiveFlashSale(tx: any, itemId: string, categoryId: string) {
    const now = new Date();
    const sales = await tx.query.flashSaleEvents.findMany({
        where: and(
            eq(flashSaleEvents.isActive, true),
            lte(flashSaleEvents.startsAt, now),
            gte(flashSaleEvents.endsAt, now)
        )
    });
    return sales.find((s: any) => {
        const itemIds = s.applicableItemIds as string[] | null;
        const catIds = s.applicableCategoryIds as string[] | null;
        return (!itemIds || itemIds.includes(itemId)) &&
            (!catIds || catIds.includes(categoryId));
    }) || null;
}

async function validateAndApplyCode(
    userId: string, code: string,
    itemId: string, categoryId: string, price: Decimal
) {
    const result = await validateDiscountCode(code, itemId, userId);
    if (!result.valid || !result.code)
        return { valid: false, discount: new Decimal(0), code: null };

    const codeRecord = result.code;
    const itemIds = codeRecord.applicableItemIds as string[] | null;
    const catIds = codeRecord.applicableCategoryIds as string[] | null;

    if (itemIds && !itemIds.includes(itemId))
        return { valid: false, discount: new Decimal(0), code: null };
    if (catIds && !catIds.includes(categoryId))
        return { valid: false, discount: new Decimal(0), code: null };

    let discount = new Decimal(0);
    if (codeRecord.discountType === 'pct') {
        discount = price.times(new Decimal(codeRecord.discountValue).div(100));
    } else {
        discount = new Decimal(codeRecord.discountValue);
    }

    return { valid: true, discount, code: codeRecord };
}

async function getPurchaseCount(
    tx: any, userId: string, itemId: string, period: string | null
): Promise<number> {
    const purchases = await tx.query.marketplacePurchases.findMany({
        where: and(
            eq(marketplacePurchases.userId, userId),
            eq(marketplacePurchases.itemId, itemId)
        )
    });

    if (!period || period === 'lifetime') return purchases.length;

    const cutoff = new Date();
    if (period === 'day') cutoff.setDate(cutoff.getDate() - 1);
    else if (period === 'week') cutoff.setDate(cutoff.getDate() - 7);
    else if (period === 'month') cutoff.setMonth(cutoff.getMonth() - 1);

    return purchases.filter((p: any) =>
        new Date(p.purchasedAt) >= cutoff
    ).length;
}

async function checkPurchaseRequirements(
    tx: any, userId: string, item: any
): Promise<{ pass: boolean; reason?: string }> {
    if (!item.requiresActivePlan) return { pass: true };

    const activePosition = await tx.query.userAdPositions.findFirst({
        where: and(
            eq(userAdPositions.userId, userId),
            eq(userAdPositions.status, 'active')
        )
    });

    if (!activePosition) return { pass: false, reason: 'requires_active_plan' };

    const requiredPlanIds = item.requiredPlanIds as string[] | null;
    if (requiredPlanIds && requiredPlanIds.length > 0 &&
        !requiredPlanIds.includes(activePosition.adPlanId)) {
        return { pass: false, reason: 'plan_not_eligible' };
    }

    return { pass: true };
}
