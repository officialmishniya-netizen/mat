import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { withdrawals, ledger } from "@/lib/db/schema";
import { getUserBalance } from "@/lib/ledger";
import { toMoney } from "@/lib/money";

import { getSiteSettings } from "@/lib/settings";

export async function POST(req: Request) {
    try {
        const settings = await getSiteSettings();
        if (!settings.withdrawals_enabled) {
            return NextResponse.json({ error: "Withdrawals are currently disabled." }, { status: 403 });
        }

        const { amount, method, details } = await req.json();

        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
        }

        if (!method || !details) {
            return NextResponse.json({ error: "Missing payment method or details." }, { status: 400 });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const impersonateCookie = cookies().get("impersonated_user_id");
        const effectiveUserId = impersonateCookie?.value || session.user.id;

        // Verify balance
        const balance = await getUserBalance(effectiveUserId);
        if (amount > parseFloat(balance)) {
            return NextResponse.json({ error: "Insufficient available balance." }, { status: 400 });
        }

        await db.transaction(async (tx) => {
            // 1. Create Withdrawal Record
            const [newWithdrawal] = await tx.insert(withdrawals).values({
                user_id: effectiveUserId,
                amount: toMoney(amount).toFixed(4),
                payment_method: method,
                details: details,
                status: "pending"
            }).returning();

            // 2. Deduct from Ledger immediately
            await tx.insert(ledger).values({
                user_id: effectiveUserId,
                amount: `-${toMoney(amount).toFixed(4)}`, // Negative for out
                type: "withdrawal",
                reference_id: newWithdrawal.id
            });
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
