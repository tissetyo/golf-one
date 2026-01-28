/**
 * Hotel Vendor Dashboard (Light Mode)
 * 
 * Manage occupancy and guest bookings in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, Bed, Calendar, CheckCircle, XCircle, TrendingUp, DollarSign, Activity, Users } from 'lucide-react';

export default async function HotelVendorDashboard() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify role
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile?.role !== 'hotel_vendor') redirect('/chat');

    // Fetch Stats
    const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { data: rooms } = await supabase.from('hotel_rooms').select('capacity');
    const totalCapacity = rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar - Light */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">Hotel Hub</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink href="/hotel-vendor" active icon={<Activity />} label="Overview" />
                        <NavLink href="/hotel-vendor/rooms" icon={<Bed />} label="Rooms" />
                        <NavLink href="/hotel-vendor/calendar" icon={<Calendar />} label="Calendar" />
                        <NavLink href="/hotel-vendor/bookings" icon={<CheckCircle />} label="Approved" />
                    </nav>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-black">Room Management</h1>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100 transition-all">
                            Sync Channels
                        </button>
                        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all">
                            Manual Booking
                        </button>
                    </div>
                </header>

                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard title="Confirmed Guests" value={bookingCount || 0} icon={<Users />} color="blue" />
                        <StatCard title="Revenue (MTD)" value="Rp 82.5M" icon={<DollarSign />} color="emerald" />
                        <StatCard title="Total Capacity" value={totalCapacity} icon={<Users className="w-6 h-6" />} color="amber" />
                        <StatCard title="Avg Occupancy" value="78%" icon={<TrendingUp />} color="purple" />
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <h2 className="text-xl font-black mb-6">Upcoming Check-ins</h2>
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No arrivals today</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, label, active = false }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </Link>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm transition-all hover:border-blue-200">
            <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4 border`}>
                {icon}
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        </div>
    );
}
