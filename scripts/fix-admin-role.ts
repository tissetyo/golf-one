/**
 * Admin Role Repair Script
 * 
 * Specifically fixes the role for admin@golf.com if it was set incorrectly.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function repair() {
    console.log('--- Starting Admin Role Repair ---');

    // 1. Find user in auth.users (via profiles helper)
    const { data: profile, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@golf.com')
        .single();

    if (findError || !profile) {
        console.error('Error finding admin profile:', findError?.message || 'Profile not found');
        console.log('Suggestion: Please log out and register admin@golf.com first.');
        return;
    }

    console.log(`Found profile: ${profile.full_name} (${profile.role})`);

    // 2. Force update role to admin
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', profile.id);

    if (updateError) {
        console.error('Error updating role:', updateError.message);
    } else {
        console.log(`SUCCESS: admin@golf.com is now officially an ADMIN.`);
    }

    console.log('--- Repair Complete ---');
}

repair().catch(console.error);
