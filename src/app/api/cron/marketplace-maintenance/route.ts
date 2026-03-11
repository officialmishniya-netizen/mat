import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    userInventory, flashSaleEvents, marketplaceItems,
    userAdPositions
} from '@/lib/db/schema';
import { eq, lte, and, gte, isNotNull } from 'drizzle-orm';
import { recalculatePositionBoosts } from '@/lib/marketplace/effectHandlers';

export async function GET(req: Request) {
    // Simple check for cron secret if needed
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });

    const now = new Date();

    try {
        return await db.transaction(async (tx) => {
            // 1. Expire inventory items past expiresAt
            const expiredInventory = await tx.update(userInventory)
                .set({ status: 'expired' })
                .where(and(
                    eq(userInventory.status, 'active'),
                    isNotNull(userInventory.expiresAt),
                    lte(userInventory.expiresAt, now)
                ))
                .returning({ positionId: userInventory.positionId });

            // 2. Deactivate flash sales past endsAt
            await tx.update(flashSaleEvents)
                .set({ isActive: false })
                .where(and(
                    eq(flashSaleEvents.isActive, true),
                    lte(flashSaleEvents.endsAt, now)
                ));

            // 3. Deactivate items past availableUntil
            await tx.update(marketplaceItems)
                .set({ isActive: false })
                .where(and(
                    eq(marketplaceItems.isActive, true),
                    isNotNull(marketplaceItems.availableUntil),
                    lte(marketplaceItems.availableUntil, now)
                ));

            // 4. Recalculate boostedAdsPerDay for affected positions
            const uniquePositions = Array.from(new Set(
                expiredInventory
                    .map(i => i.positionId)
                    .filter(pid => !!pid)
            )) as string[];

            for (const posId of uniquePositions) {
                await recalculatePositionBoosts(tx, posId);
            }

            return NextResponse.json({
                success: true,
                expiredCount: expiredInventory.length,
                recalculatedPositions: uniquePositions.length
            });
        });
    } catch (err: any) {
        console.error('Marketplace Cron Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
