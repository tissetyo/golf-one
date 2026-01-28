/**
 * Premium Content Seeder
 * 
 * Populates the platform with luxury golf courses, five-star hotels, 
 * and premium travel packages using high-quality image URLs.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Starting Premium Data Seeding ---');

    // 1. Get an existing admin or vendor for ownership
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    if (!profiles || profiles.length === 0) {
        console.error('No profiles found. Please register a user first.');
        return;
    }
    const vendorId = profiles[0].id;

    // 2. Clear existing entries (Optional, keep for clean state)
    // await supabase.from('golf_courses').delete().neq('id', uuidv4());
    // await supabase.from('hotels').delete().neq('id', uuidv4());
    // await supabase.from('travel_packages').delete().neq('id', uuidv4());

    // 3. GOLF COURSES
    const courses = [
        {
            vendor_id: vendorId,
            name: 'Bali National Golf Club',
            description: 'Experience a world-class course in the heart of Nusa Dua. Known for its challenging par-3 17th hole over a lake.',
            location: 'Nusa Dua, Bali',
            rating: 4.9,
            price_range: { min: 2500000, max: 4500000 },
            images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Royale Jakarta Golf Club',
            description: 'The preferred course for the Indonesian Masters. Features 27 championship holes with manicured fairways.',
            location: 'Halim, Jakarta',
            rating: 4.8,
            price_range: { min: 1800000, max: 3200000 },
            images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Pandan Valley Golf Resort',
            description: 'Nestled in the lush hills of Bandung, offering cooler temperatures and dramatic elevation changes.',
            location: 'Dago Hill, Bandung',
            rating: 4.7,
            price_range: { min: 1200000, max: 2500000 },
            images: ['https://images.unsplash.com/photo-1623659424468-45070248c823?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        }
    ];

    console.log('Seeding Golf Courses...');
    const { data: insertedCourses, error: courseError } = await supabase.from('golf_courses').insert(courses).select();
    if (courseError) console.error('Course Error:', courseError);

    // 4. HOTELS
    const hotels = [
        {
            vendor_id: vendorId,
            name: 'The St. Regis Bali Resort',
            description: 'Ultra-luxury suites and villas beside the Indian Ocean. Direct accessibility to Bali National Golf Club.',
            location: 'Nusa Dua, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Four Seasons Resort Jimbaran',
            description: 'Authentic Balinese villas carved into the cliffside with breathtaking sunsets and private plunge pools.',
            location: 'Jimbaran Bay, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Ritz-Carlton Pacific Place',
            description: 'Contemporary luxury in the heart of Jakarta SCBD. Perfect for business golfers needing urban access.',
            location: 'Jakarta, SCBD',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        }
    ];

    console.log('Seeding Hotels...');
    const { data: insertedHotels, error: hotelError } = await supabase.from('hotels').insert(hotels).select();
    if (hotelError) console.error('Hotel Error:', hotelError);

    // 5. TRAVEL PACKAGES
    const travel = [
        {
            vendor_id: vendorId,
            name: 'VVIP Alphard Airport Transfer',
            description: 'Luxury chauffeured transfer from Ngurah Rai Airport to Nusa Dua in a Toyota Alphard. Includes fresh towels and beverages.',
            package_type: 'airport_transfer',
            price: 850000,
            duration_hours: 2,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Private Ubud Art & Golf Tour',
            description: 'A full-day guided tour through Ubud art galleries followed by a spectacular sunset round of golf.',
            package_type: 'day_tour',
            price: 1800000,
            duration_hours: 8,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Luxury Yacht Golf Getaway',
            description: 'Sail to Nusa Penida for the morning, then return for a premium caddy-assisted golf session.',
            package_type: 'custom',
            price: 12500000,
            duration_hours: 12,
            is_active: true
        }
    ];

    console.log('Seeding Travel Packages...');
    const { error: travelError } = await supabase.from('travel_packages').insert(travel);
    if (travelError) console.error('Travel Error:', travelError);

    // 6. Seed some Tee Times for the first course
    if (insertedCourses && insertedCourses.length > 0) {
        const teeTimes = [
            {
                course_id: insertedCourses[0].id,
                date: new Date().toISOString().split('T')[0],
                time: '07:30:00',
                price: 2500000,
                available_slots: 4,
                is_available: true
            },
            {
                course_id: insertedCourses[0].id,
                date: new Date().toISOString().split('T')[0],
                time: '09:00:00',
                price: 2800000,
                available_slots: 4,
                is_available: true
            }
        ];
        console.log('Seeding Tee Times...');
        await supabase.from('tee_times').insert(teeTimes);
    }

    console.log('--- Seeding Complete! Enjoy your premium golf experience. ---');
}

seed().catch(console.error);
