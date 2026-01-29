/**
 * Role Debug Route
 * 
 * Returns the current user's profile data for debugging role issues.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
        },
        profile: profile || 'No profile found in public.profiles table'
    });
}
