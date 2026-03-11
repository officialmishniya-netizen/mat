import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { ShoppingCart, Gift, UserCircle, Zap, ArrowRight, ShieldCheck, Gamepad2, Sparkles, Package, ShoppingBag } from "lucide-react";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buyMarketplaceItemAction } from "@/app/actions/marketplace";

export const metadata = {
    title: "Marketplace | Earn with the Ultimate Matrix"
};

export default async function MarketplacePage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/auth/login');

    const effectiveUserId = await getEffectiveUserId(session.user.id);

    // Fetch real Marketplace Items
    const { data: items } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });

    // Fetch User Info for Inventory Count
    const { count: inventoryCount } = await supabase
        .from("user_inventory")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", effectiveUserId);

    const displayItems = items || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-[#151d48] tracking-tighter flex items-center gap-3">
                        Marketplace <Sparkles className="text-primary animate-pulse" />
                    </h1>
                    <p className="text-[#737791] font-black text-sm mt-2 uppercase tracking-[0.2em]">Excluvise items for premium members</p>
                </div>

                <div className="bg-[#151d48] text-white px-8 py-4 rounded-[2rem] shadow-xl shadow-blue-900/20 flex items-center gap-4 group cursor-pointer hover:scale-105 transition-all">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={20} className="text-blue-200" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Your Inventory</p>
                        <p className="text-lg font-black tracking-tight">{inventoryCount || 0} Items Acquired</p>
                    </div>
                    <ArrowRight size={20} className="text-white/40 group-hover:translate-x-1 transition-transform ml-4" />
                </div>
            </div>

            {/* Featured Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {displayItems.map((item, i) => (
                    <div key={item.id} className={`group bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col relative overflow-hidden ${i === 1 && displayItems.length > 1 ? 'lg:scale-105 border-primary/20 shadow-primary/5 z-10' : ''}`}>
                        {i === 1 && displayItems.length > 1 && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl tracking-widest uppercase">
                                Best Value
                            </div>
                        )}

                        <div className="aspect-square bg-gray-50 rounded-[2.5rem] mb-8 flex items-center justify-center overflow-hidden relative group-hover:bg-primary/5 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {item.type === 'surprise_box' ? (
                                <Gift size={80} className="text-primary group-hover:scale-110 transition-transform duration-700" />
                            ) : item.type === 'package' ? (
                                <Package size={80} className="text-green-500 group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <UserCircle size={80} className="text-indigo-400 group-hover:scale-110 transition-transform duration-700" />
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-black text-[#151d48] tracking-tight">{item.name}</h3>
                                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-xl text-xs font-black">
                                    {item.type.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                            <div className="text-gray-500 font-medium text-sm leading-relaxed">
                                {item.description}
                                {item.reward_ad_credits > 0 && <span className="block mt-2 font-black text-green-600">+{item.reward_ad_credits} Ad Credits Included!</span>}
                                {parseFloat(item.reward_amount || '0') > 0 && <span className="block mt-1 font-black text-orange-600">+${parseFloat(item.reward_amount).toFixed(2)} Instant Cash!</span>}
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                <p className="text-3xl font-black text-[#151d48] tracking-tighter">{formatMoney(item.price)}</p>
                            </div>

                            <form action={async () => { "use server"; await buyMarketplaceItemAction(item.id); }}>
                                <button type="submit" className="bg-[#151d48] text-white h-16 px-8 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-primary hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center gap-3 group/btn">
                                    Purchase
                                    <Zap size={18} className="text-yellow-400 group-hover/btn:scale-125 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}

                {displayItems.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                        <h3 className="text-2xl font-black text-[#151d48]">No items available</h3>
                        <p className="text-gray-400 font-bold mt-2">Check back later for exclusive deals!</p>
                    </div>
                )}
            </div>

            {/* How it works */}
            <div className="bg-[#151d48] rounded-[3rem] p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-blue-300">
                            <ShoppingCart size={32} />
                        </div>
                        <h4 className="text-xl font-black">1. Choose Item</h4>
                        <p className="text-blue-200 text-sm font-medium">Browse our exclusive collection of boxes and avatars.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-green-400">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="text-xl font-black">2. Buy Securly</h4>
                        <p className="text-blue-200 text-sm font-medium">Funds are deducted instantly from your Purchase Balance.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-yellow-400">
                            <Gamepad2 size={32} />
                        </div>
                        <h4 className="text-xl font-black">3. Open or Use</h4>
                        <p className="text-blue-200 text-sm font-medium">Items go to your inventory for instant use or opening.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
