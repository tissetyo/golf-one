/**
 * Hotels Category Page (Light Mode)
 * 
 * Lists available hotels near golf courses for manual discovery in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import CategoryNav from '@/components/dashboard/CategoryNav';
import { Hotel, Search, MapPin, Star, MoreVertical, Wifi, Coffee, Car } from 'lucide-react';
import Link from 'next/link';

import HotelsClient from '@/components/category/HotelsClient';
import TripSummary from '@/components/booking/TripSummary';

export default async function HotelsResultsPage() {
    const supabase = await createClient();

    // Load hotels
    const { data: hotels } = await supabase
        .from('hotels')
        .select('*')
        .eq('is_active', true)
        .order('star_rating', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-7xl mx-auto px-6 py-10">
                <HotelsClient initialHotels={hotels || []} />
            </main>

            <TripSummary />
        </div>
    );
}

// Removing HotelListItem as it's now internal to HotelsClient
