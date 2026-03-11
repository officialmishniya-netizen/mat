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

    // Check for dummy mode
    const isDummy = supabaseUrl.includes("dummy") || !supabaseUrl || supabaseUrl.includes("localhost:54321");

    console.log('[Auth Debug] createServerSupabaseClient:', {
        url: supabaseUrl,
        isDummy,
        hasAccessToken: !!cookieStore.get('sb-access-token'),
        hasRefreshToken: !!cookieStore.get('sb-refresh-token')
    });

    // Create standard client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // Don't persist in server-side storage
        }
    });

    // If we have cookies, try to set the session
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;

    console.log('[Auth] Server Client Cookies:', {
        hasAccess: !!accessToken,
        hasRefresh: !!refreshToken,
        isDummy
    });

    if (accessToken && refreshToken && !isDummy) {
        const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        if (error) console.error('[Auth] setSession error:', error.message);
    }

    // Apply same Proxy logic for dummy mode as in the client-side helper
    return new Proxy(client, {
        get(target, prop, receiver) {
            if (isDummy && prop === 'auth') {
                return {
                    ...target.auth,
                    getSession: async () => {
                        // In dummy mode, always return a session if we are in the dashboard
                        // This prevents redirect loops during initial cookie setup
                        return {
                            data: {
                                session: {
                                    user: {
                                        id: '00000000-0000-0000-0000-000000000000',
                                        email: 'admin@preview.local',
                                        role: 'authenticated',
                                    },
                                    access_token: accessToken || 'mock-token',
                                    refresh_token: refreshToken || 'mock-refresh-token',
                                }
                            },
                            error: null
                        };
                    },
                };
            }

            if (isDummy && prop === 'from') {
                return (table: string) => {
                    const chain = target.from(table);

                    const createMockChain = (data: any, count = 0) => {
                        const mock: any = {
                            select: () => mock,
                            eq: () => mock,
                            neq: () => mock,
                            gt: () => mock,
                            lt: () => mock,
                            gte: () => mock,
                            lte: () => mock,
                            like: () => mock,
                            ilike: () => mock,
                            is: () => mock,
                            in: () => mock,
                            contains: () => mock,
                            containedBy: () => mock,
                            rangeGt: () => mock,
                            rangeGte: () => mock,
                            rangeLt: () => mock,
                            rangeLte: () => mock,
                            rangeAdjacent: () => mock,
                            overlaps: () => mock,
                            textSearch: () => mock,
                            match: () => mock,
                            not: () => mock,
                            or: () => mock,
                            filter: () => mock,
                            order: () => mock,
                            limit: () => mock,
                            range: () => mock,
                            abortSignal: () => mock,
                            single: async () => ({ data: Array.isArray(data) ? data[0] : data, error: null }),
                            maybeSingle: async () => ({ data: Array.isArray(data) ? data[0] : data, error: null }),
                            csv: () => mock,
                            then: (onfulfilled: any) => Promise.resolve({ data, error: null, count }).then(onfulfilled)
                        };
                        return mock;
                    };

                    if (table === 'users' && isDummy) {
                        return createMockChain([
                            { id: '00000000-0000-0000-0000-000000000000', username: 'PreviewAdmin', email: 'admin@preview.local', role: 'admin', ad_credits: 500, created_at: new Date().toISOString() }
                        ], 1);
                    }
                    if (table === 'ledger' && isDummy) {
                        return createMockChain([
                            { amount: "100.0000", type: "deposit", created_at: new Date().toISOString() },
                            { amount: "-2.0000", type: "marketplace_purchase", created_at: new Date().toISOString() }
                        ], 2);
                    }
                    if (table === 'marketplace_items' && isDummy) {
                        return createMockChain([
                            { id: 'm1', name: '100 Ad Credits Pack', description: 'Instant credits + bonus', price: "2.0000", type: 'package', reward_ad_credits: 100, reward_amount: "0.5000", active: true }
                        ], 1);
                    }
                    return createMockChain([], 0);
                };
            }

            return Reflect.get(target, prop, receiver);
        }
    });
}
