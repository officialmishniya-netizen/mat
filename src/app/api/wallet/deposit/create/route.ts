import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSiteSettings } from '@/lib/settings';

export async function POST(req: Request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, coin } = await req.json();

        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (!coin) {
            return NextResponse.json({ error: 'Please select a currency' }, { status: 400 });
        }

        const settings = await getSiteSettings();
        const apiKey = settings.nowpayments_api_key;

        // In local development or if API key is missing, return a mock response
        if (!apiKey || apiKey === 'MOCK_KEY') {
            console.log('Using Mock NOWPayments Response (API Key Missing or Local)');
            return NextResponse.json({
                payment_id: 'mock_' + Date.now(),
                pay_address: '0xMockWalletAddressFor' + coin,
                pay_amount: (amount / 1).toFixed(8), // Mock exchange rate 1:1 for simplicity
                pay_currency: coin,
                price_amount: amount,
                price_currency: 'usd',
                payment_status: 'waiting'
            });
        }

        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: coin,
                ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
                order_id: session.user.id,
                order_description: `Deposit to Purchase Balance`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('NOWPayments API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to create payment' }, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[Deposit API Error]', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
