"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const isDummy = supabaseUrl.includes("dummy") || !supabaseUrl || supabaseUrl.includes("localhost:54321");
    const client = createClient(supabaseUrl, supabaseAnonKey);

    let session;
    let authError;

    if (isDummy) {
        // Mock session for dummy mode
        session = {
            access_token: "mock-token",
            refresh_token: "mock-refresh-token",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            user: {
                id: "00000000-0000-0000-0000-000000000000",
                email: email,
            }
        };
        console.log("[Auth Action] Dummy Login Success:", email);
    } else {
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });
        session = data?.session;
        authError = error?.message;
    }

    if (authError) {
        return { error: authError };
    }

    if (session) {
        const cookieStore = cookies();
        const oneYear = 60 * 60 * 24 * 365;

        cookieStore.set("sb-access-token", session.access_token, {
            path: "/",
            maxAge: oneYear,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        cookieStore.set("sb-refresh-token", session.refresh_token!, {
            path: "/",
            maxAge: oneYear,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        redirect("/dashboard");
    }

    return { error: "Login failed. Please check your credentials." };
}

export async function logoutAction() {
    const cookieStore = cookies();
    cookieStore.delete("sb-access-token");
    cookieStore.delete("sb-refresh-token");
    cookieStore.delete("impersonated_user_id");

    const client = createClient(supabaseUrl, supabaseAnonKey);
    await client.auth.signOut();

    redirect("/auth/login");
}
