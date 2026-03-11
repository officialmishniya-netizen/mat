import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { createLedgerEntry } from '@/lib/ledger';

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const headers = req.headers;
        const signature = headers.get('x-nowpayments-sig');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // 1. Verify NowPayments Signature
        // Process requires the IPN Secret key set in the dashboard
        const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || 'MOCK_SECRET_FOR_BUILD';
        const hmac = crypto.createHmac('sha512', ipnSecret);
        hmac.update(rawBody);
        const calculatedSignature = hmac.digest('hex');

        if (signature !== calculatedSignature && process.env.NODE_ENV === 'production') {
            console.error("Invalid NowPayments webhook signature.");
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        const payload = JSON.parse(rawBody);

        // 2. Process Successful Payment
        if (payload.payment_status === 'finished') {

            // We assume order_id was set to the user_id during deposit initiation
            const userId = payload.order_id;
            const amountUsd = payload.actually_paid_fiat; // Or payload.price_amount depending on config

            if (!userId || !amountUsd) {
                throw new Error("Missing critical payload data (order_id or fiat amount)");
            }

            // Check if transaction was already processed
            const { data: existingTx } = await supabase
                .from('ledger')
                .select('id')
                .eq('reference_id', payload.payment_id.toString())
                .single();

            if (!existingTx) {
                // The Ledger Rule - Insert securely
                await createLedgerEntry(userId, amountUsd, 'deposit', payload.payment_id.toString());
                console.log(`[NowPayments Webhook] Successfully credited $${amountUsd} to user ${userId}`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[NowPayments Webhook Error]', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
