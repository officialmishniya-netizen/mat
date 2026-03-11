import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { getUserBalance } from "@/lib/ledger";
import { formatMoney } from "@/lib/money";
import { redirect } from "next/navigation";

export default async function WalletPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    const balance = await getUserBalance(effectiveUserId);

    // Fetch recent Ledger transactions for Wallet history
    const { data: transactions } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", effectiveUserId)
        .in("type", ["deposit", "withdrawal"])
        .order("created_at", { ascending: false });

    // Placeholder actions for NowPayments
    async function initiateDeposit(formData: FormData) {
        "use server";
        const amount = formData.get("amount");
        // 1. Fetch NowPayments API Key from settings
        // 2. Call NowPayments API `POST https://api.nowpayments.io/v1/invoice`
        // 3. Insert pending deposit row
        // 4. Redirect user to `invoice_url`
        console.log("Mock Deposit Initiated:", amount);
    }

    async function requestWithdrawal(formData: FormData) {
        "use server";
        const amount = formData.get("amount");
        const address = formData.get("address");
        // 1. Check if balance >= amount
        // 2. Insert into Ledger as negative 'withdrawal'
        // 3. Ping NowPayments API for payout OR flag for Admin Manual Review
        console.log("Mock Withdrawal Requested:", amount, address);
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Wallet & Finances</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Deposit */}
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Deposit Crypto</h2>
                    <p className="text-sm text-gray-500 mb-6">Fund your account using any major cryptocurrency via NowPayments.</p>

                    <form action={initiateDeposit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (USD)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    min="5"
                                    defaultValue="10.00"
                                    step="0.01"
                                    className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                            Generate Payment Link
                        </button>
                    </form>
                </div>

                {/* Withdrawal */}
                <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Withdraw Funds</h2>
                    <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                        <span className="text-gray-600">Available Balance</span>
                        <span className="text-2xl font-bold text-primary">{formatMoney(balance)}</span>
                    </div>

                    <form action={requestWithdrawal} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount to Withdraw (USD)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    max={Number(balance)}
                                    step="0.01"
                                    className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Wallet Address (USDT TRC20)</label>
                            <input
                                type="text"
                                name="address"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="T..."
                            />
                        </div>
                        <button type="submit" className="w-full border-2 border-primary text-primary font-bold py-3 rounded-lg hover:bg-orange-50">
                            Request Withdrawal
                        </button>
                    </form>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden mt-8">
                <div className="bg-gray-50 px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-900">External Transactions</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {transactions?.map((t) => (
                        <li key={t.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{t.type}</dt>
                                <dd className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString()}</dd>
                            </div>
                            <div className={`text-lg font-mono font-bold ${Number(t.amount) >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                {Number(t.amount) > 0 ? '+' : ''}{formatMoney(t.amount)}
                            </div>
                        </li>
                    ))}
                    {(!transactions || transactions.length === 0) && (
                        <li className="p-8 text-center text-gray-500 text-sm">No deposits or withdrawals yet.</li>
                    )}
                </ul>
            </div>

        </div>
    );
}
