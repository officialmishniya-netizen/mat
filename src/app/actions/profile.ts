"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return { error: "Unauthorized" };

    const full_name = formData.get("full_name") as string;
    const phone = formData.get("phone") as string;
    const btc_address = formData.get("btc_address") as string;
    const ltc_address = formData.get("ltc_address") as string;
    const trx_address = formData.get("trx_address") as string;
    const usdt_trc20_address = formData.get("usdt_trc20_address") as string;
    const email = formData.get("email") as string;
    const email_notifications_enabled = formData.get("email_notifications_enabled") === "true";

    const { error } = await supabase
        .from("users")
        .update({
            full_name,
            phone,
            btc_address,
            ltc_address,
            trx_address,
            usdt_trc20_address,
            email,
            email_notifications_enabled,
        })
        .eq("id", session.user.id);

    if (error) {
        console.error("Profile update error:", error);
        return { error: "Failed to update profile." };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return { error: "Unauthorized" };

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    if (password.length < 6) {
        return { error: "Password must be at least 6 characters." };
    }

    // Check if we are in dummy mode (localhost:54321)
    const isDummy = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes("localhost:54321");

    if (isDummy) {
        console.log("[Auth Action] Dummy Password Update Success");
        return { success: true };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error("Password update error:", error);
        return { error: error.message };
    }

    return { success: true };
}
