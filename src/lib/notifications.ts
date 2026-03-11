import { supabase } from './supabase';
import { toMoney } from './money';

export type NotificationType = 'earning' | 'cycle' | 'credit' | 'system' | 'withdrawal' | 'deposit';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    description: string;
    amount?: string;
    isRead: boolean;
    createdAt: string;
}

/**
 * Creates a new notification in the database and optionally sends an email.
 */
export const createNotification = async (
    userId: string,
    type: NotificationType,
    title: string,
    description: string,
    amount?: string | number
): Promise<boolean> => {
    // 1. Insert into database
    const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            description,
            amount: amount ? toMoney(amount).toFixed(2) : null,
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to create notification:', error);
        return false;
    }

    // 2. Check if email notifications are enabled for this user
    const { data: user } = await supabase
        .from('users')
        .select('email, email_notifications_enabled')
        .eq('id', userId)
        .single();

    if (user?.email && user.email_notifications_enabled) {
        await sendEmailNotification(user.email, title, description);
    }

    return true;
};

/**
 * Logic for sending emails. 
 * Note: For a real production server, replace this with Resend or Postmark API calls.
 */
export const sendEmailNotification = async (email: string, title: string, body: string) => {
    console.log(`[EMAIL DISPATCH] To: ${email} | Subject: ${title} | Body: ${body}`);

    // Example Resend implementation (uncomment when API keys are available):
    /*
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'PTC Nexus <notifications@ptcnexus.com>',
                to: [email],
                subject: title,
                html: `<p>${body}</p>`,
            }),
        });
        return response.ok;
    } catch (e) {
        console.error('Email dispatch failed:', e);
    }
    */
    return true;
};

/**
 * Marks a notification as read.
 */
export const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return !error;
};

/**
 * Marks all notifications for a user as read.
 */
export const markAllAsRead = async (userId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return !error;
};
