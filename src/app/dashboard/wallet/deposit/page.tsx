import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserBalance } from "@/lib/ledger";
import DepositForm from "./DepositForm";
import { Wallet, Clock, ArrowDownLeft, Info } from "lucide-react";
import { formatMoney } from "@/lib/money";

export const metadata = {
    title: "Deposit Balance | Earn with the Ultimate Matrix"
};

export default async function DepositPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    // Fetch Current Purchase Balance (implied by types or standard balance)
    // Note: Purchase balance is typically tracking ledger entries of type 'deposit' or 'transfer_in' specifically if they go to purchase e-wallet
    // For this context, we show general balance or filter for purchase wallet balance if stored separately
    const balance = await getUserBalance(effectiveUserId);

    // Fetch Deposit History
    const { data: historyData } = await supabase
        .from('ledger')
        .select('id, amount, type, created_at, reference_id')
        .eq('user_id', effectiveUserId)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);

    const history = historyData || [];

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#151d48] tracking-tight">Deposit Balance</h1>
                    <p className="text-[#737791] font-medium text-sm mt-1">Add funds to your Purchase Balance via Crypto.</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100/50">
                    <Info size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Instant after confirmation</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <DepositForm />
                    </div>
                </div>

                {/* Right Col: Info & History */}
                <div className="space-y-6">
                    {/* Purchase Balance Card */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[32px] p-6 shadow-xl shadow-green-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={20} className="text-white" />
                            </div>
                            <h3 className="font-bold text-green-50">Current Balance</h3>
                        </div>
                        <div className="text-4xl font-black tracking-tighter mb-1 relative z-10">
                            {formatMoney(balance)}
                        </div>
                        <p className="text-xs text-green-100/80 font-medium">*Accessible for matrix and ad credit purchases.</p>
                    </div>

                    {/* Recent History */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-[#151d48] mb-4">Deposit History</h3>
                        {history.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-400 font-medium">No recent deposits.</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                                                <ArrowDownLeft size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#151d48]">
                                                    +{parseFloat(item.amount).toFixed(2)}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-0.5">
                                                    Deposit
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#151d48] px-2 py-1 rounded-md bg-green-50 border border-green-100 mb-1">
                                                Success
                                            </span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Clock size={8} className="inline mr-1 mb-[2px]" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
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
