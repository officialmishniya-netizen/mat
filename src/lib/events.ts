import { supabase } from './supabase';

export type EventType =
    | 'ad_watched'
    | 'referral_confirmed'
    | 'matrix_cycle'
    | 'withdrawal_processed'
    | 'pool_matured'
    | 'contest_prize_awarded'
    | 'login';

/**
 * Centrally dispatches system events to trigger secondary effects.
 * Call this after major transactions or status changes.
 */
export async function dispatchEvent(type: EventType, userId: string, payload: object = {}) {
    console.log(`[Event: ${type}] User: ${userId}`, payload);

    try {
        // 1. Badge Evaluation (Future Phase)
        // await evaluateBadges(userId);

        // 2. Contest Score Updates (Future Phase)
        // await updateContestScores(userId, type, payload);

        // 3. Log event if needed for analytics
        /*
        await supabase.from('system_events').insert({
            user_id: userId,
            type,
            payload,
            created_at: new Date().toISOString()
        });
        */

    } catch (error) {
        console.error(`Error in dispatchEvent (${type}):`, error);
    }
}
