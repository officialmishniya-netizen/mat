import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserBalance } from "@/lib/ledger";
import WithdrawForm from "./WithdrawForm";
import { db } from "@/lib/db";
import { withdrawals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Landmark, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/money";

export const metadata = {
    title: "Withdraw Funds | Earn with the Ultimate Matrix"
};

export default async function WithdrawPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    // Fetch Current Balance
    const availableBalance = await getUserBalance(effectiveUserId);

    // Fetch Withdrawal History
    const { data: historyData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false })
        .limit(10);

    const history = historyData || [];

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">Withdraw Funds</h1>
                <p className="text-[#737791] font-medium text-sm mt-1">Request a payout to your preferred crypto or fiat wallet.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <WithdrawForm availableBalance={availableBalance} />
                    </div>
                </div>

                {/* Right Col: Info & History */}
                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-[#151d48] rounded-[32px] p-6 shadow-xl shadow-blue-900/10 border border-blue-900/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Landmark size={20} className="text-blue-300" />
                            </div>
                            <h3 className="font-bold text-blue-200">Available to Withdraw</h3>
                        </div>
                        <div className="text-4xl font-black tracking-tighter mb-1 relative z-10">
                            {formatMoney(availableBalance)}
                        </div>
                        <p className="text-xs text-blue-300/80 font-medium">*Minimum withdrawal applies</p>
                    </div>

                    {/* Recent History */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#151d48] mb-4">Recent Requests</h3>
                        {history.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-400 font-medium">No recent withdrawals.</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                {item.status === 'approved' && <CheckCircle2 size={16} />}
                                                {item.status === 'rejected' && <XCircle size={16} />}
                                                {item.status === 'pending' && <Clock size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#151d48]">${parseFloat(item.amount).toFixed(2)}</p>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-0.5">{item.payment_method}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${item.status === 'approved' ? 'bg-green-50 text-green-600' :
                                            item.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                            {item.status}
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
