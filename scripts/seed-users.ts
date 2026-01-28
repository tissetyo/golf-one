import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables in .env.local');
    process.exit(1);
}

// Initialize Supabase client with Service Role Key to bypass RLS and confirmations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const testUsers = [
    { email: 'admin@golf.com', password: 'Password123!', role: 'admin', fullName: 'System Admin' },
    { email: 'golf@golf.com', password: 'Password123!', role: 'golf_vendor', fullName: 'Bali Golf Club' },
    { email: 'hotel@golf.com', password: 'Password123!', role: 'hotel_vendor', fullName: 'Emerald Resort' },
    { email: 'travel@golf.com', password: 'Password123!', role: 'travel_vendor', fullName: 'Island Tours' },
    { email: 'user@golf.com', password: 'Password123!', role: 'user', fullName: 'John Golfer' },
];

async function seedUsers() {
    console.log('🚀 Starting user seeding...');

    for (const user of testUsers) {
        console.log(`Creating user: ${user.email} (${user.role})...`);

        // 1. Create the user in Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.fullName,
                role: user.role
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`User ${user.email} already exists. Updating metadata...`);

                // Find user by email
                const { data: listData } = await supabase.auth.admin.listUsers();
                const existingUser = listData.users.find(u => u.email === user.email);

                if (existingUser) {
                    await supabase.auth.admin.updateUserById(existingUser.id, {
                        user_metadata: {
                            full_name: user.fullName,
                            role: user.role
                        }
                    });

                    // Also update profile table manually just in case
                    await supabase
                        .from('profiles')
                        .update({ role: user.role, full_name: user.fullName })
                        .eq('id', existingUser.id);
                }
            } else {
                console.error(`Error creating ${user.email}:`, authError.message);
            }
            continue;
        }

        console.log(`✅ User ${user.email} created successfully!`);
    }

    console.log('\n✨ Seeding complete! You can now log in with Password123!');
}

seedUsers();
