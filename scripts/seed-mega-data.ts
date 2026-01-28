/**
 * Mega Content Seeder
 * 
 * Populates the platform with a wide variety of premium golf courses, 
 * five-star hotels, and VVIP travel packages across Indonesia.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- Starting Mega Data Seeding ---');

    // 1. Get an existing admin or vendor for ownership
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
    if (!profiles || profiles.length === 0) {
        console.error('No profiles found. Please register a user first.');
        return;
    }
    const vendorId = profiles[0].id;

    // 3. EXTENDED GOLF COURSES (10 Total)
    const courses = [
        {
            vendor_id: vendorId,
            name: 'Bali National Golf Club',
            description: 'Top-ranked course in Nusa Dua featuring tropical beauty and championship challenges.',
            location: 'Nusa Dua, Bali',
            rating: 4.9,
            price_range: { min: 2500000, max: 4500000 },
            images: ['https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Pondok Indah Golf Course',
            description: 'The iconic World Cup host course in South Jakarta. Deeply strategic and perfectly manicured.',
            location: 'South Jakarta',
            rating: 4.8,
            price_range: { min: 1500000, max: 3500000 },
            images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Sentul Highlands Golf Club',
            description: 'Stunning mountain views and cool air. Designed by Gary Player for maximum scenic impact.',
            location: 'Sentul, Bogor',
            rating: 4.7,
            price_range: { min: 950000, max: 2100000 },
            images: ['https://images.unsplash.com/photo-1592919016381-80775970c805?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Finna Golf & Country Club',
            description: 'Surrounded by the Prigen mountains. Offers a signature 5th hole with a 15-meter drop.',
            location: 'Prigen, East Java',
            rating: 4.6,
            price_range: { min: 800000, max: 1500000 },
            images: ['https://images.unsplash.com/photo-1623659424468-45070248c823?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Ria Bintan Golf Club',
            description: 'Voted one of the best courses in Asia. Features dramatic cliff-side greens by the South China Sea.',
            location: 'Bintan Island',
            rating: 4.9,
            price_range: { min: 1900000, max: 4000000 },
            images: ['https://images.unsplash.com/photo-1532433550544-77f6b907be16?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Gunung Geulis Country Club',
            description: 'Two championship courses nestled in the foothills of Bogor with 360-degree nature views.',
            location: 'Gadog, Bogor',
            rating: 4.5,
            price_range: { min: 750000, max: 1800000 },
            images: ['https://images.unsplash.com/photo-1440778303588-435521a205bc?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Emeralda Golf Club',
            description: 'An Arnie and Jack collaboration. Wide fairways and massive bunker complexes.',
            location: 'Cimanggis, Depok',
            rating: 4.6,
            price_range: { min: 1100000, max: 2400000 },
            images: ['https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=2076&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Handara Golf & Resort Bali',
            description: 'Historic course in the mountain caldera of Bedugul. Famous for its iconic gate and cool weather.',
            location: 'Bedugul, Bali',
            rating: 4.7,
            price_range: { min: 1600000, max: 2800000 },
            images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Klub Golf Bogor Raya',
            description: 'Classic Graham Marsh design known for its pristine condition and elegant clubhouse.',
            location: 'Bogor',
            rating: 4.8,
            price_range: { min: 1300000, max: 2600000 },
            images: ['https://images.unsplash.com/photo-1588693951525-6380630b9101?q=80&w=2073&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Taman Dayu Golf Resort',
            description: 'Peter Thompson design in Pandaan. A brilliant blend of nature and professional challenge.',
            location: 'Pandaan, East Java',
            rating: 4.7,
            price_range: { min: 900000, max: 1950000 },
            images: ['https://images.unsplash.com/photo-1440778303588-435521a205bc?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        }
    ];

    console.log('Seeding 10 Golf Courses...');
    const { data: insertedCourses, error: courseError } = await supabase.from('golf_courses').insert(courses).select();
    if (courseError) console.error('Course Error:', courseError);

    // 4. LUXURY HOTELS (10 Total)
    const hotels = [
        {
            vendor_id: vendorId,
            name: 'The Apurva Kempinski Bali',
            description: 'A majestic open-air theater of luxury in Nusa Dua. Iconic architecture meets Balinese heritage.',
            location: 'Nusa Dua, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'The Ritz-Carlton, Mega Kuningan',
            description: 'Elite urban luxury in the heart of Jakarta. Exceptional butler service and city views.',
            location: 'Kuningan, Jakarta',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Amanjiwo',
            description: 'Overlooking Borobudur temple. One of the world\'s most uniquely designed luxury retreats.',
            location: 'Magelang, Central Java',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'The Bulgari Resort Bali',
            description: 'Sophisticated cliffside living in Uluwatu. Private beach access and unmatched elegance.',
            location: 'Uluwatu, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Raffles Jakarta',
            description: 'Art-inspired luxury in the Ciputra World building. A haven for those who appreciate fine detail.',
            location: 'Lotte Avenue, Jakarta',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Viceroy Bali',
            description: 'Private pool villas overlooking the Valley of the Kings. Pure serenity in Ubud.',
            location: 'Ubud, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Mandapa, a Ritz-Carlton Reserve',
            description: 'A secluded sanctuary along the Ayung River. Luxurious river-front suites and personal Patih service.',
            location: 'Ubud, Bali',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1551882547-ff43c63faf76?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'InterContinental Bandung Dago',
            description: 'Contemporary luxury in the Bandung highlands. Located right next to Dago Heritage Golf.',
            location: 'Dago Hill, Bandung',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2050&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Fairmont Jakarta',
            description: 'Adjacent to Plaza Senayan and Senayan Golf. Spacious rooms with impeccable city skyline views.',
            location: 'Senayan, Jakarta',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1563911516450-93666b6c68a4?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Nihi Sumba',
            description: 'Wild, rustic luxury on the edge of the world. Voted world\'s best hotel multiple times.',
            location: 'Sumba, NTT',
            star_rating: 5,
            images: ['https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=2070&auto=format&fit=crop'],
            is_active: true
        }
    ];

    console.log('Seeding 10 Hotels...');
    const { data: insertedHotels, error: hotelError } = await supabase.from('hotels').insert(hotels).select();
    if (hotelError) console.error('Hotel Error:', hotelError);

    // 5. TRAVEL PACKAGES (Improved)
    const travel = [
        {
            vendor_id: vendorId,
            name: 'VVIP Alphard Airport Transfer',
            description: 'Chauffeured luxury transfer with VIP meet-and-greet services.',
            package_type: 'airport_transfer',
            price: 850000,
            duration_hours: 2,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Bali Golf Course Helicopter Hop',
            description: 'Avoid traffic and fly directly from the airport to the golf resort in a luxury Airbus H130.',
            package_type: 'custom',
            price: 15000000,
            duration_hours: 1,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Borobudur Heritage Early Bird Tour',
            description: 'Guided sunrise tour of Borobudur followed by a private breakfast in the temple grounds.',
            package_type: 'day_tour',
            price: 2500000,
            duration_hours: 6,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Private Speedboat Charter (Lombok)',
            description: 'Fast transport from Bali to Lombok for a round at Sire Beach Golf.',
            package_type: 'custom',
            price: 8500000,
            duration_hours: 3,
            is_active: true
        },
        {
            vendor_id: vendorId,
            name: 'Jakarta Nightlife Golf Escort',
            description: 'Secure transport and reservations for the city\'s most exclusive social clubs after your game.',
            package_type: 'day_tour',
            price: 1200000,
            duration_hours: 8,
            is_active: true
        }
    ];

    console.log('Seeding Travel Packages...');
    const { error: travelError } = await supabase.from('travel_packages').insert(travel);
    if (travelError) console.error('Travel Error:', travelError);

    // 6. Generate Tee Times for ALL new courses
    if (insertedCourses) {
        console.log('Generating dynamic tee times...');
        const allTeeTimes: any[] = [];
        insertedCourses.forEach(course => {
            ['07:00:00', '08:30:00', '10:00:00', '13:00:00', '15:30:00'].forEach(time => {
                allTeeTimes.push({
                    course_id: course.id,
                    date: new Date().toISOString().split('T')[0],
                    time: time,
                    price: course.price_range?.min || 1000000,
                    available_slots: 4,
                    is_available: true
                });
            });
        });
        await supabase.from('tee_times').insert(allTeeTimes);
    }

    console.log('--- Mega Seeding Complete! The platform is now full of life. ---');
}

seed().catch(console.error);
