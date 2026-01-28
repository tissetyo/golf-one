/**
 * Supabase Middleware Client
 * 
 * Creates a Supabase client for Next.js middleware.
 * Handles session refresh and cookie updates.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Updates the Supabase session in middleware.
 * This ensures the session is refreshed on each request.
 * 
 * @param request - Next.js request object
 * @returns Response with updated session cookies
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Do not write code between createServerClient and getUser()
    // A simple mistake could make your app very slow!

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { supabaseResponse, user, supabase };
}
