/**
 * Supabase Middleware Client (Production-Stable)
 * 
 * Standardized pattern for session refresh in Next.js Middleware.
 * Ref: https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
    // 1. Create an initial response
    let supabaseResponse = NextResponse.next({
        request,
    });

    // 2. Initialize Supabase client with robust cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    // Update request cookies for downstream components
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );

                    // Re-initialize response to include the new cookies
                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    // Apply cookies to the response object
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 3. getUser() - This is critical as it triggers session refresh/setAll
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 4. Return both the updated response (with valid cookies) and the user status
    return { supabaseResponse, user };
}
