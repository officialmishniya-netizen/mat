import { supabase } from './supabase';

export type SiteSettings = {
    site_name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    nowpayments_api_key: string | null;
    nowpayments_ipn_secret: string | null;
    active_payment_gateway: string;
    coinpayments_merchant_id: string | null;
    coinpayments_ipn_secret: string | null;
    coinbase_api_key: string | null;
    coinbase_webhook_secret: string | null;
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
    launch_date: string | null;
    withdrawals_enabled: boolean;
    next_in_line_enabled: boolean;
    ptc_enabled: boolean;
    matrix_enabled: boolean;
    purchases_enabled: boolean;
    min_withdrawal_amount: number;
    max_withdrawal_amount: number;
    min_deposit_amount: number;
    max_deposit_amount: number;
    nowpayments_sandbox: boolean;
    auto_withdrawal_enabled: boolean;
    accepted_crypto_methods: string;

    // Mobile App Configurations
    mobile_app_maintenance: boolean;
    mobile_min_version: string;
    mobile_latest_version: string;
    onesignal_app_id: string | null;
    onesignal_rest_key: string | null;
    play_store_url: string | null;
    app_store_url: string | null;
};

const DEFAULT_SETTINGS: SiteSettings = {
    site_name: "MatClick",
    logo_url: null,
    primary_color: "#ea580c",
    secondary_color: "#fdba74",
    nowpayments_api_key: null,
    nowpayments_ipn_secret: null,
    active_payment_gateway: "nowpayments",
    coinpayments_merchant_id: null,
    coinpayments_ipn_secret: null,
    coinbase_api_key: null,
    coinbase_webhook_secret: null,
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
    launch_date: null,
    withdrawals_enabled: true,
    next_in_line_enabled: true,
    ptc_enabled: true,
    matrix_enabled: true,
    purchases_enabled: true,
    min_withdrawal_amount: 10,
    max_withdrawal_amount: 10000,
    min_deposit_amount: 10,
    max_deposit_amount: 50000,
    nowpayments_sandbox: false,
    auto_withdrawal_enabled: false,
    accepted_crypto_methods: "BTC,ETH,USDT,LTC,TRX",

    mobile_app_maintenance: false,
    mobile_min_version: "1.0.0",
    mobile_latest_version: "1.0.0",
    onesignal_app_id: null,
    onesignal_rest_key: null,
    play_store_url: null,
    app_store_url: null,
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
