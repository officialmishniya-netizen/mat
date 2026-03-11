import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import ProfileForm from "./ProfileForm";

export const metadata = {
    title: "My Profile | Earn with the Ultimate Matrix"
};

export default async function ProfilePage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", effectiveUserId)
        .single();

    if (!user) {
        return <div className="p-8 text-center font-bold text-red-500">Profile not found.</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-[#151d48] tracking-tighter">My Profile</h1>
                <p className="text-[#737791] font-bold text-sm mt-1 uppercase tracking-widest">Manage your personal settings and withdrawal wallets</p>
            </div>

            <ProfileForm user={user} />
        </div>
    );
}
