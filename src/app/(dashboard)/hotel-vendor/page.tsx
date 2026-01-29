/**
 * Hotel Vendor Dashboard (Interactive Light Mode)
 * 
 * Manage occupancy and guest bookings with feedback.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Bed, Calendar, CheckCircle, Activity, Users, TrendingUp, DollarSign, Bell, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HotelVendorDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (p?.role !== 'hotel_vendor') {
                router.push('/user');
                return;
            }
            setProfile(p);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleAction = (action: string) => {
        alert(`${action} feature coming soon! We are currently in preview mode.`);
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Loading Hotel Hub...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/10">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">Hotel Hub</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink icon={<Activity />} label="Overview" active />
                        <NavLink icon={<Bed />} label="Rooms" onClick={() => handleAction('Room Inventory Management')} />
                        <NavLink icon={<Calendar />} label="Calendar" onClick={() => handleAction('Availability Calendar')} />
                        <NavLink icon={<CheckCircle />} label="Approved" onClick={() => handleAction('Booking History')} />
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Authenticated as</p>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-700 truncate">{profile?.full_name}</p>
                        <Link href="/auth/logout" className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-black">Room Management</h1>
                    <div className="flex gap-3">
                        <button onClick={() => handleAction('Sync Channels')} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100 transition-all hover:bg-blue-100">
                            Sync Channels
                        </button>
                        <button onClick={() => handleAction('Manual Booking')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all hover:bg-blue-700">
                            Manual Booking
                        </button>
                    </div>
                </header>

                <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatCard title="Confirmed Guests" value="18" icon={<Users />} color="blue" />
                        <StatCard title="Revenue (MTD)" value="Rp 82.5M" icon={<DollarSign />} color="emerald" />
                        <StatCard title="Total Capacity" value="45" icon={<Home />} color="amber" />
                        <StatCard title="Avg Occupancy" value="78%" icon={<TrendingUp />} color="purple" />
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <h2 className="text-xl font-black mb-6">Upcoming Check-ins</h2>
                        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 group hover:border-blue-200 transition-all cursor-pointer" onClick={() => handleAction('View Calendar')}>
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-blue-400 transition-colors" />
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-blue-600 transition-colors">No arrivals today</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavLink({ icon, label, active = false, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-blue-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </button>
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
