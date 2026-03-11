const postgres = require('postgres');
const fs = require('fs');

const sqlFile = fs.readFileSync('./drizzle/0000_rapid_hercules.sql', 'utf8');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres', { max: 1 });

async function migrate() {
    try {
        console.log("Executing migration schema...");
        await sql.unsafe(sqlFile);
        console.log("Migration successful");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        process.exit(0);
    }
}
migrate();
