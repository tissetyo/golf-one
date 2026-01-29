/**
 * FORCE FIX ADMIN ROUTE
 * 
 * Extreme measure to fix the admin profile using the service role key.
 * Bypasses all auth checks to guarantee database write.
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Initialize Service Client directly (Bypassing SSR helpers to be safe)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        return NextResponse.json({ error: 'CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in Vercel env.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('Attempting Force Fix for admin@golf.com...');

    // 2. Find Auth User ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) return NextResponse.json({ error: 'List Users Failed', details: listError }, { status: 500 });

    const adminUser = users.find(u => u.email === 'admin@golf.com');

    if (!adminUser) {
        return NextResponse.json({ error: 'User admin@golf.com does not exist in Auth. Register first.' }, { status: 404 });
    }

    // 3. UPSERT Profile with Admin Role
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: adminUser.id,
            email: 'admin@golf.com',
            full_name: 'MASTER ADMIN',
            role: 'admin', // <--- THE CRITICAL FIELD
            updated_at: new Date().toISOString()
        });

    if (upsertError) {
        return NextResponse.json({ error: 'Profile Upsert Failed', details: upsertError }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: 'Admin Role FORCE APPLIED successfully.',
        user_id: adminUser.id,
        role_set: 'admin'
    });
}
