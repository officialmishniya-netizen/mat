"use server";

import { createServerSupabaseClient as createClient } from "@/lib/supabase-server";
import { getSiteSettings } from "@/lib/settings";
import { getUserBalance, createLedgerEntry } from "@/lib/ledger";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { withdrawals, ledger } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Decimal from "decimal.js";

/**
 * Initiates a deposit via NOWPayments
 */
export async function initiateDepositAction(formData: FormData) {
    const amount = formData.get("amount") as string;
    const coin = "USDTTRC20"; // Defaulting or could be passed from form

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 5) {
        return { error: "Minimum deposit is $5.00" };
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Unauthorized" };

    try {
        const settings = await getSiteSettings();
        const apiKey = settings.nowpayments_api_key;

        if (!apiKey) {
            return { error: "Payment gateway is not configured. Please contact support." };
        }

        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price_amount: parseFloat(amount),
                price_currency: 'usd',
                pay_currency: coin,
                ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
                order_id: session.user.id,
                order_description: `Deposit to MatClick Balance`,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('NOWPayments API Error:', data);
            return { error: data.message || 'Failed to create payment' };
        }

        // Redirect to the payment URL provided by NOWPayments
        if (data.invoice_url) {
            redirect(data.invoice_url);
        } else if (data.payment_id) {
            // Some NOWPayments flows return payment_id and address instead of invoice_url 
            // but for MatClick we usually expect invoice_url or we can show a success page.
            return { success: true, paymentId: data.payment_id };
        }

        return { error: "Unexpected response from payment gateway." };
    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT') throw error;
        console.error('[initiateDepositAction Error]', error);
        return { error: "Internal Server Error" };
    }
}

/**
 * Requests a withdrawal
 */
export async function requestWithdrawalAction(formData: FormData) {
    const amountStr = formData.get("amount") as string;
    const address = formData.get("address") as string;

    if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
        return { error: "Invalid amount" };
    }

    if (!address || address.length < 10) {
        return { error: "Invalid wallet address" };
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Unauthorized" };

    const userId = session.user.id;

    try {
        const balance = await getUserBalance(userId);
        const amount = new Decimal(amountStr);

        if (amount.gt(balance)) {
            return { error: "Insufficient balance" };
        }

        // Use a transaction to ensure both withdrawal record and ledger entry are created
        await db.transaction(async (tx) => {
            // 1. Create Withdrawal Record
            const [withdrawal] = await tx.insert(withdrawals).values({
                user_id: userId,
                amount: amount.toFixed(2),
                status: 'pending',
                payment_method: 'USDTTRC20',
                details: address,
            } as any).returning();

            // 2. Deduct from Ledger (mark as withdrawal)
            await tx.insert(ledger).values({
                user_id: userId,
                amount: amount.negated().toFixed(2),
                type: 'withdrawal',
                reference_id: withdrawal.id,
            } as any);
        });

        return { success: true };
    } catch (error: any) {
        console.error('[requestWithdrawalAction Error]', error);
        return { error: "Failed to process withdrawal request. Please try again." };
    }
}
