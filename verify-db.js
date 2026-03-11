const { postgres } = require('postgres');
require('dotenv').config({ path: '.env.local' });
const { db } = require('./src/lib/db');
const { ledger } = require('./src/lib/db/schema');
const { eq, inArray, and, desc } = require('drizzle-orm');

async function test() {
    try {
        const history = await db.select({
            id: ledger.id,
            amount: ledger.amount,
            type: ledger.type,
            created_at: ledger.created_at,
            reference_id: ledger.reference_id
        })
            .from(ledger)
            .where(
                and(
                    eq(ledger.user_id, '00000000-0000-0000-0000-000000000000'),
                    inArray(ledger.type, ['transfer_out', 'transfer_in'])
                )
            )
            .orderBy(desc(ledger.created_at))
            .limit(10);
        console.log("SUCCESS:", history);
    } catch (e) {
        console.error("EXACT ERROR:", e);
    }
}
test();
