import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ShoutboxClient from "./ShoutboxClient";

export const metadata = {
    title: "Community Shoutbox | Earn with the Ultimate Matrix"
};

export default async function ShoutboxPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const impersonateCookie = cookies().get('impersonated_user_id');
    const effectiveUserId = impersonateCookie?.value || session.user.id;

    return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-120px)] flex flex-col">
            <ShoutboxClient currentUserId={effectiveUserId} />
        </div>
    );
}
