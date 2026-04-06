import {
    UserGrowthChart,
    LedgerFlowChart,
    AdCyclePerformance,
    LevelDistributionChart
} from "./DashboardCharts";
import { db } from "@/lib/db";
import {
    ledger as ledgerSchema,
    withdrawals as withdrawalsSchema,
    fraudAlerts as fraudAlertsSchema,
    levels as levelsSchema,
    userLevels as userLevelsSchema,
    users as usersSchema,
    adWatchLog as adWatchLogSchema
} from "@/lib/db/schema";
import { sql, count, gte, eq, desc } from "drizzle-orm";
import { addMoney, subtractMoney } from "@/lib/money";
import { Wallet, ActivitySquare, AlertTriangle, UserCheck, ShieldAlert, MonitorPlay, Layers, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

const todayStart = new Date();
todayStart.setUTCHours(0, 0, 0, 0);
const todayStr = todayStart.toISOString();

export default async function AdminDashboardPage() {
    let financialStats: any[] = [];
    let activeUsersToday = 0;
    let adViewsToday = 0;
    let pendingWithdrawalsCount = 0;
    let flaggedUsersCount = 0;
    let levelDistribution: any[] = [];
    let last7DaysLedger: any[] = [];
    let last7DaysAds: any[] = [];
    let userGrowth: any[] = [];

    try {
        // 1. Financial Health
        financialStats = await db.select({
            totalLiability: sql<string>`SUM(amount)`,
            totalRevenue: sql<string>`SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END)`,
            totalWithdrawn: sql<string>`SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END)`,
            adRewardsToday: sql<string>`SUM(CASE WHEN type = 'ad_reward' AND created_at >= ${todayStr} THEN amount ELSE 0 END)`,
            matrixCyclesToday: sql<number>`COUNT(CASE WHEN type = 'matrix_cycle' AND created_at >= ${todayStr} THEN 1 END)`
        }).from(ledgerSchema);

        // 2. Activity Pulse
        activeUsersToday = await db.select({ count: sql<number>`count(distinct user_id)` })
            .from(ledgerSchema)
            .where(sql`created_at >= ${todayStr}`)
            .then(res => Number(res[0]?.count || 0));

        try {
            adViewsToday = await db.select({ count: sql<number>`count(*)` })
                .from(adWatchLogSchema)
                .where(sql`created_at >= ${todayStr}`)
                .then(res => Number(res[0]?.count || 0));
        } catch (e) {
            console.warn("Table ad_watch_log likely missing");
        }

        // 3. Alerts
        pendingWithdrawalsCount = await db.select({ count: count() })
            .from(withdrawalsSchema)
            .where(eq(withdrawalsSchema.status, 'pending'))
            .then(res => res[0].count);

        flaggedUsersCount = await db.select({ count: count() })
            .from(fraudAlertsSchema)
            .where(eq(fraudAlertsSchema.status, 'new'))
            .then(res => res[0].count);

        // Matrix Stats
        const levelDistributionQuery = await db.select({
            name: levelsSchema.name,
            count: sql<number>`count(${userLevelsSchema.id})`
        })
            .from(levelsSchema)
            .leftJoin(userLevelsSchema, eq(levelsSchema.id, userLevelsSchema.level_id))
            .groupBy(levelsSchema.id, levelsSchema.name);

        levelDistribution = levelDistributionQuery.map(row => ({
            name: row.name,
            count: Number(row.count)
        }));

        // 4. Charts (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        const ledgerFlowQuery = await db.select({
            day: sql<string>`TO_CHAR(created_at, 'Dy')`,
            deposits: sql<string>`SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END)`,
            payouts: sql<string>`SUM(CASE WHEN type IN ('matrix_cycle', 'matching_bonus', 'ad_reward', 'referral_bonus') THEN ABS(amount) ELSE 0 END)`,
            dayOrder: sql<string>`TO_CHAR(created_at, 'ID')`
        })
            .from(ledgerSchema)
            .where(gte(ledgerSchema.created_at, sevenDaysAgo))
            .groupBy(sql`TO_CHAR(created_at, 'Dy')`, sql`TO_CHAR(created_at, 'ID')`)
            .orderBy(sql`TO_CHAR(created_at, 'ID')`);

        last7DaysLedger = ledgerFlowQuery.map(row => ({
            name: row.day,
            deposits: parseFloat(row.deposits || '0'),
            payouts: parseFloat(row.payouts || '0')
        }));

        try {
            const adViews7Days = await db.select({
                day: sql<string>`TO_CHAR(created_at, 'DD')`,
                count: sql<number>`count(*)`
            })
                .from(adWatchLogSchema)
                .where(gte(adWatchLogSchema.createdAt, sevenDaysAgo))
                .groupBy(sql`TO_CHAR(created_at, 'DD')`)
                .orderBy(sql`TO_CHAR(created_at, 'DD')`);

            last7DaysAds = adViews7Days.map(row => ({
                name: row.day,
                adsViewed: Number(row.count),
                limitHits: 0
            }));
        } catch (e) {
            console.warn("Ad views query failed (table missing?)");
        }

        const userGrowthQuery = await db.select({
            month: sql<string>`TO_CHAR(created_at, 'Mon')`,
            count: sql<number>`count(*)`
        })
            .from(usersSchema)
            .where(eq(usersSchema.role, 'user'))
            .groupBy(sql`TO_CHAR(created_at, 'Mon')`, sql`date_trunc('month', created_at)`)
            .orderBy(sql`date_trunc('month', created_at)`);

        userGrowth = userGrowthQuery.map(row => ({
            name: row.month,
            free: Number(row.count),
            pro: 0
        }));

    } catch (error: any) {
        console.error("CRITICAL DASHBOARD DATA ERROR:", error);
    }

    const stats = financialStats[0] || {};
    const totalLiability = stats.totalLiability || '0.00';
    const revenueIn = stats.totalRevenue || '0.00';
    const totalWithdrawn = stats.totalWithdrawn || '0.00';
    const adRewardsToday = stats.adRewardsToday || '0.00';
    const matrixCyclesToday = Number(stats.matrixCyclesToday || 0);

    const profitAfterWithdrawals = subtractMoney(revenueIn, totalWithdrawn);
    const netProfit = subtractMoney(profitAfterWithdrawals, totalLiability);
    const isProfitNegative = parseFloat(netProfit) < 0;

    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startDay = new Date();
    startDay.setUTCDate(startDay.getUTCDate() - 6);

    if (last7DaysLedger.length === 0) {
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDay);
            d.setUTCDate(d.getUTCDate() + i);
            last7DaysLedger.push({ name: daysShort[d.getUTCDay()], deposits: 0, payouts: 0 });
        }
    }

    if (last7DaysAds.length === 0) {
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDay);
            d.setUTCDate(d.getUTCDate() + i);
            last7DaysAds.push({ name: String(d.getUTCDate()).padStart(2, '0'), adsViewed: 0, limitHits: 0 });
        }
    }

    if (last7DaysLedger.length === 0) {
        const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const startDay = new Date();
        startDay.setUTCDate(startDay.getUTCDate() - 6);
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDay);
            d.setUTCDate(d.getUTCDate() + i);
            last7DaysLedger.push({ name: daysShort[d.getUTCDay()], deposits: 0, payouts: 0 });
        }
    }

    return (
        <div className="space-y-6 text-[#151d48]">
            {/* ROW 1: MASTER FINANCIAL HEALTH & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* 1. FINANCIAL HEALTH WIDGETS */}
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold flex items-center"><Wallet className="mr-2 text-primary" size={24} /> Money Overview</h2>
                            <p className="text-sm text-[#a0a8b9] font-medium mt-1">Real-time balances across the entire system</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total User Funds */}
                        <div className="bg-[#f3e8ff] rounded-xl p-4 border border-purple-100">
                            <div className="w-10 h-10 bg-[#bf83ff] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Banknote size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${totalLiability}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total Member Balances</p>
                            <p className="text-[11px] font-bold text-gray-500">Money currently held by users</p>
                        </div>
                        {/* Revenue */}
                        <div className="bg-[#dcfce7] rounded-xl p-4 border border-green-100">
                            <div className="w-10 h-10 bg-[#3cd856] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Wallet size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${revenueIn}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total Money In</p>
                            <p className="text-[11px] font-bold text-gray-500">Payments made into the system</p>
                        </div>
                        {/* Withdrawn */}
                        <div className="bg-[#fff4de] rounded-xl p-4 border border-orange-100">
                            <div className="w-10 h-10 bg-[#ff947a] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><Wallet size={20} /></div>
                            <h3 className="text-2xl font-bold mb-1">${totalWithdrawn}</h3>
                            <p className="text-sm font-semibold text-[#444a6d] mb-1">Total Paid Out</p>
                            <p className="text-[11px] font-bold text-gray-500">Money successfully withdrawn</p>
                        </div>
                        {/* System Health */}
                        {isProfitNegative ? (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-inner">
                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg animate-pulse"><AlertTriangle size={20} /></div>
                                <h3 className="text-2xl font-bold mb-1 text-red-600">-${Math.abs(parseFloat(netProfit)).toFixed(2)}</h3>
                                <p className="text-sm font-semibold text-red-800 mb-1">System Shortfall</p>
                                <p className="text-[11px] font-bold text-red-600">Growth is outpacing reserves!</p>
                            </div>
                        ) : (
                            <div className="bg-[#e0f2fe] rounded-xl p-4 border border-blue-100">
                                <div className="w-10 h-10 bg-[#38bdf8] rounded-full flex items-center justify-center text-white mb-3 shadow-sm text-lg"><ActivitySquare size={20} /></div>
                                <h3 className="text-2xl font-bold mb-1 text-blue-700">${netProfit}</h3>
                                <p className="text-sm font-semibold text-blue-800 mb-1">System Surplus</p>
                                <p className="text-[11px] font-bold text-blue-600">Available growth margins</p>
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
                                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingWithdrawalsCount}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex items-center space-x-3">
                                    <ShieldAlert size={18} className="text-red-600" />
                                    <span className="font-semibold text-sm text-red-900">Security Threats</span>
                                </div>
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">{flaggedUsersCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: ACTIVITY PULSE (TODAY) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-1 flex items-center"><ActivitySquare className="mr-2 text-primary" size={24} /> Recent Activity</h2>
                <p className="text-sm text-[#a0a8b9] font-medium mb-6">Overview of the last 24 hours</p>

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
                    <h2 className="text-xl font-bold mb-2">Growth Level Stats</h2>
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
                                drainStatus: (last7DaysAds[6]?.adsViewed || 0) > (last7DaysAds[0]?.adsViewed || 0) ? 'Increasing' : 'Stable'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
