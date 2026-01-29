import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Critical Auth Guard (Server-Side)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Profile for Sub-Layout logic if needed
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
            {/* Main scrollable area */}
            <div className="flex-1 pb-20 lg:pb-0 overflow-y-auto">
                {children}
            </div>

            {/* Only show BottomNav for regular users */}
            {profile?.role === 'user' && <BottomNav />}
        </div>
    );
}
