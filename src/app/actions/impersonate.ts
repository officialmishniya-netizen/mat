"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Starts an impersonation session by setting an override cookie.
 * In a real production app, ensure the caller is verified as an Admin first.
 */
export async function startImpersonation(formData: FormData) {
    const targetUserId = formData.get("user_id") as string;

    if (!targetUserId) {
        throw new Error("Missing user_id");
    }

    // Verify the user exists
    const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("id", targetUserId)
        .single();

    if (!user) {
        throw new Error("User not found");
    }

    // Set the override cookie
    // (Assuming admin auth is verified elsewhere in layout/middleware)
    cookies().set("impersonated_user_id", targetUserId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60, // 1 hour impersonation limit
    });

    redirect("/dashboard"); // Redirect to the user panel
}

/**
 * Stops an impersonation session by deleting the cookie.
 */
export async function stopImpersonation() {
    cookies().delete("impersonated_user_id");
    redirect("/admin");
}

/**
 * Helper to get the effective user ID (either impersonated or real)
 * This should be used anywhere you need the "current user" in the User Panel.
 */
export async function getEffectiveUserId(realUserId: string): Promise<string> {
    const impersonateCookie = cookies().get("impersonated_user_id");
    return impersonateCookie?.value || realUserId;
}

/**
 * Requires auth session and returns the effective user ID (handling impersonation).
 * Redirects to login if no session is active.
 */
export async function requireImpersonationOrAuth(): Promise<string> {
    const supabaseServer = await createServerSupabaseClient();
    const { data: { session } } = await supabaseServer.auth.getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return await getEffectiveUserId(session.user.id);
}
