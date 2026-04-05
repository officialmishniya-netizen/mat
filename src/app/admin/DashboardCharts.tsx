"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";

// Reusable Custom Legend
const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="flex justify-center space-x-6 text-xs text-[#a0a8b9] font-medium pt-2">
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }}></span>
                    <span>{entry.value}</span>
                </li>
            ))}
        </ul>
    );
};

export function UserGrowthChart({ data }: { data: { name: string, free: number, pro: number }[] }) {
    const displayData = data;

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a0a8b9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a0a8b9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a0a8b9' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a0a8b9' }} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend content={renderLegend} verticalAlign="bottom" height={36} />
                    <Area type="monotone" dataKey="free" name="Free Members" stroke="#a0a8b9" fillOpacity={1} fill="url(#colorFree)" strokeWidth={2} />
                    <Area type="monotone" dataKey="pro" name="Pro Matrix Members" stroke="#f97316" fillOpacity={1} fill="url(#colorPro)" strokeWidth={3} activeDot={{ r: 6 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function LedgerFlowChart({ data }: { data: { name: string, deposits: number, payouts: number }[] }) {
    const displayData = data;

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0a8b9' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0a8b9' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend content={renderLegend} verticalAlign="bottom" height={36} />
                    <Bar dataKey="deposits" name="User Deposits" fill="#22c55e" radius={[4, 4, 4, 4]} barSize={14} />
                    <Bar dataKey="payouts" name="Matrix Payouts" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={14} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AdCyclePerformance({ data, stats }: { data: { name: string, adsViewed: number, limitHits: number }[], stats: { viewsPerDay: number, drainStatus: string } }) {
    const displayData = data;

    return (
        <div className="h-[200px] w-full mt-4 flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="adsViewed" name="Global Ad Views" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="limitHits" name="Ad Limits Reached" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>

            <div className="flex justify-center space-x-6 text-[#a0a8b9] text-xs font-semibold pt-4">
                <div className="text-center">
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-1 bg-[#0ea5e9] rounded-full"></span><span>Est. Views/Day</span></div>
                    <p className="text-[#151d48] font-bold text-sm mt-1">{stats?.viewsPerDay || 0}</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center space-x-2"><span className="w-2.5 h-1 bg-[#ef4444] rounded-full"></span><span>Budget Drain</span></div>
                    <p className="text-[#151d48] font-bold text-sm mt-1">{stats?.drainStatus || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}

export function LevelDistributionChart({ levelData }: { levelData: { name: string, count: number }[] }) {
    const data = levelData;

    const COLORS = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#fbbf24', '#ef4444'];

    return (
        <div className="h-[200px] w-full mt-4 flex flex-col justify-between items-center">
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
            </ResponsiveContainer>

            {/* Legend Map */}
            <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-[#a0a8b9]">
                {data.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span>{entry.name}: {entry.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
