import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAdPositions } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { notifyUser } from '@/lib/telegram/bot';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Find positions where timer just expired (nextAdsAvailableAt is between 5 mins ago and now)
    const readyPositions = await db.query.userAdPositions.findMany({
        where: and(
            eq(userAdPositions.status, 'active'),
            lte(userAdPositions.nextAdsAvailableAt, now),
            gte(userAdPositions.nextAdsAvailableAt, fiveMinAgo),
        ),
        with: { adPlan: true } as any
    });

    for (const position of readyPositions) {
        const plan = (position as any).adPlan;
        const effectiveLimit = Number(plan.dailyAds) + (position.boostedAdsPerDay || 0);
        const potentialEarn = (
            effectiveLimit * Number(plan.perClickValue)
        ).toFixed(2);

        await notifyUser(position.userId, 'ads_ready', {
            ads_available: String(effectiveLimit),
            potential_earn: `\${potentialEarn}`,
            locked_balance: position.lockedBalance || '0',
            click_goal: position.clickGoalSnapshot,
            progress_pct: Math.min(100,
                Number(position.lockedBalance) /
                Number(position.clickGoalSnapshot) * 100
            ).toFixed(1),
            progress_bar: '...',
        });
    }

    return NextResponse.json({ processed: readyPositions.length });
}
