/**
 * Supabase Server Client
 * 
 * Creates a Supabase client for server-side operations with cookie management.
 * Uses @supabase/ssr for proper SSR integration with Next.js App Router.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server components and API routes.
 */
export async function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables are missing. Prerendering might fail.');
        return {} as any;
    }

    const cookieStore = await cookies();

    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignore in Server Components
                    }
                },
            },
        }
    );
}

/**
 * Creates a Supabase admin client with service role key.
 */
/**
 * Creates a Supabase admin client with service role key.
 * Uses vanilla @supabase/supabase-js to ensure NO cookies/session are used.
 * This guarantees a pure "Service Role" supersedes RLS.
 */
import { createClient as createVanillaClient } from '@supabase/supabase-js';

export async function createAdminClient() { // async to keep signature compatible
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('Supabase Admin environment variables are missing.');
        return {} as any;
    }

    return createVanillaClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
