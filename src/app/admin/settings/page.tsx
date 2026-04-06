import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export default async function AdminSettingsPage() {
    const settings = await getSiteSettings();

    async function saveSettings(formData: FormData) {
        "use server";

        await updateSiteSettings({
            site_name: formData.get("site_name") as string,
            logo_url: formData.get("logo_url") as string,
            primary_color: formData.get("primary_color") as string,
            secondary_color: formData.get("secondary_color") as string,
            seo_title: formData.get("seo_title") as string || "MatClick",
            seo_description: formData.get("seo_description") as string || "Join our amazing platform.",
            enable_team_emails: formData.get("enable_team_emails") === "on",
            enable_direct_messages: formData.get("enable_direct_messages") === "on",
            enable_training_hub: formData.get("enable_training_hub") === "on",
            mailgun_api_key: formData.get("mailgun_api_key") as string,
            mailgun_domain: formData.get("mailgun_domain") as string,
            mailgun_from_email: formData.get("mailgun_from_email") as string,
            launch_date: formData.get("launch_date") ? new Date(formData.get("launch_date") as string).toISOString() : null,
            withdrawals_enabled: formData.get("withdrawals_enabled") === "on",
            next_in_line_enabled: formData.get("next_in_line_enabled") === "on",
            ptc_enabled: formData.get("ptc_enabled") === "on",
            matrix_enabled: formData.get("matrix_enabled") === "on",
            purchases_enabled: formData.get("purchases_enabled") === "on",
        });

        // Refresh all pages to instantly apply the new styles/branding globally
        revalidatePath("/", "layout");
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">White-Label Branding Settings</h1>

            <form action={saveSettings} className="bg-white shadow p-6 rounded-lg space-y-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Name</label>
                    <input
                        type="text"
                        name="site_name"
                        defaultValue={settings.site_name}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                    <input
                        type="text"
                        name="logo_url"
                        defaultValue={settings.logo_url || ""}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Primary Color (Hex)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                name="primary_color"
                                defaultValue={settings.primary_color}
                                className="h-10 w-10 border-0 p-0"
                            />
                            <input
                                type="text"
                                defaultValue={settings.primary_color}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Secondary Color (Hex)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                name="secondary_color"
                                defaultValue={settings.secondary_color}
                                className="h-10 w-10 border-0 p-0"
                            />
                            <input
                                type="text"
                                defaultValue={settings.secondary_color}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Search Engine Optimization (SEO)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SEO Title Tag</label>
                            <input
                                type="text"
                                name="seo_title"
                                defaultValue={settings.seo_title}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SEO Meta Description</label>
                            <textarea
                                name="seo_description"
                                defaultValue={settings.seo_description}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Mailgun Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mailgun API Key</label>
                            <input
                                type="password"
                                name="mailgun_api_key"
                                defaultValue={settings.mailgun_api_key || ""}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mailgun Domain</label>
                            <input
                                type="text"
                                name="mailgun_domain"
                                defaultValue={settings.mailgun_domain || ""}
                                placeholder="mg.yourdomain.com"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">From Email Address</label>
                            <input
                                type="email"
                                name="mailgun_from_email"
                                defaultValue={settings.mailgun_from_email || ""}
                                placeholder="notifications@matclick.com"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Launch Readiness & Controls</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Official Launch Date</label>
                        <input
                            type="datetime-local"
                            name="launch_date"
                            defaultValue={settings.launch_date ? new Date(settings.launch_date).toISOString().slice(0, 16) : ""}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Landing page will show a countdown until this time.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="withdrawals_enabled"
                                id="withdrawals_enabled"
                                defaultChecked={settings.withdrawals_enabled}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="withdrawals_enabled" className="text-sm font-medium text-gray-700">
                                Enable Withdrawals
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="next_in_line_enabled"
                                id="next_in_line_enabled"
                                defaultChecked={settings.next_in_line_enabled}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="next_in_line_enabled" className="text-sm font-medium text-gray-700">
                                Enable "Next in Line" Progress
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="ptc_enabled"
                                id="ptc_enabled"
                                defaultChecked={settings.ptc_enabled}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="ptc_enabled" className="text-sm font-medium text-gray-700">
                                Global PTC Activity
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="matrix_enabled"
                                id="matrix_enabled"
                                defaultChecked={settings.matrix_enabled}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="matrix_enabled" className="text-sm font-medium text-gray-700">
                                Global Matrix Activity
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="purchases_enabled"
                                id="purchases_enabled"
                                defaultChecked={settings.purchases_enabled}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="purchases_enabled" className="text-sm font-medium text-gray-700">
                                Global Level Purchases
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Communication & Features</h3>
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="enable_team_emails"
                            id="enable_team_emails"
                            defaultChecked={settings.enable_team_emails}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="enable_team_emails" className="text-sm font-medium text-gray-700">
                            Enable Team Emails (Allow sponsors to email downlines)
                        </label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="enable_direct_messages"
                            id="enable_direct_messages"
                            defaultChecked={settings.enable_direct_messages}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="enable_direct_messages" className="text-sm font-medium text-gray-700">
                            Enable Direct Messages (Allow peer-to-peer messaging)
                        </label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            name="enable_training_hub"
                            id="enable_training_hub"
                            defaultChecked={settings.enable_training_hub}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="enable_training_hub" className="text-sm font-medium text-gray-700">
                            Enable Referral Training Hub (Allow sponsors to share training)
                        </label>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
