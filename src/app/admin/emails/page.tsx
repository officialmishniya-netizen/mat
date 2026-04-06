import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export default async function AdminEmailTemplatesPage() {
    const supabase = await createServerSupabaseClient();
    const { data: templates } = await supabase
        .from("email_templates")
        .select("*")
        .order("slug", { ascending: true });

    async function updateTemplate(formData: FormData) {
        "use server";
        const supabase = await createServerSupabaseClient();
        const id = formData.get("id");
        const subject = formData.get("subject");
        const body = formData.get("body");

        await supabase
            .from("email_templates")
            .update({ subject, body })
            .eq("id", id);

        revalidatePath("/admin/emails");
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
                <p className="text-sm text-gray-500">Manage automated system emails and their content.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {templates?.map((template) => (
                    <div key={template.id} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Template: {template.slug}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">System Auto-Mail</span>
                        </div>
                        <form action={updateTemplate} className="p-6 space-y-4">
                            <input type="hidden" name="id" value={template.id} />
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subject Line</label>
                                <input
                                    name="subject"
                                    defaultValue={template.subject}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email Body (HTML Supported)</label>
                                <textarea
                                    name="body"
                                    defaultValue={template.body}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium font-mono text-sm"
                                />
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-[10px] text-gray-400 font-medium">Use tags like <code className="bg-gray-100 px-1 rounded">{"{username}"}</code>, <code className="bg-gray-100 px-1 rounded">{"{amount}"}</code> in the body.</p>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#151d48] text-white rounded-xl font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-blue-900/10"
                                >
                                    Update Template
                                </button>
                            </div>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
