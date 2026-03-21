const postgres = require('postgres');
const connectionString = "postgresql://postgres:gAh9eyGbflDZaU9M@db.ziaoqtmmdwjbbqghkpda.supabase.co:5432/postgres";
const sql = postgres(connectionString);

async function check() {
    try {
        console.log("Checking tables...");
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        console.log("Tables found:");
        tables.forEach(t => console.log(` - ${t.table_name}`));
        
        const simRunTable = tables.find(t => t.table_name === 'simulation_runs');
        if (simRunTable) {
            console.log("\nFOUND simulation_runs table!");
        } else {
            console.log("\nNOT FOUND: simulation_runs table is missing from public schema.");
        }
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

check();
