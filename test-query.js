const postgres = require('postgres');
const fs = require('fs');
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');

async function test() {
    try {
        const res = await sql.unsafe(`select "users"."id", "users"."username", "users"."email", "users"."role", "users"."created_at", "user_account_status"."status", "user_account_status"."is_frozen", "user_account_status"."is_banned", "user_account_status"."is_deleted", "user_account_status"."risk_score", COALESCE((SELECT SUM(amount) FROM ledger WHERE user_id = users.id), 0) from "users" left join "user_account_status" on "users"."id" = "user_account_status"."user_id" order by "users"."created_at" desc limit 1`);
    } catch (e) {
        fs.writeFileSync('query_err.txt', e.message);
    } finally {
        process.exit(0);
    }
}
test();
