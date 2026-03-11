import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, ledger } from "@/lib/db/schema";
import { getUserBalance } from "@/lib/ledger";
import { eq } from "drizzle-orm";
import { toMoney } from "@/lib/money";
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { amount, recipient } = await req.json();

        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
        }

        if (!recipient) {
            return NextResponse.json({ error: "Valid recipient username is required." }, { status: 400 });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

        const impersonateCookie = cookies().get("impersonated_user_id");
        const effectiveUserId = impersonateCookie?.value || session.user.id;

        // 1. Validate Sender Balance
        const balance = await getUserBalance(effectiveUserId);
        if (amount > parseFloat(balance)) {
            return NextResponse.json({ error: "Insufficient sendable balance." }, { status: 400 });
        }

        // 2. Find Recipient
        const targetUsers = await db.select({ id: users.id })
            .from(users)
            .where(eq(users.username, recipient))
            .limit(1);

        if (targetUsers.length === 0) {
            return NextResponse.json({ error: "Recipient username not found." }, { status: 404 });
        }

        const targetUserId = targetUsers[0].id;

        if (targetUserId === effectiveUserId) {
            return NextResponse.json({ error: "You cannot transfer funds to yourself." }, { status: 400 });
        }

        // Generate unique reference for this transfer pair
        const transferRef = `TR_${crypto.randomBytes(6).toString('hex')}`;

        // 3. Atomically Execute Transfer
        await db.transaction(async (tx) => {
            // A. Deduct from Sender (Available Balance)
            await tx.insert(ledger).values({
                user_id: effectiveUserId,
                amount: `-${toMoney(amount).toFixed(4)}`, // Negative for out
                type: "transfer_out",
                reference_id: transferRef
            });

            // B. Credit to Recipient (Purchase Balance)
            // Note: We credit it as 'transfer_in'. Because 'getPurchaseBalance' in ledger.ts 
            // currently only sums 'deposit' and 'matrix_purchase'. We need to update getPurchaseBalance!
            // Wait, we can just log it as a 'deposit' with a specific reference, or update the ledger utility.
            // Using 'transfer_in' is cleaner natively.
            await tx.insert(ledger).values({
                user_id: targetUserId,
                amount: toMoney(amount).toFixed(4),
                type: "transfer_in",
                reference_id: transferRef
            });
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
