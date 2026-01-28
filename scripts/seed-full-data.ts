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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedFullData() {
    console.log('🚀 Starting full flow data seeding...');

    try {
        // 1. Get Vendor IDs from users we created in previous step
        const { data: userData } = await supabase.from('profiles').select('id, role, email');

        const golfVendor = userData?.find(u => u.role === 'golf_vendor')?.id;
        const hotelVendor = userData?.find(u => u.role === 'hotel_vendor')?.id;
        const travelVendor = userData?.find(u => u.role === 'travel_vendor')?.id;
        const userRole = userData?.find(u => u.role === 'user')?.id;

        if (!golfVendor || !hotelVendor || !travelVendor || !userRole) {
            console.error('❌ Could not find requisite vendors or user. Please run seed-users.ts first.');
            return;
        }

        console.log('Found vendors. Seeding catalog...');

        // 2. Seed Golf Courses
        const { data: courses, error: courseErr } = await supabase.from('golf_courses').upsert([
            {
                vendor_id: golfVendor,
                name: 'Bali National Golf Club',
                description: 'Award-winning golf course with stunning ocean views and championship fairways.',
                location: 'Nusa Dua, Bali',
                price_range: { min: 2500000, max: 4000000 },
                rating: 4.9,
                amenities: ['Pro Shop', 'Locker Room', 'Restaurant', 'Driving Range']
            },
            {
                vendor_id: golfVendor,
                name: 'Sentul Highlands Golf Club',
                description: 'Challenging mountain course with cool breeze and beautiful pine trees.',
                location: 'Bogor, West Java',
                price_range: { min: 1200000, max: 2000000 },
                rating: 4.5,
                amenities: ['Spa', 'Pool', 'Golf Academy']
            },
            {
                vendor_id: golfVendor,
                name: 'Rancamaya Golf & Country Club',
                description: 'Pristine fairways overlooking Mount Salak.',
                location: 'Bogor, West Java',
                price_range: { min: 1100000, max: 1800000 },
                rating: 4.7,
                amenities: ['Clubhouse', 'Gym', 'Tennis Court']
            }
        ]).select();

        if (courseErr) console.error('Course Error:', courseErr);
        const courseId = courses?.[0]?.id;

        // 3. Seed Tee Times
        if (courseId) {
            const dates = [0, 1, 2, 7].map(d => {
                const date = new Date();
                date.setDate(date.getDate() + d);
                return date.toISOString().split('T')[0];
            });

            const teeTimes = [];
            for (const d of dates) {
                teeTimes.push(
                    { course_id: courseId, date: d, time: '07:00:00', available_slots: 4, price: 2500000 },
                    { course_id: courseId, date: d, time: '09:00:00', available_slots: 2, price: 2500000 },
                    { course_id: courseId, date: d, time: '13:00:00', available_slots: 4, price: 2000000 }
                );
            }
            await supabase.from('tee_times').upsert(teeTimes);
        }

        // 4. Seed Caddies
        if (courseId) {
            await supabase.from('caddies').upsert([
                { course_id: courseId, name: 'Santi', experience_years: 5, rating: 4.9, hourly_rate: 200000 },
                { course_id: courseId, name: 'Budi', experience_years: 8, rating: 4.8, hourly_rate: 250000 },
                { course_id: courseId, name: 'Adi', experience_years: 3, rating: 4.6, hourly_rate: 150000 }
            ]);
        }

        // 5. Seed Hotels
        const { data: hotels } = await supabase.from('hotels').upsert([
            {
                vendor_id: hotelVendor,
                name: 'The St. Regis Bali Resort',
                description: 'Exquisite luxury beachfront living with private butler service.',
                location: 'Nusa Dua, Bali',
                star_rating: 5,
                amenities: ['Beach Access', 'Butler', 'Spa', 'Pool']
            },
            {
                vendor_id: hotelVendor,
                name: 'Pullman Ciawi Vimala Hills',
                description: 'Modern resort close to Bogor golf courses.',
                location: 'Ciawi, Bogor',
                star_rating: 5,
                amenities: ['Kids Club', 'Gym', 'Heated Pool']
            }
        ]).select();

        const hotelId = hotels?.[0]?.id;

        // 6. Seed Hotel Rooms
        if (hotelId) {
            await supabase.from('hotel_rooms').upsert([
                { hotel_id: hotelId, room_type: 'Grand Deluxe', description: 'Spacious room with pool view.', price_per_night: 4500000, capacity: 2 },
                { hotel_id: hotelId, room_type: 'Laguna Villa', description: 'Private villa with lagoon access.', price_per_night: 8000000, capacity: 4 }
            ]);
        }

        // 7. Seed Travel Packages
        await supabase.from('travel_packages').upsert([
            {
                vendor_id: travelVendor,
                name: 'Airport Transfer (VVIP)',
                description: 'Alphard pick-up from Ngurah Rai to Hotel.',
                package_type: 'airport_transfer',
                price: 800000,
                duration_hours: 2,
                includes: ['Refreshments', 'Porter Service']
            },
            {
                vendor_id: travelVendor,
                name: 'Uluwatu Sunset Tour',
                description: 'Private tour to Uluwatu temple and Kecak dance.',
                package_type: 'day_tour',
                price: 1200000,
                duration_hours: 6,
                includes: ['Driver', 'Fuel', 'Guide']
            }
        ]);

        // 8. Seed Example Bookings
        console.log('Seeding sample bookings...');
        const { data: sampleBooking } = await supabase.from('bookings').upsert([
            {
                user_id: userRole,
                booking_type: 'package',
                status: 'pending_approval',
                total_amount: 7800000,
                booking_details: {
                    golf: { course_id: courseId, date: '2026-02-15', players: 2 },
                    hotel: { hotel_id: hotelId, check_in: '2026-02-14', check_out: '2026-02-16' },
                    travel: { package_name: 'Luxury Transfer' }
                },
                vendor_approvals: {
                    [golfVendor]: { status: 'pending' },
                    [hotelVendor]: { status: 'pending' },
                    [travelVendor]: { status: 'pending' }
                }
            },
            {
                user_id: userRole,
                booking_type: 'golf',
                status: 'paid',
                total_amount: 2500000,
                booking_details: {
                    golf: { course_id: courseId, date: '2026-01-20', players: 1 }
                },
                vendor_approvals: {
                    [golfVendor]: { status: 'approved' }
                }
            }
        ]).select();

        // 9. Seed Payments for the 'paid' booking
        const paidBookingId = sampleBooking?.find(b => b.status === 'paid')?.id;
        if (paidBookingId) {
            const { data: payment } = await supabase.from('payments').upsert([
                {
                    booking_id: paidBookingId,
                    xendit_external_id: `INV-TEST-${Date.now()}`,
                    amount: 2500000,
                    status: 'paid',
                    payment_type: 'BANK_TRANSFER'
                }
            ]).select();

            // Seed split settlement for admin
            if (payment?.[0]?.id) {
                await supabase.from('split_settlements').upsert([
                    {
                        payment_id: payment[0].id,
                        vendor_id: golfVendor,
                        amount: 2375000, // 95%
                        status: 'pending'
                    }
                ]);
            }
        }

        // 10. Seed Scores
        if (userRole && courseId) {
            await supabase.from('golf_scores').upsert([
                {
                    user_id: userRole,
                    course_id: courseId,
                    date: '2026-01-20',
                    total_strokes: 85,
                    sync_status: 'synced',
                    scores: {
                        "1": { strokes: 4, par: 4 },
                        "2": { strokes: 5, par: 4 },
                        "3": { strokes: 3, par: 3 }
                    }
                }
            ]);
        }

        console.log('✅ Full Flow Data Seeding Complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    }
}

seedFullData();
