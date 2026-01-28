/**
 * Golf Category Page (Light Mode)
 * 
 * Lists available golf courses for manual discovery in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import CategoryNav from '@/components/dashboard/CategoryNav';
import { Flag, Search, MapPin, Star, MoreVertical } from 'lucide-react';
import Link from 'next/link';

import GolfCoursesClient from '@/components/category/GolfCoursesClient';
import TripSummary from '@/components/booking/TripSummary';

export default async function GolfResultsPage() {
    const supabase = await createClient();

    // Load golf courses
    const { data: courses } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-7xl mx-auto px-6 py-10">
                <GolfCoursesClient initialCourses={courses || []} />
            </main>

            <TripSummary />
        </div>
    );
}

// Removing CourseListItem as it's now internal to GolfCoursesClient
