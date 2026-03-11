import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    const username = params.username;

    if (!username) {
        return NextResponse.redirect(new URL('/auth/register', request.url));
    }

    // Set the referral cookie for 30 days
    const cookieStore = cookies();
    cookieStore.set('ref', username, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    // Optional: Verify if user exists in DB to prevent invalid refs? 
    // Usually, we just set the cookie and handle it at registration.

    return NextResponse.redirect(new URL('/auth/register', request.url));
}
