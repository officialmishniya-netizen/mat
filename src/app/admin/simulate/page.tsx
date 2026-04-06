"use client";

import { useState } from "react";

export default function SimulationPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runSimulation = async () => {
        setLoading(true);
        setError("");
        setResults(null);
        setLogs(["Initializing simulation engine..."]);

        try {
            const res = await fetch("/api/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ count: 500 }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Simulation failed");
            }

            setLogs(data.logs);
            setResults(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Simulation Engine</h1>
            <p className="text-gray-600">
                Run a high-stress simulation to generate 500 fake users, trigger ad watches, and run them through the auto-fill matrix.
                The engine will rigorously verify that not a single cent is lost to floating point errors.
            </p>

            <div className="bg-white p-6 shadow rounded-lg border-t-4 border-primary">
                <button
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-xl disabled:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-red-300"
                >
                    {loading ? "Running Deep Simulation..." : "LAUNCH SIMULATION (500 USERS)"}
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded font-mono font-bold">
                        FLARED ERROR: {error}
                    </div>
                )}

                {results && (
                    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                        <h2 className="text-2xl font-bold text-green-800 mb-4">Integrity Check Passed</h2>
                        <div className="grid grid-cols-2 gap-4 text-green-900 font-mono">
                            <div>Total Generated:</div>
                            <div className="font-bold text-right">${parseFloat(results.platform_profit) + parseFloat(results.user_liability)}</div>
                            <div>Platform Profit:</div>
                            <div className="font-bold text-right">${results.platform_profit}</div>
                            <div>User Liability (Ledger Sum):</div>
                            <div className="font-bold text-right">${results.user_liability}</div>
                        </div>
                    </div>
                )}

                <div className="mt-6 bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                    <h3 className="text-green-400 font-mono text-sm border-b border-gray-700 pb-2 mb-2">Engine Console OUTPUT</h3>
                    {logs.map((log, i) => (
                        <div key={i} className="text-green-300 font-mono text-xs mb-1">
                            &gt; {log}
                        </div>
                    ))}
                    {!loading && logs.length === 0 && (
                        <div className="text-gray-600 font-mono text-xs">Awaiting execution...</div>
                    )}
                    {loading && (
                        <div className="text-yellow-400 font-mono text-xs animate-pulse">
                            &gt; Processing matrix multi-level cycler allocations...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
