/**
 * User Dashboard Home (Grab-Style Super App UX)
 * 
 * Central hub for golfers with a mobile-first density.
 * Features icon-grid navigation, quick status bar, and featured recommendations.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ServiceGrid from '@/components/dashboard/ServiceGrid';
import QuickStats from '@/components/dashboard/QuickStats';
import { Trophy, Calendar, MapPin, ChevronRight, Star, Search, Wallet, Bell, Sparkles, LogOut } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

    // REMOVED aggressive redirect loop logic.
    // If an Admin lands here, we just show them the user view or provide a link back.
    // This stops the infinite middleware-to-page bounce.

    // Load active bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(2);

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20">
            {/* Grab-style Sticky Header */}
            <header className="px-6 py-6 bg-emerald-600 text-white sticky top-0 z-30 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-emerald-700 flex items-center justify-center font-black">
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-80 leading-none mb-1 text-emerald-100">Welcome,</p>
                            <p className="text-sm font-black leading-none">{profile?.full_name?.split(' ')[0] || 'Member'}</p>
                        </div>
                    </div>

                    {/* Role indicator link for Admins/Vendors who land here */}
                    {profile?.role && profile.role !== 'user' && (
                        <Link href={profile.role === 'admin' ? '/admin' : `/${profile.role.replace('_', '-')}`} className="mx-4 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase hover:bg-white/30 transition-all">
                            Switch to {profile.role.replace('_', ' ')} Hub
                        </Link>
                    )}

                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-emerald-500/50 rounded-full hover:bg-emerald-500/80 transition-all border border-white/10">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-emerald-500/50 rounded-full hover:bg-emerald-500/80 transition-all border border-white/10">
                            <Sparkles className="w-5 h-5" />
                        </button>
                        <Link href="/auth/logout" className="p-2.5 bg-red-500/50 rounded-full hover:bg-red-500/80 transition-all border border-white/10 text-white" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
                    <input
                        type="text"
                        placeholder="Search Golf, Hotels & More..."
                        className="w-full pl-11 pr-4 py-4 bg-emerald-500/50 border border-emerald-400/30 rounded-2xl text-sm placeholder:text-emerald-100/60 focus:outline-none focus:bg-white focus:text-gray-900 focus:ring-4 focus:ring-black/5 transition-all font-bold"
                    />
                </div>
            </header>

            {/* Quick Status Bar */}
            <QuickStats initialBalance={12500000} initialPoints={2450} />

            <main className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
                {/* Service Grid */}
                <section>
                    <ServiceGrid />
                </section>

                {/* My Trips Area */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-gray-900">
                            <Calendar className="w-6 h-6 text-emerald-600" />
                            Active Bookings
                        </h2>
                        <Link href="/user/bookings" className="text-[10px] font-black uppercase tracking-widest text-emerald-600">View History</Link>
                    </div>

                    {bookings && bookings.length > 0 ? (
                        <div className="grid gap-4">
                            {bookings.map((booking: any) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 bg-gray-50 rounded-[32px] border border-dashed border-gray-200 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                                <Calendar className="w-8 h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold mb-2">No active bookings</p>
                            <p className="text-xs text-gray-400 mb-6 max-w-[200px]">Start your golf journey by exploring world-class courses.</p>
                            <Link href="/user/golf" className="text-xs font-black uppercase tracking-widest text-emerald-600 px-6 py-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">Find a Course</Link>
                        </div>
                    )}
                </section>
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
        <div className="p-6 bg-white border border-gray-100 rounded-[32px] hover:border-emerald-200 transition-all cursor-pointer shadow-sm hover:shadow-xl group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {booking.booking_type === 'golf' ? <Trophy className="w-5 h-5 text-emerald-600" /> : <Calendar className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div>
                        <p className="font-black capitalize text-gray-900 text-sm tracking-tight">{booking.booking_type} Trip</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(booking.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusColors[booking.status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {booking.status.replace('_', ' ')}
                </span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <p className="text-base font-black text-gray-900 tracking-tight">Rp {Number(booking.total_amount).toLocaleString()}</p>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
