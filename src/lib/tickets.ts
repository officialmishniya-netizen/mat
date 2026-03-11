import { supabase } from './supabase';

export const createTicket = async (userId: string, subject: string, initialMessage: string, priority: string = 'medium') => {
    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
            user_id: userId,
            subject,
            priority,
            status: 'open'
        })
        .select()
        .single();

    if (ticketError) throw ticketError;

    const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
            ticket_id: ticket.id,
            user_id: userId,
            content: initialMessage,
            is_admin: false
        });

    if (messageError) throw messageError;

    return ticket;
};

export const getTickets = async (userId: string) => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getTicketWithMessages = async (ticketId: string) => {
    const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

    if (ticketError) throw ticketError;

    const { data: messages, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { ...ticket, messages };
};

export const addTicketMessage = async (ticketId: string, userId: string, content: string, isAdmin: boolean = false) => {
    const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert({
            ticket_id: ticketId,
            user_id: userId,
            content,
            is_admin: isAdmin
        });

    if (messageError) throw messageError;

    // Update ticket status/updated_at
    const { error: ticketUpdateError } = await supabase
        .from('tickets')
        .update({
            updated_at: new Date().toISOString(),
            status: isAdmin ? 'answered' : 'open'
        })
        .eq('id', ticketId);

    if (ticketUpdateError) throw ticketUpdateError;

    return true;
};
