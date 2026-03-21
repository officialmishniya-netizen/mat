import { getSiteSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function AchievementsLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    if (settings && !settings.enable_achievements_module) {
        redirect("/dashboard");
    }
    return <>{children}</>;
}
