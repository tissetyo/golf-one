/**
 * Next.js Middleware for Authentication and Role-Based Access Control
 * 
 * Protects routes based on authentication status and user roles.
 * Uses Supabase SSR for session management.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Route configurations
const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/api/debug-role'];

/**
 * Middleware function that runs on every request.
 * Handles session refresh and role-based access control.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Refresh session and get user
    const { supabaseResponse, user } = await updateSession(request);

    // Allow public routes immediately
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug-role'))) {
        return supabaseResponse;
    }

    // Allow API routes for payments (webhooks)
    if (pathname.startsWith('/api/payments/webhook')) {
        return supabaseResponse;
    }

    // Redirect unauthenticated users to login
    if (!user) {
        // Only redirect if it's a dashboard or app route
        const protectedPrefixes = ['/admin', '/user', '/golf-vendor', '/hotel-vendor', '/travel-vendor', '/chat', '/booking', '/scores'];
        if (protectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);

            // Create a NEW redirect response but COPY THE COOKIES from supabaseResponse
            const redirectResponse = NextResponse.redirect(loginUrl);
            supabaseResponse.cookies.getAll().forEach(cookie => {
                redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
            });
            return redirectResponse;
        }
        return supabaseResponse;
    }

    // Optimization: Don't do heavy role-checks in middleware for EVERY assets/action
    // The page-level Role Guards will handle the specialized dash routing logic
    // which is more robust and has better access to full database context.

    return supabaseResponse;
}

// Configure which routes the middleware should run on
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
