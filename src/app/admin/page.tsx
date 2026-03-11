import {
    UserGrowthChart,
    LedgerFlowChart,
    AdCyclePerformance,
    LevelDistributionChart
} from "./DashboardCharts";
import { supabase } from "@/lib/supabase";
import { addMoney, subtractMoney } from "@/lib/money";
import { Wallet, ActivitySquare, AlertTriangle, UserCheck, ShieldAlert, MonitorPlay, Layers, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // ----------------------------------------------------------------------
    // 1. FINANCIAL HEALTH CALCULATIONS
    // ----------------------------------------------------------------------
    const { data: ledger } = await supabase.from('ledger').select('amount, type, created_at');

    let totalLiability = '0.00';
    let revenueIn = '0.00';
    let totalWithdrawn = '0.00';
    let adRewardsToday = '0.00';
    let matrixCyclesToday = 0;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStr = todayStart.toISOString();

    if (ledger) {
        for (const entry of ledger) {
            // Calculate Global Liability
            totalLiability = addMoney(totalLiability, entry.amount);

            // Revenue and Withdrawals
            if (entry.type === 'deposit') {
                revenueIn = addMoney(revenueIn, entry.amount);
            } else if (entry.type === 'withdrawal') {
                // Withdrawals are negative in the ledger, so we subtract it from 0 to get absolute positive
                totalWithdrawn = addMoney(totalWithdrawn, Math.abs(parseFloat(entry.amount)).toString());
            }

            // Today's Activity Pulse
            if (new Date(entry.created_at) >= todayStart) {
                if (entry.type === 'ad_reward') {
                    adRewardsToday = addMoney(adRewardsToday, entry.amount);
                } else if (entry.type === 'matrix_cycle') {
                    matrixCyclesToday++;
                }
            }
        }
    }

    // Net Profit: Revenue In - Total Withdrawn - Current Liability
    // E.g: $100 In - $20 Out - $50 Liability (users holding funds) = $30 System Profit
    const profitAfterWithdrawals = subtractMoney(revenueIn, totalWithdrawn);
    const netProfit = subtractMoney(profitAfterWithdrawals, totalLiability);
    const isProfitNegative = parseFloat(netProfit) < 0;

    // ----------------------------------------------------------------------
    // 2. ACTIVITY PULSE (TODAY)
    // ----------------------------------------------------------------------
    const { count: adViewsToday } = await supabase
        .from('ad_views')
        .select('*', { count: 'exact', head: true })
        .gte('completed_at', todayStr);

    // Estimate Active Users by counting unique users who took an action today (viewed an ad or ledger entry)
    const { data: uniqueViews } = await supabase.from('ad_views').select('user_id').gte('completed_at', todayStr);
    const activeUsersSet = new Set(uniqueViews?.map(v => v.user_id));
    const activeUsersToday = activeUsersSet.size;

    // ----------------------------------------------------------------------
    // 3. ACTION NEEDED
    // ----------------------------------------------------------------------
    // Standard mock alerts per Master Prompt until full tables are wired
    const pendingWithdrawals = 0; // Replace with pending withdrawal tables query
    const flaggedUsers = 0;       // Replace with Anti-cheat table query

    // Matrix Distribution for the pie chart
    const { data: levels } = await supabase.from('levels').select('id, name');
    const { data: positions } = await supabase.from('user_levels').select('level_id');
    const levelDistribution = (levels || []).map(lvl => {
        const count = positions?.filter(p => p.level_id === lvl.id).length || 0;
        return { name: lvl.name, count };
    });

    // ----------------------------------------------------------------------
    // 4. CHART DATA AGGREGATION (Last 7 Days)
    // ----------------------------------------------------------------------
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7DaysLedger: { name: string, deposits: number, payouts: number }[] = [];
    const last7DaysAds: { name: string, adsViewed: number, limitHits: number }[] = [];

    // Initialize days
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setUTCDate(d.getUTCDate() + i);
        last7DaysLedger.push({ name: days[d.getUTCDay()], deposits: 0, payouts: 0 });
        last7DaysAds.push({ name: (i + 1).toString(), adsViewed: 0, limitHits: 0 });
    }

    if (ledger) {
        for (const entry of ledger) {
            const entryDate = new Date(entry.created_at);
            if (entryDate >= sevenDaysAgo) {
                const dayIndex = Math.floor((entryDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
                if (dayIndex >= 0 && dayIndex < 7) {
                    if (entry.type === 'deposit') {
                        last7DaysLedger[dayIndex].deposits += Math.abs(parseFloat(entry.amount));
                    } else if (entry.type === 'withdrawal' || entry.type === 'matrix_cycle' || entry.type === 'matching_bonus' || entry.type === 'ad_reward' || entry.type === 'referral_bonus') {
                        // For payouts, we only count outward flows or rewards paid
                        // Actually let's just count explicitly requested payout types
                        if (['matrix_cycle', 'matching_bonus', 'ad_reward', 'referral_bonus'].includes(entry.type)) {
                            last7DaysLedger[dayIndex].payouts += Math.abs(parseFloat(entry.amount));
                        }
                    }
                }
            }
        }
    }

    // Ad views aggregation
    const { data: recentViews } = await supabase
        .from('ad_views')
        .select('completed_at')
        .gte('completed_at', sevenDaysAgo.toISOString());

    if (recentViews) {
        for (const view of recentViews) {
            const viewDate = new Date(view.completed_at);
            const dayIndex = Math.floor((viewDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < 7) {
                last7DaysAds[dayIndex].adsViewed++;
            }
        }
    }

    // User growth aggregation (Simplified monthly for now)
    const { data: allUsers } = await supabase.from('users').select('created_at, role');
    const userGrowth: { name: string, free: number, pro: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Group users by month
    const growthMap: Record<string, { free: number, pro: number }> = {};
    if (allUsers) {
        for (const u of allUsers) {
            const d = new Date(u.created_at);
            const month = months[d.getUTCMonth()];
            if (!growthMap[month]) growthMap[month] = { free: 0, pro: 0 };
            if (u.role === 'admin') continue; // Skip admins

            // For now, let's assume 'pro' if they have any levels, but here we just check role or placeholder
            // In a real scenario, we'd join with user_levels
            growthMap[month].free++;
        }
    }

    // Convert map to sorted array (last 6 months)
    const currentMonth = new Date().getUTCMonth();
    for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonth - i + 12) % 12;
        const mName = months[mIdx];
        userGrowth.push({
            name: mName,
            free: growthMap[mName]?.free || 0,
            pro: growthMap[mName]?.pro || 0
        });
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto text-[#151d48]">
            {/* ROW 1: MASTER FINANCIAL HEALTH & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. FINANCIAL HEALTH WIDGETS */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center"><Wallet className="mr-2 text-primary" size={24} /> Financial Health</h2>
                            <p className="text-sm text-[#a0a8b9] font-medium mt-1">Real-time Global Ledger Aggregation</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Liability */}
                        <div className="bg-[#f3e8ff] rounded-xl p-4 border border-purple-100">
                            <div className="w-10 h-10 bg-[#bf83ff] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Banknote size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${totalLiability}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total System Liability</p>
                            <p className="text-[11px] font-bold text-gray-500">Sitting in User Balances</p>
                        </div>
                        {/* Revenue */}
                        <div className="bg-[#dcfce7] rounded-xl p-4 border border-green-100">
                            <div className="w-10 h-10 bg-[#3cd856] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Wallet size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${revenueIn}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total Revenue In</p>
                            <p className="text-[11px] font-bold text-gray-500">Deposited via Payments</p>
                        </div>
                        {/* Withdrawn */}
                        <div className="bg-[#fff4de] rounded-xl p-4 border border-orange-100">
                            <div className="w-10 h-10 bg-[#ff947a] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Wallet size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${totalWithdrawn}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total Withdrawn</p>
                            <p className="text-[11px] font-bold text-gray-500">Successfully Paid Out</p>
                        </div>
                        {/* Net Profit */}
                        {isProfitNegative ? (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-inner">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg animate-pulse"><AlertTriangle size={20} /></div>
                                <h3 className="text-2xl font-bold mb-1 text-red-600">-${Math.abs(parseFloat(netProfit)).toFixed(2)}</h3>
                                <p className="text-sm font-semibold text-red-800 mb-1">Net Profit Deficit</p>
                                <p className="text-[11px] font-bold text-red-600">System is over-leveraged!</p>
                            </div>
                        ) : (
                            <div className="bg-[#e0f2fe] rounded-xl p-4 border border-blue-100">
                                <div className="w-10 h-10 bg-[#38bdf8] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><ActivitySquare size={20} /></div>
                                <h3 className="text-2xl font-bold mb-1 text-blue-700">${netProfit}</h3>
                                <p className="text-sm font-semibold text-blue-800 mb-1">Net System Profit</p>
                                <p className="text-[11px] font-bold text-blue-600">Total Sustainable Margins</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ACTION NEEDED ALERTS */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-1 flex items-center"><ShieldAlert className="mr-2 text-red-500" size={20} /> Alerts</h2>
                        <p className="text-sm text-[#a0a8b9] font-medium mb-6">Action Needed</p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="flex items-center space-x-3">
                                    <Wallet size={18} className="text-orange-600" />
                                    <span className="font-semibold text-sm text-orange-900">Pending Withdrawals</span>
                                </div>
                                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingWithdrawals}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center space-x-3">
                                    <ShieldAlert size={18} className="text-red-600" />
                                    <span className="font-semibold text-sm text-red-900">Flagged Users</span>
                                </div>
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{flaggedUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: ACTIVITY PULSE (TODAY) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-1 flex items-center"><ActivitySquare className="mr-2 text-primary" size={24} /> Activity Pulse</h2>
                <p className="text-sm text-[#a0a8b9] font-medium mb-6">Last 24 Hours</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><MonitorPlay size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Ad Views Today</p>
                            <p className="text-2xl font-bold">{adViewsToday || 0}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Banknote size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Ad Rewards Paid</p>
                            <p className="text-2xl font-bold text-green-600">${adRewardsToday}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Layers size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Matrix Cycles Today</p>
                            <p className="text-2xl font-bold">{matrixCyclesToday}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><UserCheck size={24} /></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Active Users</p>
                            <p className="text-2xl font-bold">{activeUsersToday}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: VISUAL GRAPHICS (User Growth & Ledger Flow) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">Ledger Flow Visualizer</h2>
                    <div className="flex-1 w-full min-h-[300px] relative -left-4">
                        <LedgerFlowChart data={last7DaysLedger} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Matrix Penetration</h2>
                    <div className="flex-1 w-full min-h-[300px]">
                        <LevelDistributionChart levelData={levelDistribution} />
                    </div>
                </div>
            </div>

            {/* ROW 4: AD PERFORMANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">User Growth</h2>
                    <div className="flex-1 w-full min-h-[250px]">
                        <UserGrowthChart data={userGrowth} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">Ad Performance (7 Days)</h2>
                    <div className="flex-1 w-full min-h-[250px]">
                        <AdCyclePerformance
                            data={last7DaysAds}
                            stats={{
                                viewsPerDay: Math.round(last7DaysAds.reduce((acc, curr) => acc + curr.adsViewed, 0) / 7),
                                drainStatus: 'Stable'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
