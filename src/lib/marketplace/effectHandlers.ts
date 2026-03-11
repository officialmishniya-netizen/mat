import Decimal from 'decimal.js';
import { db } from '../db';
import { createLedgerEntry } from '../ledger';
import {
    marketplaceItems, marketplacePurchases, userInventory,
    userAdPositions, communityPool, adPlans
} from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MASTER EFFECT DISPATCHER
// Called after every successful purchase
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function applyItemEffect(
    tx: any,
    userId: string,
    purchaseId: string,
    item: typeof marketplaceItems.$inferSelect,
    positionId?: string
): Promise<{ success: boolean; error?: string; result?: any }> {

    const meta = item.effectMetadata as any;

    switch (item.itemType) {
        case 'watch_booster':
            return applyWatchBooster(tx, userId, purchaseId, item, positionId, meta);
        case 'cycle_accelerator':
            return applyCycleAccelerator(tx, userId, purchaseId, item, positionId, meta);
        case 'pool_ticket':
            return applyPoolTicket(tx, userId, purchaseId, item, meta);
        case 'surprise_box':
            return applySurpriseBox(tx, userId, purchaseId, item, meta);
        case 'spin_token':
            return applySpinToken(tx, userId, purchaseId, item, positionId, meta);
        case 'ad_point_bundle':
            return applyAdPointBundle(tx, userId, purchaseId, item, meta);
        case 'balance_bundle':
            return applyBalanceBundle(tx, userId, purchaseId, item, meta);
        case 'plan_upgrade_credit':
            return applyPlanUpgradeCredit(tx, userId, purchaseId, item, meta);
        case 'profile_cosmetic':
            return applyProfileCosmetic(tx, userId, purchaseId, item, meta);
        case 'referral_tool':
            return applyReferralTool(tx, userId, purchaseId, item, meta);
        case 'custom':
            return applyCustomEffect(tx, userId, purchaseId, item, meta);
        default:
            return { success: false, error: `unknown_item_type: ${item.itemType}` };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: WATCH BOOSTER
// Adds extra ads/day to a specific position for N days
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyWatchBooster(
    tx: any, userId: string, purchaseId: string,
    item: any, positionId: string | undefined, meta: any
) {
    if (!positionId) return { success: false, error: 'position_required_for_booster' };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (meta.durationDays || 0));

    // Insert into user inventory
    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'watch_booster',
        extraAdsPerDay: meta.extraAdsPerDay,
        positionId,
        status: 'active',
        expiresAt,
    });

    // Recalculate total boosted ads for position
    await recalculatePositionBoosts(tx, positionId);

    return {
        success: true,
        result: {
            extraAdsPerDay: meta.extraAdsPerDay,
            expiresAt,
            message: `+${meta.extraAdsPerDay} ads/day for ${meta.durationDays} days`
        }
    };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: CYCLE ACCELERATOR
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyCycleAccelerator(
    tx: any, userId: string, purchaseId: string,
    item: any, positionId: string | undefined, meta: any
) {
    if (!positionId) return { success: false, error: 'position_required' };

    const position = await tx.query.userAdPositions.findFirst({
        where: eq(userAdPositions.id, positionId)
    });
    if (!position) return { success: false, error: 'position_not_found' };

    switch (meta.type) {
        case 'goal_reduction_pct': {
            // Reduce remaining click goal by X%
            const remaining = new Decimal(position.clickGoalSnapshot)
                .minus(position.lockedBalance || 0);
            const reduction = remaining.times(meta.value).div(100);
            const newGoal = new Decimal(position.clickGoalSnapshot).minus(reduction);

            await tx.update(userAdPositions)
                .set({ clickGoalSnapshot: newGoal.toFixed(2) })
                .where(eq(userAdPositions.id, positionId));

            return { success: true, result: { goalReduced: reduction.toFixed(2) } };
        }
        case 'double_day': {
            // Double per-click value for 24 hours
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await tx.insert(userInventory).values({
                userId, itemId: item.id, purchaseId,
                itemType: 'cycle_accelerator',
                positionId, status: 'active', expiresAt,
            });
            return { success: true, result: { effect: 'double_day', expiresAt } };
        }
        case 'flash_cycle_pct': {
            // Instantly credit X% of cycle payout to locked balance
            const plan = await tx.query.adPlans.findFirst({
                where: eq(adPlans.id, position.adPlanId)
            });
            if (!plan) return { success: false, error: 'plan_not_found' };

            const flashAmount = new Decimal(plan.cyclePayout)
                .times(meta.value).div(100);
            const newLocked = new Decimal(position.lockedBalance || 0).plus(flashAmount);

            await tx.update(userAdPositions)
                .set({ lockedBalance: newLocked.toFixed(4) })
                .where(eq(userAdPositions.id, positionId));

            return { success: true, result: { flashAmount: flashAmount.toFixed(2) } };
        }
        default:
            return { success: false, error: 'unknown_accelerator_type' };
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: SURPRISE BOX
// Weighted random reward reveal
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applySurpriseBox(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    // Weighted random selection
    const rewards = meta.rewards as Array<{
        type: string; value: number; probability: number;
        boosterItemId?: string;
    }>;

    if (!rewards || rewards.length === 0) return { success: false, error: 'no_rewards_defined' };

    const total = rewards.reduce((s, r) => s + r.probability, 0);
    let rand = Math.random() * total;
    let selected = rewards[rewards.length - 1];
    for (const reward of rewards) {
        rand -= reward.probability;
        if (rand <= 0) { selected = reward; break; }
    }

    // Apply the reward
    let result: any = { type: selected.type, value: selected.value };

    if (selected.type === 'balance') {
        await createLedgerEntry(
            userId,
            selected.value.toFixed(2),
            'surprise_box_reward',
            purchaseId
        );
    } else if (selected.type === 'watch_booster' && selected.boosterItemId) {
        const boosterItem = await tx.query.marketplaceItems.findFirst({
            where: eq(marketplaceItems.id, selected.boosterItemId)
        });
        if (boosterItem) {
            await applyWatchBooster(tx, userId, purchaseId, boosterItem,
                undefined, boosterItem.effectMetadata);
        }
    }

    // Store result on purchase record
    await tx.update(marketplacePurchases)
        .set({ surpriseBoxResult: result })
        .where(eq(marketplacePurchases.id, purchaseId));

    return { success: true, result };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: SPIN TOKEN
// Adds extra spin wheel tokens to inventory
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applySpinToken(
    tx: any, userId: string, purchaseId: string,
    item: any, positionId: string | undefined, meta: any
) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (meta.expiryDays || 30));

    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'spin_token',
        spinsRemaining: meta.tokens,
        positionId,
        status: 'active',
        expiresAt,
    });

    return { success: true, result: { spinsAdded: meta.tokens, expiresAt } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: AD POINT BUNDLE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyAdPointBundle(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    await createLedgerEntry(
        userId,
        String(meta.apAmount),
        'ad_point_bonus',
        purchaseId
    );

    return { success: true, result: { apAdded: meta.apAmount } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: BALANCE BUNDLE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyBalanceBundle(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    await createLedgerEntry(
        userId,
        new Decimal(meta.amount).toFixed(2),
        'balance_bundle_credit',
        purchaseId
    );

    return { success: true, result: { balanceAdded: meta.amount } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: PLAN UPGRADE CREDIT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyPlanUpgradeCredit(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'plan_upgrade_credit',
        status: 'active',
    });

    return {
        success: true,
        result: {
            creditAmount: meta.creditAmount,
            applicablePlans: meta.applicablePlanIds,
        }
    };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: PROFILE COSMETIC
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyProfileCosmetic(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'profile_cosmetic',
        assetUrl: meta.assetUrl,
        assetId: meta.assetId,
        status: 'active',
        isEquipped: false,
    });

    return { success: true, result: { assetId: meta.assetId, type: meta.type } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: REFERRAL TOOL
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyReferralTool(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    const bonusLinkCode = meta.type === 'bonus_link'
        ? `${userId.slice(0, 8)}-bonus-${Date.now()}`
        : null;

    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'referral_tool',
        bonusLinkCode,
        bonusPct: meta.bonusPct || null,
        status: 'active',
    });

    return { success: true, result: { bonusLinkCode, type: meta.type } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: POOL TICKET
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyPoolTicket(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    await tx.insert(userInventory).values({
        userId, itemId: item.id, purchaseId,
        itemType: 'pool_ticket',
        status: 'active',
    });
    return { success: true, result: { entries: meta.entries, bucket: meta.bucket } };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// EFFECT: CUSTOM (extensible)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function applyCustomEffect(
    tx: any, userId: string, purchaseId: string,
    item: any, meta: any
) {
    const customHandlers: Record<string, Function> = {
        // 'my_custom_effect': myCustomHandler,
    };

    const handler = customHandlers[meta.handlerKey];
    if (!handler) return { success: false, error: `no_handler_for: ${meta.handlerKey}` };
    return handler(tx, userId, purchaseId, item, meta.params);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HELPER: Recalculate boost total for a position
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function recalculatePositionBoosts(tx: any, positionId: string) {
    const now = new Date();
    const activeBoosters = await tx.query.userInventory.findMany({
        where: and(
            eq(userInventory.positionId, positionId),
            eq(userInventory.itemType, 'watch_booster'),
            eq(userInventory.status, 'active'),
            gte(userInventory.expiresAt, now)
        )
    });

    const totalBoost = activeBoosters.reduce(
        (sum: number, b: any) => sum + (b.extraAdsPerDay || 0), 0
    );

    await tx.update(userAdPositions)
        .set({ boostedAdsPerDay: totalBoost, updatedAt: new Date() })
        .where(eq(userAdPositions.id, positionId));
}
