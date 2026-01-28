/**
 * Travel Category Page (Light Mode)
 * 
 * Lists available travel packages for manual discovery in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import CategoryNav from '@/components/dashboard/CategoryNav';
import { Map, Search, MapPin, Clock, MoreVertical, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import TravelClient from '@/components/category/TravelClient';
import TripSummary from '@/components/booking/TripSummary';

export default async function TravelResultsPage() {
    const supabase = await createClient();

    // Load travel packages
    const { data: packages } = await supabase
        .from('travel_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-7xl mx-auto px-6 py-10">
                <TravelClient initialPackages={packages || []} />
            </main>

            <TripSummary />
        </div>
    );
}

// Removing TravelListItem as it's now internal to TravelClient
