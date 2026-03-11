import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getTicketWithMessages } from "@/lib/tickets";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    MessageCircle,
    User,
    ShieldCheck,
    Clock,
    CheckCircle2
} from "lucide-react";
import { TicketChat } from "./TicketChat";

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) redirect("/auth/login");

    const ticket = await getTicketWithMessages(params.id);

    if (ticket.user_id !== session.user.id) {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized access to ticket.</div>;
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'answered': return 'bg-green-50 text-green-600 border-green-100';
            case 'closed': return 'bg-gray-50 text-gray-400 border-gray-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
                href="/dashboard/support"
                className="inline-flex items-center space-x-2 text-[#737791] hover:text-primary font-black text-xs uppercase tracking-widest transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Back to All Tickets</span>
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 flex-1 border-b md:border-b-0 md:border-r border-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-2xl font-black text-[#151d48] tracking-tight">{ticket.subject}</h1>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(ticket.status)}`}>
                            {ticket.status}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#737791]">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Clock size={14} className="text-gray-400" />
                            <span>Ticket ID: {ticket.id.split('-')[0].toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <CheckCircle2 size={14} className="text-gray-400" />
                            <span>Priority: {ticket.priority.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 flex flex-col justify-center min-w-[200px]">
                    <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Created At</p>
                    <p className="text-sm font-bold text-[#151d48]">{new Date(ticket.created_at).toLocaleString()}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Last Activity</p>
                        <p className="text-sm font-bold text-primary">{new Date(ticket.updated_at).toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            <TicketChat ticketId={ticket.id} initialMessages={ticket.messages} currentUserId={session.user.id} />
        </div>
    );
}
