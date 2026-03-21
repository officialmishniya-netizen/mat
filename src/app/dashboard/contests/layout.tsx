import { getSiteSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function ContestsLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    if (settings && !settings.enable_contests_module) {
        redirect("/dashboard");
    }
    return <>{children}</>;
}
