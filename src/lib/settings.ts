import { supabase } from './supabase';

export type SiteSettings = {
    site_name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    nowpayments_api_key: string | null;
    nowpayments_ipn_secret: string | null;
    withdrawal_fee_percent: number;
    service_fee_percent: number;
    seo_title: string;
    seo_description: string;
    enable_team_emails: boolean;
    enable_direct_messages: boolean;
    enable_training_hub: boolean;
    mailgun_api_key: string | null;
    mailgun_domain: string | null;
    mailgun_from_email: string | null;
    enable_matrix_module: boolean;
    enable_ptc_module: boolean;
    enable_finance_module: boolean;
    enable_shoutbox_module: boolean;
    enable_simulation_module: boolean;
    enable_roi_module: boolean;
    enable_marketplace_module: boolean;
    enable_contests_module: boolean;
    enable_achievements_module: boolean;
    enable_team_chat_module: boolean;
};

const DEFAULT_SETTINGS: SiteSettings = {
    site_name: "MatClick",
    logo_url: null,
    primary_color: "#ea580c",
    secondary_color: "#fdba74",
    nowpayments_api_key: null,
    nowpayments_ipn_secret: null,
    withdrawal_fee_percent: 0,
    service_fee_percent: 0,
    seo_title: "MatClick - Professional Earning Platform",
    seo_description: "Join the premier Ad Click and earning platform.",
    enable_team_emails: true,
    enable_direct_messages: true,
    enable_training_hub: true,
    mailgun_api_key: null,
    mailgun_domain: null,
    mailgun_from_email: "notifications@matclick.com",
    enable_matrix_module: true,
    enable_ptc_module: true,
    enable_finance_module: true,
    enable_shoutbox_module: true,
    enable_simulation_module: true,
    enable_roi_module: true,
    enable_marketplace_module: true,
    enable_contests_module: true,
    enable_achievements_module: true,
    enable_team_chat_module: true,
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
            // Return safe default "light UI with orange accents" if DB fails
            return DEFAULT_SETTINGS;
        }

        return data as SiteSettings;
    } catch (e) {
        console.error('Error fetching site settings:', e);
        return DEFAULT_SETTINGS;
    }
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<boolean> => {
    const { error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', 1);

    if (error) {
        console.error('Failed to update settings:', error);
        return false;
    }
    return true;
};
