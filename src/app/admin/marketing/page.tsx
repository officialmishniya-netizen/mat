import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export default async function AdminMarketingPage() {
    const { data: materials } = await supabase
        .from("marketing_materials")
        .select("*")
        .order("created_at", { ascending: false });

    async function createMaterial(formData: FormData) {
        "use server";

        const title = formData.get("title") as string;
        const type = formData.get("type") as string;
        const media_url = formData.get("media_url") as string;
        const target_url = formData.get("target_url") as string;
        const dimensions = formData.get("dimensions") as string;

        await supabase.from("marketing_materials").insert({
            title,
            type,
            media_url,
            target_url,
            dimensions,
            active: true
        });

        revalidatePath("/admin/marketing");
    }

    async function deleteMaterial(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        await supabase.from("marketing_materials").delete().eq("id", id);
        revalidatePath("/admin/marketing");
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 text-[#151d48]">
            <h1 className="text-3xl font-bold border-b pb-4">Marketing & Promotion Center</h1>
            <p className="text-gray-600 mb-6 font-medium">Upload banners and promotional text here. These will be automatically populated with the user's referral links in their Promo Dashboard.</p>

            {/* Create Banner Form */}
            <div className="bg-white p-6 shadow-sm rounded-2xl border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Add New Marketing Asset</h2>
                <form action={createMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Asset Title</label>
                        <input required type="text" name="title" placeholder="e.g. 468x60 Leaderboard" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Asset Type</label>
                        <select name="type" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                            <option value="banner">Image Banner (GIF, PNG, JPG)</option>
                            <option value="text">Text Ad / Link</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Media URL (Image source)</label>
                        <input type="text" name="media_url" placeholder="https://yourdomain.com/banners/468.gif" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Base Target URL (Optional)</label>
                        <input type="text" name="target_url" placeholder="Leave blank to use default site URL" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                        <p className="text-xs text-gray-500 mt-1">The system will automatically append ?ref=username to this URL.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Dimensions (Optional)</label>
                        <input type="text" name="dimensions" placeholder="e.g. 468x60" className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>

                    <div className="md:col-span-2 pt-4 border-t mt-2">
                        <button type="submit" className="w-full bg-[#f97316] text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-sm transition-colors">
                            Upload to Promotion Center
                        </button>
                    </div>
                </form>
            </div>

            {/* Existing Materials List */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden mt-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Active Marketing Materials</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Info</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {materials?.map((mat) => (
                                <tr key={mat.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-[#151d48]">{mat.title}</div>
                                        <div className="text-xs font-semibold text-gray-500 uppercase bg-gray-100 inline-block px-2 py-1 flex-1 rounded mt-1">{mat.type} {mat.dimensions ? `- ${mat.dimensions}` : ''}</div>
                                        <div className="text-xs text-gray-400 mt-2 truncate w-48" title={mat.media_url}>{mat.media_url}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {mat.type === 'banner' && mat.media_url ? (
                                            <div className="border border-gray-200 p-1 1bg-gray-50 rounded-lg max-w-xs overflow-hidden flex items-center justify-center min-h-[60px]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={mat.media_url} alt={mat.title} className="max-h-24 max-w-full object-contain" />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">Text Link</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <form action={deleteMaterial}>
                                            <input type="hidden" name="id" value={mat.id} />
                                            <button type="submit" className="text-red-600 hover:text-red-900 font-bold bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition-colors">
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {(!materials || materials.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm font-medium text-gray-500">
                                        No promotional materials uploaded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
