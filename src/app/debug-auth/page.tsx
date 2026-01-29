/**
 * Debug Auth Page
 * 
 * A raw diagnostic page to check server-side session state.
 * NO REDIRECTS allowed here.
 */

import { createClient } from '@/lib/supabase/server';
import { headers, cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DebugAuthPage() {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const headerList = await headers();

    // 1. Check User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 2. Check Profile (if user exists)
    let profile = null;
    let profileError = null;
    if (user) {
        const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = result.data;
        profileError = result.error;
    }

    // 3. Cookie Inspection (Safe logging)
    const allCookies = cookieStore.getAll().map(c => ({ name: c.name, size: c.value.length }));

    return (
        <div className="min-h-screen p-10 bg-gray-50 text-gray-900 font-mono text-sm overflow-auto">
            <h1 className="text-2xl font-bold mb-6 text-red-600">Auth Diagnostic Report</h1>

            <div className="grid gap-6">
                {/* Session Status */}
                <Section title="1. Supabase Session (Server-Side)">
                    {user ? (
                        <div className="text-emerald-600 font-bold">
                            ✅ AUTHENTICATED<br />
                            ID: {user.id}<br />
                            Email: {user.email}<br />
                            Role (Auth): {user.role}
                        </div>
                    ) : (
                        <div className="text-red-600 font-bold">
                            ❌ NOT AUTHENTICATED<br />
                            Error: {authError?.message || 'No session found'}
                        </div>
                    )}
                </Section>

                {/* Profile Status */}
                <Section title="2. Database Profile">
                    {profile ? (
                        <div className="text-blue-600">
                            ✅ PROFILE FOUND<br />
                            Role: {profile.role}<br />
                            Name: {profile.full_name}
                        </div>
                    ) : (
                        <div className="text-amber-600">
                            ⚠️ PROFILE MISSING/ERROR<br />
                            {user ? `Error: ${profileError?.message || 'Not found'}` : 'N/A (Not logged in)'}
                        </div>
                    )}
                </Section>

                {/* Cookie Status */}
                <Section title="3. Request Cookies">
                    <pre className="bg-gray-100 p-2 rounded">
                        {JSON.stringify(allCookies, null, 2)}
                    </pre>
                </Section>

                {/* Debug Actions */}
                <Section title="4. Actions">
                    <div className="flex gap-4">
                        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Go to Login
                        </a>
                        <form action="/auth/logout" method="post">
                            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Force Logout
                            </button>
                        </form>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-3 border-b pb-2">{title}</h2>
            {children}
        </div>
    );
}
