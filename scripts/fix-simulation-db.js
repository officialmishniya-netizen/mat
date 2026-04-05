const postgres = require('postgres');

const connectionString = "postgresql://postgres:gAh9eyGbflDZaU9M@db.ziaoqtmmdwjbbqghkpda.supabase.co:5432/postgres";

const sql = postgres(connectionString);

async function fix() {
    try {
        console.log("Checking and creating simulation_runs table...");
        await sql`
            CREATE TABLE IF NOT EXISTS simulation_runs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                config JSONB NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                logs JSONB NOT NULL DEFAULT '[]',
                report JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
        `;
        console.log("Table 'simulation_runs' created successfully.");
    } catch (e) {
        console.error("Failed to create table:", e);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

fix();
