/**
 * Admin Login Portal
 * 
 * Specialized entry point for system administrators.
 * Uses strict role validation directly from the login action.
 */

'use client';

import { useState } from 'react';
import { adminLogin } from '../../(auth)/actions';
import { useTransition } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await adminLogin(formData);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 border-b-4 border-indigo-600">
            <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Restricted Area</h1>
                    <p className="text-gray-500 text-sm">System Administration Access Only</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Administrator Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-gray-900 transition-all"
                            placeholder="admin@golf.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Secure Key</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-gray-900 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isPending ? 'Verifying Credentials...' : 'Access Console'}
                    </button>
                </form>
            </div>
        </div>
    );
}
