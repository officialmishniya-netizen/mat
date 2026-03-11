import { createHmac } from 'crypto';

const SYSTEM_SECRET = process.env.RECEIPT_SECRET || 'fallback-secret-for-dev';

/**
 * GENERATE RECEIPT PROOF
 * Generates a cryptographic HMAC-SHA256 signature for a ledger entry.
 * This signature is chained to the previous entry's signature for immutability.
 */
export function generateReceiptProof(entry: {
    user_id: string;
    amount: string;
    type: string;
    timestamp: string;
    prev_signature?: string;
}) {
    const payload = JSON.stringify({
        u: entry.user_id,
        a: entry.amount,
        t: entry.type,
        s: entry.timestamp,
        p: entry.prev_signature || 'genesis'
    });

    return createHmac('sha256', SYSTEM_SECRET)
        .update(payload)
        .digest('hex');
}

/**
 * VERIFY RECEIPT PROOF
 */
export function verifyReceiptProof(entry: any, signature: string) {
    const expected = generateReceiptProof(entry);
    return expected === signature;
}
