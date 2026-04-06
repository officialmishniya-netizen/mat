import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function checkTables() {
    try {
        const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables in public schema:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Database error:", error);
    }
    process.exit(0);
}

checkTables();
