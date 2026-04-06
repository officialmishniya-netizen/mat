import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Layers, DollarSign, MousePointerClick, RefreshCcw, ShieldCheck, Zap, AlertCircle } from "lucide-react";

export default async function AdminAdLevelsPage() {
    const { data: levels } = await supabase
        .from("ad_levels")
        .select("*")
        .order("price", { ascending: true });

    async function createAdLevel(formData: FormData) {
        "use server";

        await supabase.from("ad_levels").insert({
            name: formData.get("name") as string,
            active: formData.get("active") === "true",
            price: parseFloat(formData.get("price") as string),
            member_earning: parseFloat(formData.get("member_earning") as string),
            sponsor_bonus_per_click: parseFloat(formData.get("sponsor_bonus_per_click") as string),
            platform_fee_per_click: parseFloat(formData.get("platform_fee_per_click") as string),
            clicks_per_cycle: parseInt(formData.get("clicks_per_cycle") as string) || 125,
            repurchase_required: formData.get("repurchase_required") === "true",
            next_upgrade_level_id: formData.get("next_upgrade_level_id") ? parseInt(formData.get("next_upgrade_level_id") as string) : null,
            withdrawal_on_completion: parseFloat(formData.get("withdrawal_on_completion") as string) || 0,
            total_cycle_revenue: parseFloat(formData.get("total_cycle_revenue") as string) || 0,
            matching_bonus_on_cycle: parseFloat(formData.get("matching_bonus_on_cycle") as string) || 0,
            payouts_enabled: formData.get("payouts_enabled") === "true",
            min_withdrawal_amount: parseFloat(formData.get("min_withdrawal_amount") as string) || 0,
            admin_cycle_fee: parseFloat(formData.get("admin_cycle_fee") as string) || 0,
            earning_multiplier: parseFloat(formData.get("earning_multiplier") as string) || 1.0,
            requirement_level_id: formData.get("requirement_level_id") ? parseInt(formData.get("requirement_level_id") as string) : null,
            threshold_qty: parseInt(formData.get("threshold_qty") as string) || 0,
            daily_ad_limit: parseInt(formData.get("daily_ad_limit") as string) || 0,
            ad_timer_seconds: parseInt(formData.get("ad_timer_seconds") as string) || 15,
            ad_credit_reward_per_watch: parseFloat(formData.get("ad_credit_reward_per_watch") as string) || 0,
            ad_credits_on_purchase: parseFloat(formData.get("ad_credits_on_purchase") as string) || 0,
            ad_credits_on_cycle: parseFloat(formData.get("ad_credits_on_cycle") as string) || 0,
            ad_submission_cost: parseFloat(formData.get("ad_submission_cost") as string) || 1.0,
            weekly_service_fee: parseFloat(formData.get("weekly_service_fee") as string) || 0,
            enable_weekly_fee: formData.get("enable_weekly_fee") === "true",
        });

        revalidatePath("/admin/ads");
    }

    return (
        <div className="p-8 space-y-8 text-[#151d48]">
            {/* Header section */}
            <div className="flex justify-between items-end border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Level Management</h1>
                    <p className="text-[#737791] font-medium mt-2">Manage levels, pricing, and earning configurations</p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <Zap size={18} className="text-orange-500" />
                        <span className="text-sm font-bold">Status: <span className="text-green-500">System Online</span></span>
                    </div>
                </div>
            </div>

            {/* Main creation form - Multi-section grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#151d48] to-[#2a3c85] p-6 text-white">
                    <h2 className="text-xl font-bold flex items-center">
                        <Layers className="mr-2" size={24} /> Create New Ad Level
                    </h2>
                </div>

                <form action={createAdLevel} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* Section 1: Core Identity */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-orange-500 tracking-widest border-l-4 border-orange-500 pl-3">1. Core Identity</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">LEVEL NAME</label>
                                <input required type="text" name="name" placeholder="e.g. Beginner" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">PURCHASE COST ($)</label>
                                <input required type="number" step="0.01" name="price" placeholder="15.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input type="checkbox" name="active" value="true" defaultChecked className="w-5 h-5 accent-orange-500" />
                                <label className="text-sm font-bold">Level Active Status</label>
                            </div>
                        </div>

                        {/* Section 2: Payplan (Earnings) */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-blue-500 tracking-widest border-l-4 border-blue-500 pl-3">2. Payplan Logic</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">MEMBER EARNING ($)</label>
                                <input required type="number" step="0.001" name="member_earning" placeholder="0.250" className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">SPONSOR BONUS ($)</label>
                                <input required type="number" step="0.001" name="sponsor_bonus_per_click" placeholder="0.025" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">PLATFORM FEE per CLICK ($)</label>
                                <input required type="number" step="0.001" name="platform_fee_per_click" placeholder="0.025" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">CLICKS PER CYCLE</label>
                                <input required type="number" name="clicks_per_cycle" placeholder="125" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-center" />
                            </div>
                        </div>

                        {/* Section 3: Cycle Convergence */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-green-500 tracking-widest border-l-4 border-green-500 pl-3">3. Cycle Convergence</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">WITHDRAWAL ON COMPLETION ($)</label>
                                <input required type="number" step="0.01" name="withdrawal_on_completion" placeholder="15.00" className="w-full px-4 py-3 bg-green-50 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">TOTAL CYCLE REVENUE ($)</label>
                                <input required type="number" step="0.01" name="total_cycle_revenue" placeholder="45.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">MATCHING BONUS ($)</label>
                                <input required type="number" step="0.01" name="matching_bonus_on_cycle" placeholder="7.50" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">ADMIN CYCLE FEE ($)</label>
                                <input required type="number" step="0.01" name="admin_cycle_fee" placeholder="7.50" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                        </div>

                        {/* Section 4: Ad Traffic & Limits */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black uppercase text-purple-500 tracking-widest border-l-4 border-purple-500 pl-3">4. Ad Traffic & Limits</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">DAILY AD LIMIT</label>
                                <input required type="number" name="daily_ad_limit" placeholder="15" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">AD TIMER (SECONDS)</label>
                                <input required type="number" name="ad_timer_seconds" placeholder="15" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">AD CREDITS ON PURCHASE</label>
                                <input required type="number" name="ad_credits_on_purchase" placeholder="2000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">AD SUBMISSION COST (CREDITS)</label>
                                <input required type="number" step="0.1" name="ad_submission_cost" placeholder="1.0" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 py-8 border-t border-dashed border-gray-200">
                        {/* Section 5: Dependencies & Upgrades */}
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 space-y-4">
                            <h3 className="text-sm font-black uppercase text-gray-600 tracking-widest mb-4">Re-injection Dependences</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">REQUIREMENT LEVEL ID</label>
                                    <input type="number" name="requirement_level_id" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">THRESHOLD QTY</label>
                                    <input type="number" name="threshold_qty" placeholder="1" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 pt-2">
                                <label className="flex items-center space-x-2 text-sm font-bold">
                                    <input type="checkbox" name="repurchase_required" value="true" defaultChecked className="w-5 h-5 accent-orange-500" />
                                    <span>Requires Repurchase after Cycle</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm font-bold">
                                    <input type="checkbox" name="payouts_enabled" value="true" defaultChecked className="w-5 h-5 accent-green-500" />
                                    <span>Payouts Enabled</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 6: Weekly Fees & Multipliers */}
                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 space-y-4">
                            <h3 className="text-sm font-black uppercase text-orange-600 tracking-widest mb-4">Service Fees & Multipliers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">WEEKLY SERVICE FEE ($)</label>
                                    <input type="number" step="0.01" name="weekly_service_fee" placeholder="0.00" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">EARNING MULTIPLIER</label>
                                    <input type="number" step="0.0001" name="earning_multiplier" defaultValue="1.0000" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-orange-600" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input type="checkbox" name="enable_weekly_fee" value="true" className="w-5 h-5 accent-orange-500" />
                                <label className="text-sm font-bold">Enable Weekly Fee</label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="submit" className="w-full bg-[#151d48] text-white font-black py-6 rounded-3xl text-xl hover:bg-[#2a3c85] transition-all transform hover:scale-[1.01] shadow-2xl shadow-blue-900/20 active:scale-[0.99] flex items-center justify-center">
                            <Zap className="mr-3" size={24} /> ACTIVATE & CREATE NEW LEVEL
                        </button>
                    </div>
                </form>
            </div>

            {/* Levels List View - Matching the premium dashboard screenshot UI */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50/50 p-8 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-[#151d48]">Active Tiers</h3>
                    <div className="flex space-x-4">
                        <div className="flex items-center bg-white px-4 py-2 rounded-full border border-gray-100 text-xs font-bold">
                            <ShieldCheck size={14} className="text-green-500 mr-2" /> Verified Config
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[#a0a8b9] text-[13px] font-bold uppercase tracking-widest bg-gray-50/30">
                                <th className="px-8 py-6">Level Name</th>
                                <th className="px-4 py-6">Cost</th>
                                <th className="px-4 py-6">Earning/Click</th>
                                <th className="px-4 py-6 text-center">Clicks/Cycle</th>
                                <th className="px-4 py-6">Daily Limit</th>
                                <th className="px-4 py-6">Cycle Payout</th>
                                <th className="px-4 py-6">Weekly Fee</th>
                                <th className="px-4 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {levels?.map((lvl) => (
                                <tr key={lvl.id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="font-extrabold text-[#151d48] text-lg">{lvl.name}</div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="font-black italic text-lg text-[#151d48] font-serif">${lvl.price.toFixed(2)}</div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="font-bold text-[#05cd99] text-lg">${parseFloat(lvl.member_earning).toFixed(3)}</div>
                                    </td>
                                    <td className="px-4 py-6 text-center">
                                        <span className="bg-gray-100 text-gray-600 px-4 py-1 rounded-full font-bold text-sm">{lvl.clicks_per_cycle}</span>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="text-[13px] font-extrabold text-[#151d48]">{lvl.daily_ad_limit} PER DAY</div>
                                        <div className="text-[11px] font-bold text-[#737791] uppercase">{lvl.ad_timer_seconds}s Cooldown</div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="font-black text-orange-500 text-lg">${parseFloat(lvl.withdrawal_on_completion).toFixed(2)}</div>
                                    </td>
                                    <td className="px-4 py-6">
                                        {lvl.enable_weekly_fee ? (
                                            <div>
                                                <div className="text-[10px] font-black text-orange-600 uppercase">Active</div>
                                                <div className="text-xs font-bold text-[#151d48]">${parseFloat(lvl.weekly_service_fee).toFixed(2)} / week</div>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-bold text-[#a0a8b9] uppercase">Off</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-6">
                                        <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${lvl.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {lvl.active ? 'Active' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-all">
                                                <AlertCircle size={18} />
                                            </button>
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-50 hover:text-orange-500 transition-all">
                                                <RefreshCcw size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
