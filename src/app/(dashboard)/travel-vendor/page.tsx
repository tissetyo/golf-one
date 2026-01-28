/**
 * Travel Vendor Dashboard (Light Mode)
 * 
 * Manage fleet and tour assignments in a clean light theme.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Map, Users, Calendar, Ship, Car, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

export default async function TravelVendorDashboard() {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Verify role
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile?.role !== 'travel_vendor') redirect('/chat');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Map className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900">Travel Ops</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink href="/travel-vendor" active icon={<Map />} label="Fleet Overview" />
                        <NavLink href="/travel-vendor/transfers" icon={<Car />} label="Airport Transf." />
                        <NavLink href="/travel-vendor/tours" icon={<Ship />} label="Day Tours" />
                        <NavLink href="/travel-vendor/bookings" icon={<CheckCircle />} label="Bookings" />
                    </nav>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-black">Logistics Hub</h1>
                    <button className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/10 hover:bg-orange-600 transition-all">
                        Assign Driver
                    </button>
                </header>

                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard title="Active Trips" value="12" icon={<Car />} color="orange" />
                        <StatCard title="Total Revenue" value="Rp 24.8M" icon={<DollarSign />} color="emerald" />
                        <StatCard title="Tour Guides" value="8" icon={<Users />} color="blue" />
                        <StatCard title="Satisfaction" value="4.7" icon={<TrendingUp />} color="purple" />
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <h2 className="text-xl font-black mb-6">Upcoming Assignments</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-orange-500 font-black">
                                        09:00
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Airport Transfer (VVIP)</p>
                                        <p className="text-xs text-gray-400">Guest: John Golfer • Alphard (B 1234 XY)</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                    Confirmed
                                </span>
                            </div>
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
                    ? 'bg-orange-50 text-orange-700 border border-orange-100'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-orange-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </Link>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm transition-all hover:border-orange-200">
            <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4 border`}>
                {icon}
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        </div>
    );
}
