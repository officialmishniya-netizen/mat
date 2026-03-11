import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Zap, Edit3 } from "lucide-react";

export default async function AdminLevelsPage() {
    const { data: levels } = await supabase
        .from("levels")
        .select("*")
        .order("id", { ascending: true });

    async function createLevel(formData: FormData) {
        "use server";

        await supabase.from("levels").insert({
            name: formData.get("name") as string,
            price: parseFloat(formData.get("price") as string),
            sponsor_bonus: parseFloat(formData.get("sponsor_bonus") as string) || 0,
            matching_bonus: parseFloat(formData.get("matching_bonus") as string) || 0,
            referral_requirement: parseInt(formData.get("referral_requirement") as string) || 0,
            cycle_size: parseInt(formData.get("cycle_size") as string) || 2,
            cycle_reward: parseFloat(formData.get("cycle_reward") as string) || 0,
            re_entry_fee: parseFloat(formData.get("re_entry_fee") as string) || 0,
            platform_fee_percent: parseFloat(formData.get("platform_fee_percent") as string) || 0,
            commission_cap: parseFloat(formData.get("commission_cap") as string) || 0,
            matrix_type: formData.get("matrix_type") as string || 'company_force',
            matrix_width: parseInt(formData.get("matrix_width") as string) || 2,
            matrix_depth: parseInt(formData.get("matrix_depth") as string) || 2,
            spillover_priority: formData.get("spillover_priority") as string || 'left',
            min_personal_purchase: parseFloat(formData.get("min_personal_purchase") as string) || 0,
            prerequisite_level_id: formData.get("prerequisite_level_id") ? parseInt(formData.get("prerequisite_level_id") as string) : null,
            expiry_days: parseInt(formData.get("expiry_days") as string) || 0,
            matching_depth: parseInt(formData.get("matching_depth") as string) || 1,
            binary_leg_match: formData.get("binary_leg_match") as string || 'weaker',
            rank_multiplier: parseFloat(formData.get("rank_multiplier") as string) || 1.0,
            auto_rebuy: formData.get("auto_rebuy") === 'true',
        });

        revalidatePath("/admin/levels");
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-3xl font-black text-[#151d48]">Matrix Level Intelligence</h1>
                <p className="text-gray-500 text-sm">Configure structural, financial, and automation rules for matrix levels.</p>
            </header>

            {/* Create Level Form */}
            <div className="bg-white p-8 shadow-sm rounded-[2rem] border border-gray-100">
                <h2 className="text-xl font-black mb-8 text-[#151d48] flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><Zap size={20} /></div>
                    Architect New Level
                </h2>
                <form action={createLevel} className="space-y-12">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="w-8 h-px bg-gray-100" /> Basic Info
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Level Name</label>
                                <input required type="text" name="name" placeholder="Bronze 1" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Price ($)</label>
                                <input required type="number" step="0.01" name="price" placeholder="10.00" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Re-entry Fee ($)</label>
                                <input required type="number" step="0.01" name="re_entry_fee" defaultValue="0" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Platform Fee (%)</label>
                                <input required type="number" step="0.1" name="platform_fee_percent" defaultValue="0" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Matrix Structure */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="w-8 h-px bg-gray-100" /> Structure & Logic
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Matrix Type</label>
                                <select name="matrix_type" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="company_force">Company Forced</option>
                                    <option value="sponsor_force">Sponsor Forced</option>
                                    <option value="weakest_leg">Weakest Leg (Binary)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Width (Binary=2, etc)</label>
                                <input required type="number" name="matrix_width" defaultValue="2" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Depth</label>
                                <input required type="number" name="matrix_depth" defaultValue="2" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Spillover Priority</label>
                                <select name="spillover_priority" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                    <option value="left">Left-to-Right</option>
                                    <option value="right">Right-to-Left</option>
                                    <option value="weak">Weakest Leg first</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Rewards */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="w-8 h-px bg-gray-100" /> Rewards & Bonuses
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Cycle Reward ($)</label>
                                <input required type="number" step="0.01" name="cycle_reward" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Commission Cap ($)</label>
                                <input required type="number" step="0.01" name="commission_cap" defaultValue="0" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Sponsor Bonus ($)</label>
                                <input required type="number" step="0.01" name="sponsor_bonus" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Matching Depth (UP)</label>
                                <input required type="number" name="matching_depth" defaultValue="1" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Qualification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <div className="w-8 h-px bg-gray-100" /> Qualification & Automation
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Min Active Directs</label>
                                <input type="number" name="referral_requirement" defaultValue="0" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Prerequisite Level ID</label>
                                <input type="number" name="prerequisite_level_id" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="None" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#444a6d]">Position Expiry (Days)</label>
                                <input type="number" name="expiry_days" defaultValue="0" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                            </div>
                            <div className="flex items-center pt-6">
                                <input type="checkbox" name="auto_rebuy" value="true" className="h-5 w-5 text-primary border-none bg-gray-100 rounded-lg focus:ring-primary/20" />
                                <label className="ml-2 text-sm font-bold text-[#444a6d]">Auto-Rebuy</label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-[#151d48] text-white font-black py-4 rounded-[1.5rem] hover:bg-primary transition-all shadow-xl shadow-blue-900/10">
                        Create Final Matrix Level
                    </button>
                </form>
            </div>

            {/* Levels Table */}
            <div className="bg-white shadow-sm rounded-[2.5rem] overflow-hidden border border-gray-100">
                <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-black text-[#151d48]">Ecosystem Pulse</h3>
                    <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-[#737791]">
                        <span>Active Levels: {levels?.length || 0}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5">Level Config</th>
                                <th className="px-8 py-5">Yield & Fees</th>
                                <th className="px-8 py-5">Structural Logic</th>
                                <th className="px-8 py-5">Qualification</th>
                                <th className="px-8 py-5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {levels?.map((lvl: any) => (
                                <tr key={lvl.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-[#151d48] text-lg">{lvl.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price: ${lvl.price}</div>
                                    </td>
                                    <td className="px-8 py-6 space-y-1">
                                        <div className="text-sm font-black text-green-600">Reward: ${lvl.cycle_reward}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Cap: ${lvl.commission_cap}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Admin: {lvl.platform_fee_percent}%</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="bg-primary/5 text-primary text-[10px] font-black px-2 py-1 rounded inline-block uppercase mb-1">
                                            {lvl.matrix_type.replace('_', ' ')}
                                        </div>
                                        <div className="text-xs font-bold text-[#444a6d]">
                                            {lvl.matrix_width}x{lvl.matrix_depth} Architecture
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Spill: {lvl.spillover_priority}</div>
                                    </td>
                                    <td className="px-8 py-6 space-y-1">
                                        <div className={`text-[10px] font-black uppercase ${lvl.referral_requirement > 0 ? 'text-amber-600' : 'text-green-500'}`}>
                                            {lvl.referral_requirement} Directs Filter
                                        </div>
                                        {lvl.prerequisite_level_id && (
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">Needs Level #{lvl.prerequisite_level_id}</div>
                                        )}
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Expires: {lvl.expiry_days > 0 ? `${lvl.expiry_days}d` : 'Never'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="text-gray-300 hover:text-primary transition-colors"><Edit3 size={18} /></button>
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
