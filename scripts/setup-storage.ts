
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Hack for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('📦 Setting up Storage Bucket: "campaigns"...');

    // 1. Create Bucket
    const { data: bucket, error } = await supabase
        .storage
        .createBucket('campaigns', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
        });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Bucket "campaigns" already exists.');
        } else {
            console.error('❌ Failed to create bucket:', error);
        }
    } else {
        console.log('✅ Bucket "campaigns" created successfully.');
    }

    // 2. Storage Policies (Standard way is via SQL, but let's try to inform the user)
    // Supabase Storage policies often need SQL. The service_key upload bypasses policies,
    // but purely client-side viewing needs a "Public" bucket (checked above).

    console.log('NOTE: Ensure you have run the database migration to create the tables!');
}

setupStorage();
