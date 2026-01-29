'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectPath = (formData.get('redirect') as string) || '/user';

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Auth successful - cookie set.
    // Check role for generic login only.
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;
        let finalPath = redirectPath;

        // If generic login, try to route intelligently
        if (redirectPath === '/user' || redirectPath === '/chat') {
            if (role === 'admin') finalPath = '/admin';
            else if (role === 'golf_vendor') finalPath = '/golf-vendor';
            else if (role === 'hotel_vendor') finalPath = '/hotel-vendor';
            else if (role === 'travel_vendor') finalPath = '/travel-vendor';
        }

        revalidatePath('/', 'layout');
        redirect(finalPath);
    }

    redirect('/user');
}

/**
 * Dedicated Admin Login Action
 * 
 * Strictly enforces admin role check.
 * Redirects ONLY to /admin.
 */
export async function adminLogin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Verify Admin Status immediately
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Session creation failed.' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        // Sign them out immediately if they try to use the admin door
        await supabase.auth.signOut();
        return { error: 'Access Denied: You do not have administrative privileges.' };
    }

    revalidatePath('/admin', 'layout');
    redirect('/admin');
}
