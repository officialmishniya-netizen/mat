import { supabase } from './supabase';
import { toMoney, addMoney } from './money';
import { createNotification } from './notifications';

export type LedgerEntry = {
    id: string;
    user_id: string;
    amount: number | string;
    type: 'deposit' | 'withdrawal' | 'ad_reward' | 'matrix_cycle' | 'referral_bonus' | 'matching_bonus' | 'matrix_purchase' | 'transfer_in' | 'transfer_out' | 'marketplace_purchase' | 'pool_lock' | 'pool_return' | 'pool_early_withdrawal' | 'contest_prize' | 'scheduled_withdrawal' | 'ad_spend' | 'surprise_box_reward' | 'balance_bundle_credit' | 'ad_point_bonus' | 'referral_tool_purchase' | 'plan_upgrade_credit_purchase' | 'bounty_reward';
    reference_id: string | null;
    created_at: string;
};

/**
 * Calculates the absolute true balance of a user by summing up their entire ledger history.
 * This is the ONLY source of truth for a user's balance.
 */
export const getUserBalance = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching ledger for balance:', error);
        return '0.00';
    }

    if (!data || data.length === 0) return '0.00';

    let totalBalance = '0.00';
    for (const row of data) {
        totalBalance = addMoney(totalBalance, row.amount);
    }

    return totalBalance;
};

/**
 * Gets the total amount deposited by the user.
 */
export const getPurchaseBalance = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount')
        .eq('user_id', userId)
        .in('type', ['deposit', 'matrix_purchase', 'marketplace_purchase', 'transfer_in']);

    if (error || !data) return '0.00';

    let total = '0.00';
    for (const row of data) {
        total = addMoney(total, row.amount);
    }
    return total;
};

/**
 * Gets the total earnings from all sources.
 */
export const getTotalEarnings = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount')
        .eq('user_id', userId)
        .in('type', ['ad_reward', 'matrix_cycle', 'referral_bonus', 'matching_bonus', 'cycle_revenue', 'bounty_reward']);

    if (error || !data) return '0.00';

    let total = '0.00';
    for (const row of data) {
        total = addMoney(total, row.amount);
    }
    return total;
};

/**
 * Gets specific bonus totals.
 */
export const getBonusTotals = async (userId: string) => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount, type')
        .eq('user_id', userId)
        .in('type', ['referral_bonus', 'matching_bonus']);

    if (error || !data) return { referral: '0.00', matching: '0.00' };

    let referral = '0.00';
    let matching = '0.00';

    for (const row of data) {
        if (row.type === 'referral_bonus') referral = addMoney(referral, row.amount);
        if (row.type === 'matching_bonus') matching = addMoney(matching, row.amount);
    }

    return { referral, matching };
};

/**
 * Gets the total earnings from personal ad clicks (Matrix clicks).
 */
export const getAdRewardTotal = async (userId: string): Promise<string> => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'ad_reward');

    if (error || !data) return '0.00';

    let total = '0.00';
    for (const row of data) {
        total = addMoney(total, row.amount);
    }
    return total;
};

/**
 * Creates a new ledger entry safely.
 * Use negative amounts for purchases/withdrawals.
 */
export const createLedgerEntry = async (
    userId: string,
    amount: string | number,
    type: LedgerEntry['type'],
    referenceId: string | null = null
): Promise<string | null> => {
    const amountStr = toMoney(amount).toFixed(2);

    const { data, error } = await supabase.from('ledger').insert({
        user_id: userId,
        amount: amountStr,
        type,
        reference_id: referenceId,
    }).select('id').single();

    if (error || !data) {
        console.error('Failed to create ledger entry:', error);
        return null;
    }

    // Auto-Notification Logic
    const notifyTypes: LedgerEntry['type'][] = ['ad_reward', 'matrix_cycle', 'referral_bonus', 'matching_bonus', 'deposit', 'withdrawal', 'transfer_in', 'bounty_reward'];
    if (notifyTypes.includes(type)) {
        let title = '';
        let description = '';
        const amountStr = amount.toString();

        switch (type) {
            case 'ad_reward':
                title = 'Earning Credited';
                description = `You earned $${amountStr} from ad engagement.`;
                break;
            case 'matrix_cycle':
                title = 'Matrix Cycled!';
                description = `Congratulations! Your matrix position has cycled. Reward: $${amountStr}`;
                break;
            case 'referral_bonus':
                title = 'Referral Bonus';
                description = `You received a $${amountStr} referral bonus.`;
                break;
            case 'matching_bonus':
                title = 'Matching Bonus';
                description = `You earned a $${amountStr} matching bonus from your downline.`;
                break;
            case 'deposit':
                title = 'Deposit Confirmed';
                description = `Your deposit of $${amountStr} has been successfully credited.`;
                break;
            case 'withdrawal':
                title = 'Withdrawal Requested';
                description = `Your withdrawal request of $${amountStr} is being processed.`;
                break;
            case 'transfer_in':
                title = 'Funds Received';
                description = `You received $${amountStr} from another member.`;
                break;
            case 'bounty_reward':
                title = 'Bounty Completed';
                description = `Awesome! You earned $${amountStr} for completing a micro-job.`;
                break;
        }

        if (title) {
            // Trigger notification (fire and forget in this context or await if preferred)
            createNotification(userId, type as any, title, description, amount);
        }
    }

    return data.id;
};

/**
 * Gets global financial metrics for the entire system.
 */
export const getSystemFinancials = async () => {
    const { data, error } = await supabase
        .from('ledger')
        .select('amount, type');

    if (error || !data) return {
        totalLiability: '0.00',
        revenueIn: '0.00',
        totalWithdrawn: '0.00',
        activePools: '0.00' // Placeholder for future expansion
    };

    let totalLiability = '0.00';
    let revenueIn = '0.00';
    let totalWithdrawn = '0.00';

    for (const row of data) {
        totalLiability = addMoney(totalLiability, row.amount);

        if (row.type === 'deposit') {
            revenueIn = addMoney(revenueIn, row.amount);
        } else if (row.type === 'withdrawal') {
            totalWithdrawn = addMoney(totalWithdrawn, Math.abs(parseFloat(row.amount as string)).toString());
        }
    }

    return { totalLiability, revenueIn, totalWithdrawn };
};

/**
 * Gets daily earnings for the last 12 days.
 */
export const getDailyEarnings = async (userId: string): Promise<number[]> => {
    const days = 12;
    const earnings: number[] = new Array(days).fill(0);
    const now = new Date();

    const { data, error } = await supabase
        .from('ledger')
        .select('amount, created_at')
        .eq('user_id', userId)
        .in('type', ['ad_reward', 'matrix_cycle', 'referral_bonus', 'matching_bonus', 'cycle_revenue'])
        .gte('created_at', new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error || !data) return earnings;

    data.forEach(row => {
        const createdDate = new Date(row.created_at);
        const dayDiff = Math.floor((now.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
        if (dayDiff >= 0 && dayDiff < days) {
            earnings[(days - 1) - dayDiff] += parseFloat(row.amount as string);
        }
    });

    return earnings;
}
