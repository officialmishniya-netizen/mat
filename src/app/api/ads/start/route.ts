import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { ad_id } = await req.json();

        // 1. Get User Session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const impersonateCookie = cookies().get("impersonated_user_id");
        const effectiveUserId = impersonateCookie?.value || session.user.id;

        // 2. Validate Ad
        const { data: ad } = await supabase.from("ads").select("*").eq("id", ad_id).single();
        if (!ad || !ad.active) return NextResponse.json({ error: "Invalid or inactive Ad" }, { status: 400 });

        // 3. Security: Check global limit
        if (ad.global_limit !== null && ad.total_views >= ad.global_limit) {
            return NextResponse.json({ error: "This Ad has reached its global budget limit." }, { status: 403 });
        }

        // 4. Security: Check cooldown & daily limit
        const midnight = new Date();
        midnight.setHours(0, 0, 0, 0);

        const { data: recentViews } = await supabase
            .from("ad_views")
            .select("completed_at")
            .eq("user_id", effectiveUserId)
            .eq("ad_id", ad.id)
            .order("completed_at", { ascending: false });

        if (recentViews && recentViews.length > 0) {
            const lastView = new Date(recentViews[0].completed_at);
            const secondsSinceLastView = (new Date().getTime() - lastView.getTime()) / 1000;

            if (secondsSinceLastView < ad.cooldown) {
                return NextResponse.json({ error: "Cooldown active. You watched this too recently." }, { status: 403 });
            }

            // Check daily limit if it exists
            if (ad.daily_limit !== null && ad.daily_limit > 0) {
                const viewsToday = recentViews.filter(v => new Date(v.completed_at) >= midnight).length;
                if (viewsToday >= ad.daily_limit) {
                    return NextResponse.json({ error: "You reached your daily limit for this specific ad." }, { status: 403 });
                }
            }
        }

        // 5. Generate One-Time Secret Token (Expires naturally but securely ties this user to this Ad start)
        const payload = {
            userId: effectiveUserId,
            adId: ad.id,
            startedAt: Date.now(),
            durationSeconds: ad.duration
        };

        const payloadStr = JSON.stringify(payload);
        const payloadB64 = Buffer.from(payloadStr).toString('base64url');

        // Use an environment secret to sign it, or fallback locally
        const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dev-secret-key';
        const signature = crypto.createHmac('sha256', secretKey).update(payloadB64).digest('base64url');

        const token = `${payloadB64}.${signature}`;

        return NextResponse.json({ success: true, token });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
