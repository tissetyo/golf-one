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

    // Auth successful - cookies are set by the supabase client automatically
    // due to our cookie store configuration in createClient()

    // Find user role for smart redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;
        let finalPath = redirectPath;

        if (redirectPath === '/user' || redirectPath === '/chat') { // Generic entry
            if (role === 'admin') finalPath = '/admin';
            else if (role === 'golf_vendor') finalPath = '/golf-vendor';
            else if (role === 'hotel_vendor') finalPath = '/hotel-vendor';
            else if (role === 'travel_vendor') finalPath = '/travel-vendor';
        }

        revalidatePath('/', 'layout'); // clear cache
        redirect(finalPath);
    }

    revalidatePath('/', 'layout');
    redirect('/user');
}
