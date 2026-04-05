const postgres = require('postgres');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');

async function test() {
    try {
        const res = await sql`SELECT * FROM public.users LIMIT 1`;
        console.log(res);
    } catch (e) {
        console.log(e.message);
    } finally {
        process.exit(0);
    }
}
test();
