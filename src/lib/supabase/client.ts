/**
 * Supabase Browser Client
 * 
 * Creates a Supabase client for client-side operations.
 * Uses @supabase/ssr for proper browser integration.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser/client components.
 * This client automatically handles authentication state.
 * 
 * @returns Supabase browser client instance
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase client environment variables are missing.');
        return {} as any;
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    );
}
