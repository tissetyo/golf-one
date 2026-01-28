/**
 * Register Page
 * 
 * Allows new users to create an account with role selection.
 * Supports multiple vendor roles and regular users.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

// Role options for registration
const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: 'user', label: 'Golf Enthusiast', description: 'Book golf experiences and track scores' },
    { value: 'golf_vendor', label: 'Golf Course Vendor', description: 'Manage courses, tee times & caddies' },
    { value: 'hotel_vendor', label: 'Hotel Vendor', description: 'Manage hotel rooms & bookings' },
    { value: 'travel_vendor', label: 'Travel Vendor', description: 'Manage transport & tour packages' },
];

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'user' as UserRole,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Update form field value.
     */
    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    /**
     * Handle form submission for registration.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        const supabase = createClient();

        const { error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    role: formData.role,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Redirect based on role
        let redirectPath = '/chat';
        switch (formData.role) {
            case 'admin':
                redirectPath = '/admin';
                break;
            case 'golf_vendor':
                redirectPath = '/golf-vendor';
                break;
            case 'hotel_vendor':
                redirectPath = '/hotel-vendor';
                break;
            case 'travel_vendor':
                redirectPath = '/travel-vendor';
                break;
        }

        router.push(redirectPath);
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 py-12 px-4">
            <div className="w-full max-w-lg px-8 py-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Join Us</h1>
                    <p className="text-emerald-200/80">Create your Golf Tourism account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-emerald-100 mb-2">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => updateField('fullName', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-emerald-100 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-emerald-100 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-100 mb-2">
                                Confirm
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-emerald-100 mb-3">
                            I am a...
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {roleOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => updateField('role', option.value)}
                                    className={`p-4 rounded-lg border text-left transition-all ${formData.role === option.value
                                            ? 'bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-400'
                                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="font-semibold text-white text-sm">{option.label}</div>
                                    <div className="text-xs text-emerald-200/60 mt-1">{option.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-emerald-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center">
                    <p className="text-emerald-200/70">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-emerald-300 hover:text-emerald-200 font-semibold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
