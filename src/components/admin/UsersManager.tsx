'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Shield, Mail, MoreVertical } from 'lucide-react';

export default function UsersManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        // Note: 'profiles' table should be readable by admin due to RLS
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        setLoading(false);
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        if (!confirm(`Change user role to ${newRole}?`)) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) loadUsers();
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading Users...</div>;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">Manage {users.length} registered accounts</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-8 py-4">User</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Joined</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.full_name || 'Anonymous'}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            user.role.includes('vendor') ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-4 text-sm text-gray-500 font-medium">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded-lg p-2 bg-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="golf_vendor">Golf Vendor</option>
                                        <option value="hotel_vendor">Hotel Vendor</option>
                                        <option value="travel_vendor">Travel Vendor</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
