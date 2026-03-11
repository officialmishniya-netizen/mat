import { supabase } from "@/lib/supabase";
import { getUserBalance } from "@/lib/ledger";
import { formatMoney } from "@/lib/money";
import Link from "next/link";

export default async function UserAuditPage({ params }: { params: { userId: string } }) {
    const userId = params.userId;

    // 1. Fetch User Data
    const { data: user } = await supabase.from("users").select("*").eq("id", userId).single();

    // 2. Compute TRUE Real-time Balance from Ledger
    const trueBalance = await getUserBalance(userId);

    // 3. Fetch Full Ledger History (Replay)
    const { data: ledgerRows } = await supabase
        .from("ledger")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    // 4. Fetch Ad View History & IPs
    const { data: adViews } = await supabase
        .from("ad_views")
        .select("*, ads(title, reward)")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

    if (!user) {
        return <div className="p-8">User not found</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Deep Audit: {user.username}</h1>
                <Link href="/admin/users" className="text-primary hover:underline">&larr; Back to Users</Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-primary">
                <h2 className="text-xl font-bold mb-2">Financial Integrity Check</h2>
                <div className="text-4xl font-mono text-green-600">
                    True Balance: {formatMoney(trueBalance)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    This balance is strictly computed dynamically from {ledgerRows?.length || 0} ledger transactions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Ledger Replay */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                        <h3 className="text-lg font-bold text-gray-700">Ledger Replay</h3>
                    </div>
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {ledgerRows?.map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 uppercase">
                                        {entry.type}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(entry.created_at).toLocaleString()}</div>
                                    {entry.reference_id && <div className="text-xs text-gray-500">Ref: {entry.reference_id}</div>}
                                </div>
                                <div className={`font-mono font-bold ${Number(entry.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Number(entry.amount) > 0 ? '+' : ''}{entry.amount}
                                </div>
                            </div>
                        ))}
                        {(!ledgerRows || ledgerRows.length === 0) && <p className="text-sm text-gray-500">No ledger history.</p>}
                    </div>
                </div>

                {/* Ad View Logs */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b">
                        <h3 className="text-lg font-bold text-gray-700">Ad Click Logs & IPs</h3>
                    </div>
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                        {adViews?.map((view) => (
                            <div key={view.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                    <span className="font-medium text-sm text-gray-900">{view.ads?.title || 'Unknown Ad'}</span>
                                    <span className="text-sm font-mono text-primary text-green-600">+{view.ads?.reward}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs bg-gray-100 px-1 rounded font-mono">{view.ip_address || 'IP missing'}</span>
                                    <span className="text-xs text-gray-400">{new Date(view.completed_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                        {(!adViews || adViews.length === 0) && <p className="text-sm text-gray-500">No ad views recorded.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
