import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import crypto from 'crypto';
import { db } from "@/lib/db";
import { ads, adWatchLog, ledger, users, adPlans, userAdPositions, adCycleHistory, communityPool, communityPoolLedger } from "@/lib/db/schema";
import { eq, sql, and, lt, or, isNull, desc } from "drizzle-orm";
import { toMoney } from "@/lib/money";
import { notifyUser } from "@/lib/telegram/bot";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: "Missing or invalid security token." }, { status: 400 });
        }

        // 1. Verify and Decode the Secret Token
        const [payloadB64, providedSignature] = token.split('.');
        if (!payloadB64 || !providedSignature) {
            return NextResponse.json({ error: "Malformed security token." }, { status: 400 });
        }

        const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-secret-key';
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(payloadB64).digest('base64url');

        if (expectedSignature !== providedSignature) {
            return NextResponse.json({ error: "Token signature verification failed. Potential tampering." }, { status: 403 });
        }

        const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
        const payload = JSON.parse(payloadStr);
        const { userId, adId, startedAt, durationSeconds } = payload;

        // 2. Anti-Cheat: Did at least durationSeconds pass?
        const now = new Date();
        const secondsPassed = (now.getTime() - startedAt) / 1000;

        if (secondsPassed < durationSeconds - 0.5) {
            return NextResponse.json({ error: `Anti-Cheat Violation: Attempted to claim reward after only ${Math.round(secondsPassed)} seconds. Timer was ${durationSeconds}s.` }, { status: 403 });
        }

        // 3. Ensure User Session exactly matches Token Payload
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized session." }, { status: 401 });

        const impersonateCookie = cookies().get("impersonated_user_id");
        const effectiveUserId = impersonateCookie?.value || session.user.id;

        if (userId !== effectiveUserId) {
            return NextResponse.json({ error: "Token user mismatch." }, { status: 403 });
        }

        const ip = req.headers.get('x-forwarded-for') || "127.0.0.1";

        // 4. ATOMIC SUBMISSION & PAYOUT
        const result = await db.transaction(async (tx) => {
            // A. Fetch current Ad configuration
            const updatedAds = await tx.update(ads)
                .set({ total_views: sql`${ads.total_views} + 1` })
                .where(
                    and(
                        eq(ads.id, adId),
                        eq(ads.active, true),
                        or(isNull(ads.global_limit), lt(ads.total_views, ads.global_limit))
                    )
                )
                .returning({ reward: ads.reward });

            if (!updatedAds || updatedAds.length === 0) {
                throw new Error("Ad expired or limit reached.");
            }

            const earnedAmount = updatedAds[0].reward;

            // B. Find user's active ad position
            const activePosition = await tx.select({
                id: userAdPositions.id,
                adsWatchedToday: userAdPositions.adsWatchedToday,
                nextAdsAvailableAt: userAdPositions.nextAdsAvailableAt,
                lockedBalance: userAdPositions.lockedBalance,
                sessionEarnedToday: userAdPositions.sessionEarnedToday,
                clickGoalSnapshot: userAdPositions.clickGoalSnapshot,
                status: userAdPositions.status,
                createdAt: userAdPositions.createdAt,
                adPlan: adPlans
            })
                .from(userAdPositions)
                .innerJoin(adPlans, eq(userAdPositions.adPlanId, adPlans.id))
                .where(and(eq(userAdPositions.userId, userId), eq(userAdPositions.status, "active")))
                .orderBy(desc(userAdPositions.createdAt))
                .limit(1);

            if (!activePosition || activePosition.length === 0) {
                throw new Error("No active ad plan found.");
            }

            const pos = activePosition[0];
            const effectiveLimit = pos.adPlan.dailyAds; // In real use, + pos.boostedAdsPerDay

            // ROLLING TIMER LOGIC
            const currentTime = new Date();

            // Step 1: Check Cooldown
            if (pos.nextAdsAvailableAt && currentTime < pos.nextAdsAvailableAt) {
                if ((pos.adsWatchedToday ?? 0) >= effectiveLimit) {
                    throw new Error(`daily_limit_reached|${pos.nextAdsAvailableAt.toISOString()}`);
                }
            }

            // Step 2: Session Reset
            let currentWatched = pos.adsWatchedToday ?? 0;
            let currentSessionEarned = pos.sessionEarnedToday || "0";
            if (pos.nextAdsAvailableAt && currentTime >= pos.nextAdsAvailableAt) {
                currentWatched = 0;
                currentSessionEarned = "0";
            }

            // Step 3: Payout Logic
            const lockedBalanceBefore = pos.lockedBalance || "0";
            const lockedBalanceAfter = (parseFloat(lockedBalanceBefore) + parseFloat(earnedAmount)).toString();
            const newSessionEarned = (parseFloat(currentSessionEarned) + parseFloat(earnedAmount)).toString();
            const newAdsWatched = currentWatched + 1;

            const isLastAd = newAdsWatched >= effectiveLimit;
            const nextAvailable = isLastAd
                ? new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
                : (currentTime.getTime() >= (pos.nextAdsAvailableAt?.getTime() || 0) ? null : pos.nextAdsAvailableAt);

            // C. Insert Watch Log
            await tx.insert(adWatchLog).values({
                userId,
                adId,
                earnedAmount,
                lockedBalanceBefore,
                lockedBalanceAfter,
                cycleTriggered: parseFloat(lockedBalanceAfter) >= parseFloat(pos.clickGoalSnapshot),
                adToken: token.slice(0, 100),
                ipAddress: ip
            });

            // D. Update Position
            const updateFields: any = {
                adsWatchedToday: newAdsWatched,
                lockedBalance: lockedBalanceAfter,
                sessionEarnedToday: newSessionEarned,
                lastAdWatchedAt: currentTime,
                nextAdsAvailableAt: nextAvailable,
                updatedAt: currentTime
            };

            // E. Handle Cycle Completion
            let cycleData: any = null;
            if (parseFloat(lockedBalanceAfter) >= parseFloat(pos.clickGoalSnapshot)) {
                updateFields.status = 'cycled';
                (updateFields as any).totalCycles = sql`${userAdPositions.totalCycles} + 1`;
                (updateFields as any).spinWheelAvailable = true;

                // 1. Pay User (Base Payout)
                await tx.insert(ledger).values({
                    user_id: userId,
                    amount: pos.adPlan.cyclePayout,
                    type: "cycle_revenue",
                    reference_id: pos.id
                });

                // 2. Pay Sponsor (Matching Bonus)
                const userProfile = await tx.select({ sponsorId: users.sponsor_id, username: users.username }).from(users).where(eq(users.id, userId)).limit(1);
                const sponsorBonus = (parseFloat(pos.adPlan.cyclePayout) * (parseFloat(pos.adPlan.sponsorBonusPct) / 100)).toFixed(2);

                let sponsorId: string | null = null;
                if (userProfile[0]?.sponsorId) {
                    sponsorId = userProfile[0].sponsorId;
                    await tx.insert(ledger).values({
                        user_id: sponsorId as any,
                        amount: sponsorBonus,
                        type: "matching_bonus",
                        reference_id: pos.id
                    } as any);
                }

                // 3. Community Pool Contribution
                const poolCut = (parseFloat(pos.adPlan.cyclePayout) * (parseFloat(pos.adPlan.communityPoolPct) / 100)).toFixed(2);
                await tx.insert(communityPoolLedger).values({
                    amount: poolCut,
                    type: 'contribution',
                    bucket: 'loyalty', // Default bucket
                    referenceId: pos.id
                } as any);

                // 4. Record Cycle History
                await tx.insert(adCycleHistory).values({
                    userId,
                    positionId: pos.id,
                    cycleNumber: 1, // Need to fetch previous cycle count for real
                    basePayout: pos.adPlan.cyclePayout,
                    totalPaidToUser: pos.adPlan.cyclePayout,
                    sponsorBonusPaid: sponsorBonus,
                    communityPoolContribution: poolCut,
                    cycleStartedAt: pos.createdAt
                });

                // 5. Auto-Rebuy
                await tx.insert(userAdPositions).values({
                    userId,
                    adPlanId: pos.adPlan.id,
                    clickGoalSnapshot: pos.adPlan.clickGoal,
                    status: 'active'
                });

                cycleData = {
                    userId,
                    sponsorId,
                    planName: pos.adPlan.name,
                    payout: pos.adPlan.cyclePayout,
                    referralUsername: userProfile[0]?.username,
                    sponsorBonus
                };
            }

            await tx.update(userAdPositions).set(updateFields).where(eq(userAdPositions.id, pos.id));

            return { earnedAmount, lockedBalanceAfter, cycleData };
        });

        // F. Send Async Notifications (Outside Transaction)
        if (result.cycleData) {
            const { userId, sponsorId, planName, payout, referralUsername, sponsorBonus } = result.cycleData;

            // Notify User
            notifyUser(userId, 'cycle_complete', {
                plan_name: planName,
                payout: `$${payout}`,
                cycle_number: '1' // Could be dynamic
            }).catch(e => console.error('Telegram notification error (user):', e));

            // Notify Sponsor
            if (sponsorId) {
                notifyUser(sponsorId, 'referral_cycled', {
                    referral_username: referralUsername || 'A member',
                    bonus_amount: `$${sponsorBonus}`,
                    plan_name: planName
                }).catch(e => console.error('Telegram notification error (sponsor):', e));
            }

            // Spin Wheel Ready
            notifyUser(userId, 'spin_wheel_ready', {
                plan_name: planName
            }).catch(e => console.error('Telegram notification error (spin):', e));
        }

        return NextResponse.json({ success: true, earnedAmount: result.earnedAmount, lockedBalanceAfter: result.lockedBalanceAfter });

    } catch (error: any) {
        console.error("AD VERIFY ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
