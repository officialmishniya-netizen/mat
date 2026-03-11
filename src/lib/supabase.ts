import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isDummy = supabaseUrl.includes("dummy") || !supabaseUrl || supabaseUrl.includes("localhost:54321");

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: !isDummy,
        autoRefreshToken: !isDummy,
        detectSessionInUrl: !isDummy
    }
});

export const supabase = new Proxy(supabaseClient, {
    get(target, prop, receiver) {
        // Special handling for dummy auth
        if (isDummy && prop === 'auth') {
            return {
                ...target.auth,
                getSession: async () => {
                    const getCookie = (name: string) => {
                        if (typeof window === 'undefined') return undefined;
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; ${name}=`);
                        if (parts.length === 2) return parts.pop()?.split(';').shift();
                    };

                    const cookieToken = getCookie('sb-access-token');

                    return {
                        data: {
                            session: {
                                user: {
                                    id: '00000000-0000-0000-0000-000000000000',
                                    email: 'admin@preview.local',
                                    role: 'authenticated',
                                },
                                access_token: cookieToken || 'mock-token',
                                refresh_token: getCookie('sb-refresh-token') || 'mock-refresh-token',
                            }
                        },
                        error: null
                    };
                },
                signInWithPassword: async ({ email, password }: any) => {
                    return {
                        data: {
                            user: {
                                id: '00000000-0000-0000-0000-000000000000',
                                email: email || 'admin@preview.local',
                                role: 'authenticated',
                            },
                            session: {
                                access_token: 'mock-token',
                                refresh_token: 'mock-refresh-token',
                                user: { id: '00000000-0000-0000-0000-000000000000', email: email || 'admin@preview.local' }
                            }
                        },
                        error: null
                    };
                },
            };
        }

        // For everything else, return the real client property
        return Reflect.get(target, prop, receiver);
    }
});
