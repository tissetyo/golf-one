/**
 * Next.js Middleware - Simplified Session Refresh
 * 
 * Reverted to official Supabase boilerplate pattern.
 * This middleware ONLY handles session refreshing to keep the user "logged in."
 * All redirection (forcing login/role checks) is now handled at the page/layout level
 * to prevent recursive looping bugs.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    // We only call updateSession to ensure cookies are refreshed.
    // We NO LONGER perform redirects here to avoid conflicts with App Router page logic.
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
