/**
 * Admin Dashboard (Light Mode)
 * 
 * Central hub for system administrators in a clean light theme.
 * Features overview analytics, user management, and manual split-settlement tracking.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, ShieldCheck, ArrowRight, AlertCircle, BarChart3, Settings } from 'lucide-react';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/chat');
    }

    // Get system stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { data: revenueData } = await supabase.from('payments').select('amount').eq('status', 'paid');
    const totalRevenue = revenueData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get pending settlements
    const { data: pendingSettlements } = await supabase
        .from('split_settlements')
        .select('*, profiles(full_name, role), payments(xendit_external_id)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // Get recent bookings
    const { data: recentBookings } = await supabase
        .from('bookings')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar - Light */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight">Admin Hub</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink href="/admin" active icon={<LayoutDashboard />} label="Overview" />
                        <NavLink href="/admin/users" icon={<Users />} label="Users" />
                        <NavLink href="/admin/settlements" icon={<CreditCard />} label="Settlements" />
                        <NavLink href="/admin/settings" icon={<Settings />} label="Settings" />
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Authenticated as</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{profile?.full_name || user.email}</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <h1 className="text-2xl font-black">System Architecture</h1>
                    <div className="text-sm font-bold text-gray-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminStatCard title="Total Revenue" value={`Rp ${totalRevenue.toLocaleString()}`} color="emerald" />
                        <AdminStatCard title="Global Users" value={userCount || 0} color="blue" />
                        <AdminStatCard title="Live Bookings" value={bookingCount || 0} color="amber" />
                        <AdminStatCard title="Platform Margin" value={`Rp ${(totalRevenue * 0.05).toLocaleString()}`} color="purple" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Settlement Queue */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                    Forwarding Queue
                                </h2>
                                <Link href="/admin/settlements" className="text-xs font-black uppercase tracking-tight text-indigo-600 hover:underline">Full Logs</Link>
                            </div>

                            {pendingSettlements && pendingSettlements.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingSettlements.map((settlement) => (
                                        <div key={settlement.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                                                    {(settlement.profiles as any)?.role === 'golf_vendor' ? '⛳' : (settlement.profiles as any)?.role === 'hotel_vendor' ? '🏨' : '🚗'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{(settlement.profiles as any)?.full_name || 'Vendor'}</p>
                                                    <p className="text-xs text-gray-400 font-medium">Ref: {(settlement.payments as any)?.xendit_external_id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">Rp {Number(settlement.amount).toLocaleString()}</p>
                                                <button className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg mt-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                    Confirm Forward
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">All settlements cleared</p>
                                </div>
                            )}
                        </div>

                        {/* Recent System Activity */}
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                                Live Feed
                            </h2>
                            <div className="space-y-8">
                                {recentBookings?.map((booking) => (
                                    <div key={booking.id} className="relative pl-6 border-l-2 border-gray-100 pb-1">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{new Date(booking.created_at).toLocaleTimeString()}</p>
                                        <p className="text-sm font-bold text-gray-800">New {booking.booking_type}</p>
                                        <p className="text-xs text-gray-400 font-medium">By {(booking.profiles as any)?.full_name}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center justify-center gap-2">
                                Download Audit Trail
                                <ArrowRight className="w-4 h-4" />
                            </button>
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
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-indigo-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </Link>
    );
}

function AdminStatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
    const colors: any = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">{title}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
            <div className={`h-1.5 w-12 rounded-full mt-4 ${colors[color]} border-0 opacity-40`}></div>
        </div>
    );
}
