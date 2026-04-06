"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

const execPromise = promisify(exec);

export async function syncDatabaseSchema() {
    try {
        // Run drizzle-kit push using npx
        // We assume DATABASE_URL is in the environment
        const { stdout, stderr } = await execPromise("npx drizzle-kit push");
        console.log("Sync Stdout:", stdout);
        if (stderr) console.warn("Sync Stderr:", stderr);

        return { success: true, message: "Database schema synced successfully.", output: stdout };
    } catch (error: any) {
        console.error("Schema Sync Failed:", error);
        return { success: false, message: "Sync failed: " + error.message };
    }
}

export async function verifyDatabaseIntegrity() {
    try {
        const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        const tables = (result as any).rows.map((r: any) => r.table_name);

        const requiredTables = [
            'users', 'settings', 'ledger', 'matrix_positions', 'ad_levels',
            'user_ad_levels', 'simulation_runs', 'tickets', 'withdrawals'
        ];

        const missing = requiredTables.filter(t => !tables.includes(t));

        if (missing.length > 0) {
            return { success: false, message: "System check failed. Missing tables: " + missing.join(", ") };
        }

        return { success: true, message: "All core tables verified (200 OK)." };
    } catch (error: any) {
        return { success: false, message: "Check failed: " + error.message };
    }
}
