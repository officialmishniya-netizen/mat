"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Plus, BarChart2, ExternalLink, Link as LinkIcon, Activity } from "lucide-react";
import toast from "react-hot-toast";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export function TrackingLinksClient({ initialLinks }: { initialLinks: any[] }) {
    const [links, setLinks] = useState(initialLinks);
    const [newLinkName, setNewLinkName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLinkName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/team/tracking-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newLinkName })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("Tracking link created");
                setLinks([data.link, ...links]);
                setNewLinkName("");
            } else {
                toast.error(data.error || "Failed to create link");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = (slug: string) => {
        const url = `${window.location.origin}/t/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    // Prepare data for Recharts
    const chartData = links.map(link => ({
        name: link.name.length > 15 ? link.name.substring(0, 15) + '...' : link.name,
        clicks: link.clicks || 0,
        full_name: link.name
    })).sort((a, b) => b.clicks - a.clicks).slice(0, 7); // Top 7 for chart

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
                    <p className="font-bold text-[#151d48] mb-1">{payload[0].payload.full_name}</p>
                    <p className="text-sm flex items-center text-blue-600 font-black">
                        <Activity className="w-3.5 h-3.5 mr-1" />
                        {payload[0].value} Clicks
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Create Link & List */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Create Link Card */}
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 p-6 bg-white">
                    <h2 className="text-xl font-black text-[#151d48] mb-4 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-primary" />
                        Create New Campaign
                    </h2>
                    <form onSubmit={handleCreate} className="flex gap-3">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                value={newLinkName}
                                onChange={(e) => setNewLinkName(e.target.value)}
                                placeholder="e.g. Facebook Ads - Group A"
                                className="pl-10 h-12 rounded-xl bg-gray-50 border-none"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isCreating || !newLinkName.trim()}
                            className="h-12 px-6 bg-[#151d48] hover:bg-blue-900 text-white rounded-xl font-bold"
                        >
                            {isCreating ? 'Creating...' : 'Generate Link'}
                        </Button>
                    </form>
                </Card>

                {/* Tracking Links List */}
                <div className="space-y-3">
                    <h3 className="font-black text-gray-700 tracking-tight ml-2">Your Tracking Links</h3>
                    {links.length === 0 ? (
                        <div className="bg-white rounded-3xl p-10 text-center border border-gray-50 shadow-sm">
                            <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">No tracking links created.</p>
                            <p className="text-sm text-gray-400">Create one above to start tracking clicks!</p>
                        </div>
                    ) : (
                        links.map((link) => (
                            <div key={link.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-blue-100 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-[#151d48] truncate">{link.name}</h4>
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest shrink-0">
                                            {link.clicks} Clicks
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono truncate bg-gray-50 px-2 py-1 rounded inline-block">
                                        /t/{link.slug}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => copyToClipboard(link.slug)}
                                        className="h-9 rounded-xl bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100"
                                    >
                                        <Copy className="w-4 h-4 mr-1.5" /> Copy
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        title="View Destination"
                                        onClick={() => window.open(link.destinationUrl, '_blank')}
                                        className="h-9 w-9 rounded-xl text-gray-400 hover:text-blue-600"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Chart Comparison */}
            <div className="lg:col-span-1">
                <Card className="rounded-3xl border-none shadow-sm shadow-blue-900/5 bg-white p-6 sticky top-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-black text-[#151d48] mb-6 flex items-center shrink-0">
                        <BarChart2 className="w-5 h-5 mr-2 text-primary" />
                        Top Performing
                    </h3>
                    
                    {chartData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold">
                            Not enough data to display
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                                        width={80}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                                    <Bar 
                                        dataKey="clicks" 
                                        radius={[0, 4, 4, 0]}
                                        maxBarSize={32}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </div>
            
        </div>
    );
}
