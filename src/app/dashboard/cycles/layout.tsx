import { getSiteSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function CyclesLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    if (settings && !settings.enable_ptc_module) {
        redirect("/dashboard");
    }
    return <>{children}</>;
}
