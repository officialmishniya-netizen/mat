import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserBalance } from "@/lib/ledger";
import TransferForm from "./TransferForm";
import { db } from "@/lib/db";
import { ledger, users } from "@/lib/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import { ArrowRightLeft, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatMoney } from "@/lib/money";

export const metadata = {
    title: "P2P Transfer | Earn with the Ultimate Matrix"
};

export default async function TransferPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    // Fetch Current Balance
    const availableBalance = await getUserBalance(effectiveUserId);

    // Fetch Transfer History (both sending and receiving)
    const { data: historyData } = await supabase
        .from('ledger')
        .select('id, amount, type, created_at, reference_id')
        .eq('user_id', effectiveUserId)
        .in('type', ['transfer_out', 'transfer_in'])
        .order('created_at', { ascending: false })
        .limit(10);

    const history = historyData || [];

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">E-Wallet Transfer</h1>
                <p className="text-[#737791] font-medium text-sm mt-1">Send funds instantly to another member's Purchase Balance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <TransferForm availableBalance={availableBalance} />
                    </div>
                </div>

                {/* Right Col: Info & History */}
                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-primary rounded-[32px] p-6 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <ArrowRightLeft size={20} className="text-white" />
                            </div>
                            <h3 className="font-bold text-indigo-100">Sendable Balance</h3>
                        </div>
                        <div className="text-4xl font-black tracking-tighter mb-1 relative z-10">
                            {formatMoney(availableBalance)}
                        </div>
                        <p className="text-xs text-indigo-100/80 font-medium">*Transfers are instant and irreversible.</p>
                    </div>

                    {/* Recent History */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#151d48] mb-4">Recent Transfers</h3>
                        {history.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-400 font-medium">No recent transfers.</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'transfer_in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                {item.type === 'transfer_in' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#151d48]">
                                                    {item.type === 'transfer_in' ? '+' : ''}{parseFloat(item.amount).toFixed(2)}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-0.5">
                                                    {item.type === 'transfer_in' ? 'Received' : 'Sent'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1 rounded-md bg-gray-50">
                                            <Clock size={10} className="inline mr-1 mb-[2px]" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
