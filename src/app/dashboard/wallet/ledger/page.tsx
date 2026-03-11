import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { ledger } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
    ListOrdered,
    ArrowDownLeft,
    ArrowUpRight,
    Zap,
    Users,
    RefreshCcw,
    ShoppingCart,
    Globe,
    Landmark,
    Filter
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = {
    title: "My Ledger | Earn with the Ultimate Matrix"
};

const getTypeConfig = (type: string) => {
    switch (type) {
        case 'deposit':
            return { icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-50', label: 'Deposit' };
        case 'withdrawal':
            return { icon: Landmark, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Withdrawal' };
        case 'ad_reward':
            return { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Ad View Reward' };
        case 'matrix_cycle':
            return { icon: RefreshCcw, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Matrix Cycle' };
        case 'referral_bonus':
            return { icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Referral Bonus' };
        case 'matching_bonus':
            return { icon: Globe, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Matching Bonus' };
        case 'matrix_purchase':
            return { icon: ShoppingCart, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Level Purchase' };
        case 'transfer_in':
            return { icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'P2P Received' };
        case 'transfer_out':
            return { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50', label: 'P2P Sent' };
        default:
            return { icon: ListOrdered, color: 'text-gray-600', bg: 'bg-gray-100', label: type };
    }
};

export default async function LedgerPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    // Fetch Full Ledger History
    const { data: historyData } = await supabase
        .from('ledger')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(100);

    const history = historyData || [];

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">Ledger History</h1>
                    <p className="text-[#737791] font-medium text-sm mt-1">A transparent view of all your account transactions.</p>
                </div>

                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-[#151d48] shadow-sm hover:bg-gray-50 transition-colors">
                    <Filter size={16} className="text-gray-400" />
                    Filter Transactions
                </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                {history.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ListOrdered size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#151d48] mb-2">No Transactions Yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Your account activity will appear here once you start earning or making transactions.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <th className="pb-4 pl-4 font-black">Transaction Type</th>
                                    <th className="pb-4 font-black">Date & Time</th>
                                    <th className="pb-4 font-black">Reference ID</th>
                                    <th className="pb-4 pr-4 text-right font-black">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry) => {
                                    const config = getTypeConfig(entry.type);
                                    const Icon = config.icon;
                                    const isPositive = parseFloat(entry.amount) > 0;

                                    return (
                                        <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} shrink-0`}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <span className="font-bold text-[#151d48]">{config.label}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm font-bold text-gray-500">
                                                {formatDate(entry.created_at)} <span className="text-gray-400 font-medium ml-1">{formatTime(entry.created_at)}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                    {entry.reference_id || 'SYS-DEFAULT'}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-right">
                                                <span className={`text-base font-black tracking-tighter ${isPositive ? 'text-green-600' : 'text-[#151d48]'}`}>
                                                    {isPositive ? '+' : ''}{parseFloat(entry.amount).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
