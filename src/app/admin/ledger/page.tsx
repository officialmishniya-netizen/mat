import { Wallet } from "lucide-react";

export default function AdminLedgerPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center space-x-4 border-b pb-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <Wallet size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Master Ledger</h1>
                    <p className="text-gray-500 font-medium">View and audit all system transactions across the entire platform.</p>
                </div>
            </div>

            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center shadow-sm">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ledger System Initializing</h3>
                <p className="text-gray-500 font-medium max-w-md mx-auto">This module is being wired to the live database. Detailed transaction filtering and CSV exports will be available here soon.</p>
            </div>
        </div>
    );
}
