const postgres = require('postgres');
const fs = require('fs');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');

async function test() {
    try {
        const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'`;
        fs.writeFileSync('users_cols.json', JSON.stringify(res, null, 2));
    } catch (e) {
        fs.writeFileSync('users_cols.json', e.message);
    } finally {
        process.exit(0);
    }
}
test();
