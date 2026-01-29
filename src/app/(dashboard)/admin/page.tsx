/**
 * Admin Dashboard (Interactive Light Mode)
 * 
 * Central hub for system administrators.
 * Features overview analytics, user management, and settlement tracking with feedback.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, ShieldCheck, ArrowRight, AlertCircle, BarChart3, Settings, Bell, Search, Filter, LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
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

            const { data: p, error: pError } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            if (pError) {
                console.error('Error fetching admin profile:', pError.message);
                // Don't bounce immediately on transient error, but if we have profile and it's not admin, then bounce
                if (pError.code === 'PGRST116') { // Not found
                    router.push('/user');
                    return;
                }
            }

            if (p && p.role !== 'admin') {
                router.push('/user');
                return;
            }
            setProfile(p);
            setLoading(false);
        }
        loadData();
    }, []);

    const handleAction = (action: string) => {
        alert(`${action} feature coming soon! Currently in administrative preview.`);
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black uppercase tracking-widest text-gray-400 animate-pulse">Entering System Core...</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900">Admin Hub</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink icon={<LayoutDashboard />} label="Overview" active />
                        <NavLink icon={<Users />} label="Users" onClick={() => handleAction('User Management')} />
                        <NavLink icon={<CreditCard />} label="Settlements" onClick={() => handleAction('Finance Management')} />
                        <NavLink icon={<Settings />} label="Settings" onClick={() => handleAction('System Settings')} />
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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="px-10 py-8 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <h1 className="text-2xl font-black">System Architecture</h1>
                    <div className="flex items-center gap-6">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleAction('Search System')} className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-100 transition-all">
                                <Search className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleAction('Platform Alerts')} className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl border border-gray-100 transition-all">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-10 space-y-10">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AdminStatCard title="Total Revenue" value="Rp 127.4M" color="emerald" />
                        <AdminStatCard title="Global Users" value="1,240" color="blue" />
                        <AdminStatCard title="Live Bookings" value="48" color="amber" />
                        <AdminStatCard title="Platform Margin" value="Rp 6.37M" color="purple" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Settlement Queue */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black flex items-center gap-3 text-gray-900">
                                    <CreditCard className="w-6 h-6 text-indigo-600" />
                                    Forwarding Queue
                                </h2>
                                <button onClick={() => handleAction('Filter Settlements')} className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-inner font-black text-indigo-600">
                                            V-01
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">Bali Golf Resort</p>
                                            <p className="text-xs text-gray-400 font-medium">Ref: XND-502-AX9</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900">Rp 2.450.000</p>
                                        <button
                                            onClick={() => handleAction('Confirm Settlement Forward')}
                                            className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg mt-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Confirm Forward
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent System Activity */}
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col">
                            <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-gray-900">
                                <BarChart3 className="w-6 h-6 text-purple-600" />
                                Live Feed
                            </h2>
                            <div className="space-y-8 flex-1">
                                <FeedItem time="12:45 PM" user="Zoe" action="New Golf Booking" code="G-001" />
                                <FeedItem time="11:30 AM" user="Iwan" action="Hotel Verified" code="H-204" />
                                <FeedItem time="10:15 AM" user="Platform" action="System Sync Complete" />
                            </div>
                            <button onClick={() => handleAction('Download Audit Log')} className="w-full mt-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center gap-2">
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

function NavLink({ icon, label, active = false, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${active
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            <span className={active ? 'text-indigo-600' : 'text-gray-400'}>{icon}</span>
            {label}
        </button>
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
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 group-hover:text-indigo-400 transition-colors">{title}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
            <div className={`h-1.5 w-12 rounded-full mt-4 ${colors[color]} border-0 opacity-40 group-hover:opacity-100 transition-all`}></div>
        </div>
    );
}

function FeedItem({ time, user, action, code }: any) {
    return (
        <div className="relative pl-6 border-l-2 border-gray-100 pb-1">
            <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-200"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-tight">{time}</p>
            <p className="text-sm font-bold text-gray-800">{action}</p>
            <p className="text-xs text-gray-400 font-medium">By {user} {code && <span className="text-indigo-400 ml-1">[{code}]</span>}</p>
        </div>
    );
}
