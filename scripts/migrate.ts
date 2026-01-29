
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Hack for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function migrate() {
    // We need the direct connection string (often called DATABASE_URL)
    // Supabase usually provides this. If not in env, we might fail.
    const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_DB_URL;
    // The user might not have DATABASE_URL set if they only used Client keys.
    // Let's check.

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL not found in .env.local');
        console.log('Please add your Supabase "Connection String" (URI) to .env.local as DATABASE_URL');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase in many cases
    });

    try {
        await client.connect();
        console.log('✅ Connected to Database');

        const sqlPath = path.resolve(__dirname, '../supabase/migrations/002_admin_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('⚡ Applying Migration: 002_admin_settings.sql...');
        await client.query(sql);

        console.log('✅ Migration Complete!');
    } catch (err) {
        console.error('❌ Migration Failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
