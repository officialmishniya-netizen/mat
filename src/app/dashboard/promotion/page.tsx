import { supabase } from "@/lib/supabase";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { CopyButton } from "./CopyButton";

export default async function PromotionCenterPage() {
    // 1. Get the current user for their referral username
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return <div>Unauthorized</div>;

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    const { data: user } = await supabase
        .from("users")
        .select("username")
        .eq("id", effectiveUserId)
        .single();

    if (!user) return <div>User profile not found.</div>;

    const username = user.username;
    // Assuming the site runs on the host domain, we can use a relative or placeholder absolute URL
    // For local dev / production, ideally this comes from environment variables.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const defaultRefUrl = `${baseUrl}/r/${username}`;

    // 2. Fetch all active marketing materials uploaded by Admin
    const { data: materials } = await supabase
        .from("marketing_materials")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-8 rounded-2xl shadow-sm text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                <h1 className="text-3xl font-bold mb-2">Promotion Center</h1>
                <p className="text-orange-100 max-w-2xl font-medium">
                    Expand your network! Share your unique referral link or embed these high-converting animated .gif banners on your social media, forums, or traffic exchanges.
                </p>
            </div>

            {/* Direct Link Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#151d48] mb-4">Your Primary Referral Link</h2>
                <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
                    <div className="bg-gray-50 px-4 py-3 border-r border-gray-200 flex items-center justify-center text-gray-500 font-medium">Link</div>
                    <input
                        readOnly
                        value={defaultRefUrl}
                        className="flex-1 px-4 py-3 focus:outline-none text-gray-700 font-medium"
                    />
                    <CopyButton textToCopy={defaultRefUrl} />
                </div>
            </div>

            {/* Marketing Materials */}
            <h2 className="text-2xl font-bold text-[#151d48] mt-8 mb-4 border-b pb-2">Advertising Banners (.gif & images)</h2>

            <div className="grid grid-cols-1 gap-8">
                {materials?.filter(m => m.type === 'banner').map((mat) => {
                    const targetUrl = defaultRefUrl; // Simplified but professional link for all banners
                    const embedCode = `<a href="${targetUrl}" target="_blank"><img src="${mat.media_url}" alt="${mat.title}" ${mat.dimensions ? `width="${mat.dimensions.split('x')[0]}" height="${mat.dimensions.split('x')[1]}"` : ''} /></a>`;

                    return (
                        <div key={mat.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-[#151d48] text-lg">{mat.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1">Dimensions: <span className="text-orange-600 font-bold">{mat.dimensions || 'Responsive'}</span></p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 min-h-[120px] mb-6">
                                    <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={mat.media_url} alt={mat.title} className="max-w-full h-auto drop-shadow-sm" />
                                    </a>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">HTML Embed Code (For Websites & Forums)</label>
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={embedCode}
                                            rows={3}
                                            className="w-full text-sm font-mono p-3 bg-gray-900 border border-gray-200 text-green-400 rounded-xl focus:outline-none"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <CopyButton textToCopy={embedCode} isSmall={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(!materials || materials.filter(m => m.type === 'banner').length === 0) && (
                    <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
                        <div className="text-5xl mb-4">🖼️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Banners Available</h3>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">The system administrator has not uploaded any animated .gif or image banners yet. Please check back later or start using your direct referral link above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
