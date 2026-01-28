/**
 * Golf Vendor Dashboard (Interactive Light Mode)
 * 
 * Main dashboard for golf course owners.
 * Features toast notifications for button actions.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Calendar, Users, Clock, CheckCircle, TrendingUp, DollarSign, Bell, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function GolfVendorDashboard() {
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
            if (p?.role !== 'golf_vendor') {
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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Loading Vendor Hub...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/10">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900">Golf Vendor</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink icon={<Trophy />} label="Dashboard" active />
                        <NavLink icon={<Clock />} label="Tee Times" onClick={() => handleAction('Tee Time Management')} />
                        <NavLink icon={<Users />} label="Caddies" onClick={() => handleAction('Caddie Scheduling')} />
                        <NavLink icon={<Calendar />} label="Bookings" onClick={() => handleAction('Booking Archive')} />
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Managed By</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{profile.full_name}</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10">
                    <h1 className="text-2xl font-black">Performance Overview</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleAction('Notifications')} className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-xl border border-gray-100 transition-all">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleAction('Download Report')}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/10 hover:bg-emerald-700 transition-all"
                        >
                            Download Report
                        </button>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Bookings" value="24" icon={<Calendar />} color="emerald" />
                        <StatCard title="Total Revenue" value="Rp 45.2M" icon={<DollarSign />} color="blue" />
                        <StatCard title="Active Caddies" value="12" icon={<Users />} color="amber" />
                        <StatCard title="Avg Rating" value="4.9" icon={<TrendingUp />} color="purple" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Recent Bookings Queue */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                Approval Queue
                            </h2>

                            <div className="space-y-4">
                                <p className="text-gray-400 font-medium italic text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No pending approvals today.</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                                <h3 className="text-lg font-black mb-2 text-white relative">Manual Add</h3>
                                <p className="text-emerald-100 text-xs mb-6 font-medium leading-relaxed relative">
                                    Instantly block tee times or add manual phone bookings here.
                                </p>
                                <button
                                    onClick={() => handleAction('Create Manual Slot')}
                                    className="w-full py-4 bg-emerald-700/50 hover:bg-emerald-700/80 rounded-2xl text-xs font-black uppercase tracking-tight transition-all border border-emerald-500/30 relative"
                                >
                                    Create Slot
                                </button>
                            </div>
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
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-emerald-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </button>
    );
}

function StatCard({ title, value, icon, color }: any) {
    const colors: any = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:border-emerald-200 transition-all">
            <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center mb-4 border`}>
                {icon}
            </div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        </div>
    );
}
