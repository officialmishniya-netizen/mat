import { db } from './db';
import {
    spinWheelConfigs, spinWheelSlices, spinWheelResults,
    userAdPositions, userInventory, users
} from './db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import Decimal from 'decimal.js';
import { createLedgerEntry, getUserBalance } from './ledger';
import { createNotification } from './notifications';

export type SpinResult = {
    success: boolean;
    error?: string;
    slice?: any;
    isFree?: boolean;
    pricePaid?: string;
};

/**
 * Executes a spin on the wheel for a given user.
 * Logic:
 * 1. Check for free spins (from positions or inventory)
 * 2. If no free spins, check balance and deduct base price
 * 3. Weighted random selection of slice
 * 4. Apply reward
 * 5. Log results
 */
export async function executeSpin(userId: string, configId: string): Promise<SpinResult> {
    return await db.transaction(async (tx) => {
        // 1. Get Config & Active Slices
        const config = await tx.query.spinWheelConfigs.findFirst({
            where: eq(spinWheelConfigs.id, configId)
        });
        if (!config || !config.isActive) return { success: false, error: 'Wheel not active' };

        const slices = await tx.query.spinWheelSlices.findMany({
            where: eq(spinWheelSlices.configId, configId)
        });
        if (slices.length === 0) return { success: false, error: 'No slices configured' };

        // 2. Check for free spins
        let isFree = false;
        let pricePaid = "0.00";
        let source: 'position' | 'inventory' | 'paid' = 'paid';

        // Check active ad position for free spins first
        const pos = await tx.select()
            .from(userAdPositions)
            .where(and(eq(userAdPositions.userId, userId), eq(userAdPositions.spinWheelAvailable, true)))
            .limit(1);

        if (pos.length > 0) {
            isFree = true;
            source = 'position';
            // Consume the free spin on the position
            await tx.update(userAdPositions)
                .set({ spinWheelAvailable: false, spinsUsedThisCycle: sql`${userAdPositions.spinsUsedThisCycle} + 1` })
                .where(eq(userAdPositions.id, pos[0].id));
        } else {
            // Check inventory for spin tokens
            const inventorySpin = await tx.query.userInventory.findFirst({
                where: and(
                    eq(userInventory.userId, userId),
                    eq(userInventory.itemType, 'spin_token'),
                    eq(userInventory.status, 'active'),
                    gte(userInventory.spinsRemaining, 1)
                )
            });

            if (inventorySpin) {
                isFree = true;
                source = 'inventory';
                await tx.update(userInventory)
                    .set({ spinsRemaining: sql`${userInventory.spinsRemaining} - 1` })
                    .where(eq(userInventory.id, inventorySpin.id));
            } else {
                // Paid spin
                const balance = await getUserBalance(userId);
                if (new Decimal(balance).lt(config.basePrice || "2.50")) {
                    return { success: false, error: 'insufficient_balance' };
                }
                pricePaid = config.basePrice || "2.50";
                await createLedgerEntry(userId, `-${pricePaid}`, 'marketplace_purchase', configId);
            }
        }

        // 3. Weighted Random Selection
        const totalWeight = slices.reduce((sum, s) => sum + (s.weight || 100), 0);
        let random = Math.random() * totalWeight;
        let selectedSlice = slices[slices.length - 1];

        for (const slice of slices) {
            random -= (slice.weight || 100);
            if (random <= 0) {
                selectedSlice = slice;
                break;
            }
        }

        // 4. Apply Reward
        let rewardValue = selectedSlice.rewardValue || "0";
        // Handle Streak Bonuses (If any)
        // ...streak logic could go here...

        switch (selectedSlice.rewardType) {
            case 'cash':
                await createLedgerEntry(userId, rewardValue, 'surprise_box_reward', selectedSlice.id);
                break;
            case 'multiplier':
                // Adds to nextCycleMultiplier in ad position
                await tx.update(userAdPositions)
                    .set({ nextCycleMultiplier: sql`${userAdPositions.nextCycleMultiplier} + ${selectedSlice.rewardValue}` })
                    .where(and(eq(userAdPositions.userId, userId), eq(userAdPositions.status, 'active')));
                break;
            case 'booster':
                // Logic to award a temporary booster (use applyWatchBooster if needed)
                break;
            case 'ap_bonus':
                await createLedgerEntry(userId, rewardValue, 'ad_point_bonus', selectedSlice.id);
                break;
        }

        // 5. Log Result
        const resultId = crypto.randomUUID();
        await tx.insert(spinWheelResults).values({
            id: resultId,
            userId,
            sliceId: selectedSlice.id,
            isFree,
            pricePaid,
            wonValue: rewardValue,
            outcomeJson: { label: selectedSlice.label, type: selectedSlice.rewardType, source }
        });

        // Notify User
        await createNotification(
            userId,
            'earning',
            'Spin Wheel Result!',
            `You won: ${selectedSlice.label}`,
            rewardValue
        );

        return {
            success: true,
            slice: selectedSlice,
            isFree,
            pricePaid
        };
    });
}
