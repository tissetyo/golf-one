/**
 * Auth Callback Handler
 * 
 * Handles OAuth callback and email confirmation redirects.
 * Exchanges the auth code for a session.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/chat';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Get user role for proper redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                let redirectPath = next;
                if (next === '/chat') {
                    switch (profile?.role) {
                        case 'admin':
                            redirectPath = '/admin';
                            break;
                        case 'golf_vendor':
                            redirectPath = '/golf-vendor';
                            break;
                        case 'hotel_vendor':
                            redirectPath = '/hotel-vendor';
                            break;
                        case 'travel_vendor':
                            redirectPath = '/travel-vendor';
                            break;
                    }
                }

                return NextResponse.redirect(`${origin}${redirectPath}`);
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return to login page with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
