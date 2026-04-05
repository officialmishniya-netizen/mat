import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client that is aware of session cookies for use in
 * Server Components, Route Handlers, and Server Actions.
 */
export async function createServerSupabaseClient() {
    const cookieStore = cookies();

    const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        }
    });

    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    if (accessToken && refreshToken) {
        await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }

    return client;
}
