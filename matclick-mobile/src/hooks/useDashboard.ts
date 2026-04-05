import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useDashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            // 1. Fetch User Profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // 2. Fetch Balance (Sum of Ledger)
            const { data: ledgerEntries, error: ledgerError } = await supabase
                .from('ledger')
                .select('amount')
                .eq('user_id', user.id);

            if (ledgerError) throw ledgerError;

            const totalBalance = ledgerEntries.reduce((acc, entry) => acc + parseFloat(entry.amount), 0);

            // 3. Fetch Ad Stats (Active Positions)
            const { data: adPositions, error: adError } = await supabase
                .from('user_ad_positions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (adError) throw adError;

            // Calculate aggregated stats
            const totalEarnedToday = adPositions.reduce((acc, pos) => acc + parseFloat(pos.session_earned_today || '0'), 0);
            const adsWatchedToday = adPositions.reduce((acc, pos) => acc + (pos.ads_watched_today || 0), 0);
            const maxStreak = adPositions.reduce((acc, pos) => Math.max(acc, pos.current_streak || 0), 0);

            setStats({
                user: {
                    name: profile.full_name || profile.username,
                    level: `🥈 ${profile.rank || 'Member'}`
                },
                balance: totalBalance.toFixed(2),
                totalEarned: (totalBalance + 0).toFixed(2), // Simplified for now
                referrals: 0, // Need to count sponsor_id in users table
                stats: {
                    ads: `${adsWatchedToday}/20`,
                    tasks: '0/0',
                    team: `$${totalEarnedToday.toFixed(2)}`
                },
                streak: maxStreak
            });

        } catch (err: any) {
            console.error('Error fetching dashboard:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { stats, loading, error, refresh: fetchDashboardData };
};
