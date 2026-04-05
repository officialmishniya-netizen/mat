"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Settings, MessageSquare, Clock, ArrowRight, Activity, Send } from "lucide-react";
import toast from "react-hot-toast";

export function FollowUpsClient({ initialRules }: { initialRules: any[] }) {
    const [rules, setRules] = useState(initialRules);

    // New Rule Form State
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [condition, setCondition] = useState("on_signup");
    const [delayDays, setDelayDays] = useState(1);
    const [actionType, setActionType] = useState("send_message");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Please provide a name for the rule");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch('/api/team/follow-ups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    condition,
                    actionType,
                    delayDays,
                    isActive: true
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Follow-up rule created");
                setRules([data.rule, ...rules]);

                // Reset form
                setName("");
                setCondition("on_signup");
                setDelayDays(1);
            } else {
                toast.error(data.error || "Failed to create rule");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const toggleRuleStatus = (id: string, currentStatus: boolean) => {
        // Optimistic update
        setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
        toast.success(`Rule ${!currentStatus ? 'activated' : 'paused'}`);
        // In real app, make API call to update status here
    };

    const getConditionBadge = (cond: string) => {
        switch (cond) {
            case 'on_signup': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">On Signup</span>;
            case 'inactive_3_days': return <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Inactive 3 Days</span>;
            case 'inactive_7_days': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Inactive 7 Days</span>;
            default: return <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{cond}</span>;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left/Top: Create Rule */}
            <div className="lg:col-span-1">
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6 sticky top-6">
                    <h2 className="text-xl font-black text-[#151d48] mb-6 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-primary" />
                        New Automation
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Rule Name</label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Welcome Message"
                                className="h-11 rounded-xl bg-gray-50 border-gray-100"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Trigger Condition</label>
                            <Select value={condition} onValueChange={setCondition}>
                                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-100">
                                    <SelectValue placeholder="Select Trigger" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="on_signup">Immediately on Signup</SelectItem>
                                    <SelectItem value="inactive_3_days">Inactive for 3 Days</SelectItem>
                                    <SelectItem value="inactive_7_days">Inactive for 7 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {condition === "on_signup" && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Delay (Days)</label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={delayDays}
                                    onChange={e => setDelayDays(parseInt(e.target.value) || 0)}
                                    className="h-11 rounded-xl bg-gray-50 border-gray-100"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">0 = Send instantly</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Action</label>
                            <Select value={actionType} onValueChange={setActionType}>
                                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50 border-gray-100">
                                    <SelectValue placeholder="Select Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="send_message">Send Direct Message</SelectItem>
                                    <SelectItem value="send_email">Send Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <Button
                                type="submit"
                                disabled={isCreating}
                                className="w-full h-12 bg-[#151d48] hover:bg-blue-900 text-white rounded-xl font-bold"
                            >
                                {isCreating ? 'Creating...' : <><Plus className="w-4 h-4 mr-2" /> Save Rule</>}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Right/Bottom: Active Rules & Logs */}
            <div className="lg:col-span-2 space-y-6">

                {/* Active Rules List */}
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <h3 className="text-lg font-black text-[#151d48] mb-1">Your Follow-Up Rules</h3>
                    <p className="text-sm text-gray-500 mb-6">Manage your active automations.</p>

                    <div className="space-y-3">
                        {rules.length === 0 ? (
                            <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-100">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold">No follow-up rules set.</p>
                                <p className="text-sm text-gray-400">Create your first rule to automate team management.</p>
                            </div>
                        ) : (
                            rules.map((rule) => (
                                <div key={rule.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-[#151d48] truncate">{rule.name}</h4>
                                            {getConditionBadge(rule.condition)}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                                            <Activity className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                                            {rule.actionType === 'send_message' ? 'Direct Message' : 'Email'}
                                            {rule.delayDays > 0 && <span className="ml-2 text-gray-400">({rule.delayDays} day delay)</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0 mt-3 sm:mt-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${rule.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {rule.isActive ? 'Active' : 'Paused'}
                                            </span>
                                            <Switch
                                                checked={rule.isActive || false}
                                                onCheckedChange={() => toggleRuleStatus(rule.id, rule.isActive)}
                                            />
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 font-bold hover:bg-blue-50">
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Automation Logs */}
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6">
                    <h3 className="text-lg font-black text-[#151d48] mb-1">Recent Activity Logs</h3>
                    <p className="text-sm text-gray-500 mb-6">See what your automations are doing behind the scenes.</p>

                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm font-bold">No activity logs yet.</p>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
