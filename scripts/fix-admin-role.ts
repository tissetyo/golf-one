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

    // 1. Get user from auth.users to ensure we have the correct ID and email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const adminUser = users.find(u => u.email === 'admin@golf.com');

    if (!adminUser) {
        console.error('User admin@golf.com not found in auth.users.');
        console.log('Suggestion: Please log out and register admin@golf.com first.');
        return;
    }

    console.log(`Found Auth User: ${adminUser.id} (${adminUser.email})`);

    // 2. Upsert profile record
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: adminUser.id,
            email: adminUser.email,
            full_name: 'System Admin',
            role: 'admin'
        }, { onConflict: 'id' });

    if (upsertError) {
        console.error('Error upserting profile:', upsertError.message);
    } else {
        console.log(`SUCCESS: admin@golf.com now has a profile record with role ADMIN.`);
    }

    console.log('--- Repair Complete ---');
}

repair().catch(console.error);
