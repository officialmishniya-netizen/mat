import { supabase } from './supabase';

/**
 * Gets the number of ads viewed by a user today.
 */
export const getDailyAdViews = async (userId: string): Promise<number> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
        .from('ad_views')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString());

    if (error) {
        console.error('Error fetching daily ad views:', error);
        return 0;
    }

    return count || 0;
};

/**
 * Gets the user's current ad limit based on their active ad level.
 */
export const getUserAdLimit = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
        .from('user_ad_levels')
        .select(`ad_levels(daily_ad_limit)`)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (error || !data) return 0;

    // @ts-ignore - Supabase nested join type
    return data.ad_levels?.daily_ad_limit || 0;
};
