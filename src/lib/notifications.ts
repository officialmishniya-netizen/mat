import { supabase } from './supabase';
import { toMoney } from './money';
import { getSiteSettings } from './settings';

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

    try {
        const settings = await getSiteSettings();
        
        if (settings.mailgun_api_key && settings.mailgun_domain) {
            const formData = new URLSearchParams();
            formData.append('from', settings.mailgun_from_email || `MatClick <notifications@${settings.mailgun_domain}>`);
            formData.append('to', email);
            formData.append('subject', title);
            formData.append('html', body);

            const auth = Buffer.from(`api:${settings.mailgun_api_key}`).toString('base64');
            const response = await fetch(`https://api.mailgun.net/v3/${settings.mailgun_domain}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            if (!response.ok) {
                const err = await response.text();
                console.error('Mailgun error:', err);
                return false;
            }
            return true;
        }
    } catch (e) {
        console.error('Email dispatch failed:', e);
    }
    
    return true;
};

/**
 * Sends an email using a template from the database.
 */
export const sendTemplateEmail = async (
    userId: string,
    templateSlug: string,
    placeholders: Record<string, string>
) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('email, username')
            .eq('id', userId)
            .single();

        if (!user?.email) return false;

        const { data: template } = await supabase
            .from('email_templates')
            .select()
            .eq('slug', templateSlug)
            .single();

        if (!template) {
            console.error(`Template ${templateSlug} not found`);
            return false;
        }

        let body = template.body;
        let subject = template.subject;

        // Add default user placeholders
        const allPlaceholders = {
            ...placeholders,
            username: user.username,
        };

        // Replace placeholders {key} with value
        Object.entries(allPlaceholders).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            body = body.replace(regex, value);
            subject = subject.replace(regex, value);
        });

        return await sendEmailNotification(user.email, subject, body);
    } catch (e) {
        console.error('Failed to send template email:', e);
        return false;
    }
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
