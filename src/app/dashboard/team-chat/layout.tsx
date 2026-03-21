import { getSiteSettings } from "@/lib/settings";
import { redirect } from "next/navigation";

export default async function TeamChatLayout({ children }: { children: React.ReactNode }) {
    const settings = await getSiteSettings();
    if (settings && !settings.enable_team_chat_module) {
        redirect("/dashboard");
    }
    return <>{children}</>;
}
