/**
 * User Dashboard Home (Light Mode)
 * 
 * Central hub for golfers. 
 * Provides category-based entry points and featured content in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CategoryCards from '@/components/dashboard/CategoryCards';
import { Trophy, Calendar, MapPin, ChevronRight, Star, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function UserDashboardPage() {
    const supabase = await createClient();

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Load user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Load active bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(2);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Top Banner / Header */}
            <div className="relative h-80 bg-emerald-50 overflow-hidden border-b border-emerald-100 flex items-center">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent)]"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-200 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 w-full">
                    <h1 className="text-5xl font-black mb-4 text-gray-900 leading-tight">
                        Welcome back, <br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent underline decoration-emerald-200/40">{profile?.full_name?.split(' ')[0] || 'Golfer'}</span>!
                    </h1>
                    <p className="text-gray-500 max-w-xl text-lg font-medium leading-relaxed">
                        Where would you like to play next? Browse our premier categories below or start a session with our AI Trip Planner.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-10">
                {/* Large Category Cards */}
                <section className="mb-20">
                    <CategoryCards />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Bookings Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                    Your Active Bookings
                                </h2>
                                <Link href="/user/bookings" className="text-sm text-emerald-600 font-bold hover:underline">View All</Link>
                            </div>

                            {bookings && bookings.length > 0 ? (
                                <div className="grid gap-4">
                                    {bookings.map((booking) => (
                                        <BookingCard key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 bg-white rounded-3xl border border-dashed border-gray-200 text-center shadow-sm">
                                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No active bookings found.</p>
                                    <Link href="/user/golf" className="text-emerald-600 text-sm font-bold mt-2 block">Start exploring →</Link>
                                </div>
                            )}
                        </section>

                        {/* Featured Recommendations */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Featured for You
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FeaturedCard
                                    title="Bali National Golf Club"
                                    location="Nusa Dua, Bali"
                                    rating={4.8}
                                    price="Rp 2.500.000"
                                    type="golf"
                                />
                                <FeaturedCard
                                    title="The St. Regis Bali Resort"
                                    location="Nusa Dua, Bali"
                                    rating={5.0}
                                    price="Rp 8.000.000"
                                    type="hotel"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* AI Assistant Quick Tool */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 shadow-xl shadow-emerald-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                            <div className="relative">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">Need a full plan?</h3>
                                <p className="text-emerald-100/90 text-sm mb-6 font-medium">
                                    Our AI can organize your entire trip—golf, hotels, and transport—in one go.
                                </p>
                                <Link
                                    href="/user/ai-assistant"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 rounded-xl font-black text-sm uppercase tracking-tight hover:shadow-lg transition-all"
                                >
                                    Start Agent
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Recent Best Scores */}
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Your Best Rounds
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center font-bold text-emerald-600 text-sm">#1</div>
                                        <div>
                                            <p className="text-sm font-bold">Bali National</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-black">85 Strokes</p>
                                        </div>
                                    </div>
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <Link href="/scores" className="mt-8 pt-4 border-t border-gray-100 block text-center text-xs font-black uppercase text-gray-400 hover:text-emerald-600 transition-colors">
                                View Score Stats
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BookingCard({ booking }: { booking: any }) {
    const statusColors: any = {
        pending_approval: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        paid: 'bg-blue-50 text-blue-600 border-blue-100',
    };

    return (
        <div className="group p-6 bg-white border border-gray-200 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                        {booking.booking_type === 'golf' ? <Trophy className="w-5 h-5 text-emerald-600" /> : <Calendar className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div>
                        <p className="font-bold capitalize text-gray-800">{booking.booking_type} Trip</p>
                        <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black border ${statusColors[booking.status] || 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                    {booking.status.replace('_', ' ')}
                </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 group-hover:border-emerald-50">
                <p className="text-sm font-black text-gray-900">Rp {Number(booking.total_amount).toLocaleString()}</p>
                <span className="text-xs text-gray-400 font-bold group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
                    Details <ChevronRight className="w-3 h-3" />
                </span>
            </div>
        </div>
    );
}

function FeaturedCard({ title, location, rating, price, type }: any) {
    return (
        <div className="bg-white border border-gray-200 hover:border-emerald-300 rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all">
            <div className="h-40 bg-gray-100 relative">
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-gray-600 border border-gray-200 shadow-sm">
                    Featured {type}
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{title}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3 h-3" /> {location}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-600">{price}</span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
