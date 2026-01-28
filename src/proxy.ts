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
const publicRoutes = ['/', '/login', '/register', '/auth/callback'];
const roleRoutes: Record<string, string[]> = {
    admin: ['/admin'],
    golf_vendor: ['/golf-vendor'],
    hotel_vendor: ['/hotel-vendor'],
    travel_vendor: ['/travel-vendor'],
    user: ['/user', '/chat', '/booking', '/scores'],
};

/**
 * Middleware function that runs on every request.
 * Handles session refresh and role-based access control.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Refresh session and get user
    const { supabaseResponse, user, supabase } = await updateSession(request);

    // Allow public routes
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/auth'))) {
        return supabaseResponse;
    }

    // Allow API routes for payments (webhooks)
    if (pathname.startsWith('/api/payments/webhook')) {
        return supabaseResponse;
    }

    // Redirect unauthenticated users to login
    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Get user role from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || 'user';

    // Check role-based access
    for (const [role, routes] of Object.entries(roleRoutes)) {
        const isRoleRoute = routes.some((route) => pathname.startsWith(route));

        if (isRoleRoute) {
            // Admin has access to everything
            if (userRole === 'admin') {
                return supabaseResponse;
            }

            // Check if user has the required role
            if (role !== userRole) {
                // Redirect to appropriate dashboard
                const redirectPath = getDashboardPath(userRole);
                return NextResponse.redirect(new URL(redirectPath, request.url));
            }
        }
    }

    return supabaseResponse;
}

/**
 * Get the dashboard path for a specific role.
 */
function getDashboardPath(role: string): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'golf_vendor':
            return '/golf-vendor';
        case 'hotel_vendor':
            return '/hotel-vendor';
        case 'travel_vendor':
            return '/travel-vendor';
        default:
            return '/chat';
    }
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
