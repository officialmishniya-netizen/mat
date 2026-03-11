import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEffectiveUserId } from "@/app/actions/impersonate";
import { getTickets } from "@/lib/tickets";
import Link from "next/link";
import {
    Plus,
    MessageCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ShieldCheck
} from "lucide-react";

export default async function SupportPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const effectiveUserId = await getEffectiveUserId(session?.user.id as string);
    const tickets = await getTickets(effectiveUserId);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'answered': return 'bg-green-50 text-green-600 border-green-100';
            case 'closed': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-orange-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#151d48] tracking-tight flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={32} />
                        Support Center
                    </h1>
                    <p className="text-[#737791] font-medium mt-1">Get help with your account and transactions</p>
                </div>
                <Link
                    href="/dashboard/support/new"
                    className="flex items-center justify-center space-x-2 bg-[#151d48] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/20 hover:secondary active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                    <Plus size={18} />
                    <span>Create Ticket</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            href={`/dashboard/support/${ticket.id}`}
                            className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getStatusStyle(ticket.status)} border shadow-inner`}>
                                    {ticket.status === 'open' && <Clock size={24} />}
                                    {ticket.status === 'answered' && <MessageCircle size={24} />}
                                    {ticket.status === 'closed' && <CheckCircle2 size={24} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-[#151d48] text-lg group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-[#737791]">
                                        <span className="flex items-center gap-1">
                                            Priority: <span className={getPriorityStyle(ticket.priority)}>{ticket.priority.toUpperCase()}</span>
                                        </span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Last Update</p>
                                    <p className="text-xs font-bold text-[#151d48]">{new Date(ticket.updated_at).toLocaleTimeString()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#151d48] group-hover:bg-primary group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="bg-white py-20 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center px-6">
                        <div className="bg-gray-50 p-6 rounded-[2.5rem] mb-6">
                            <AlertCircle size={48} className="text-gray-300" />
                        </div>
                        <h2 className="text-xl font-black text-[#151d48] mb-2">No tickets found</h2>
                        <p className="text-[#737791] max-w-sm mb-8 font-medium">If you have any questions or issues, our support team is ready to help you.</p>
                        <Link
                            href="/dashboard/support/new"
                            className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:secondary transition-all text-xs uppercase tracking-widest"
                        >
                            Submit Your First Ticket
                        </Link>
                    </div>
                )}
            </div>

            {/* Support Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                        <Clock size={24} />
                    </div>
                    <h4 className="font-black text-[#151d48] mb-2 uppercase tracking-tight">Response Time</h4>
                    <p className="text-sm text-[#737791] font-medium leading-relaxed">Our average response time is under 24 hours during business days.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                        <MessageCircle size={24} />
                    </div>
                    <h4 className="font-black text-[#151d48] mb-2 uppercase tracking-tight">Direct Support</h4>
                    <p className="text-sm text-[#737791] font-medium leading-relaxed">Communicate directly with our specialists for complex issues.</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h4 className="font-black text-[#151d48] mb-2 uppercase tracking-tight">Secure & Private</h4>
                    <p className="text-sm text-[#737791] font-medium leading-relaxed">Your support requests are handled with maximum confidentiality.</p>
                </div>
            </div>
        </div>
    );
}
