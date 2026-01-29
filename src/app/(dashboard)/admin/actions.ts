'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveCampaignTheme(theme: any) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('system_settings')
        .upsert({
            key: 'user_dashboard_theme',
            value: theme,
            description: 'User Dashboard Theme Config',
            updated_by: user.id
        });

    if (error) return { error: error.message };

    // Force refresh User Dashboard
    revalidatePath('/user', 'layout');
    return { success: true };
}

export async function addPromotionalBanner(title: string, imageUrl: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('promotional_banners').insert({
        title,
        image_url: imageUrl,
        sort_order: 99, // default to end
        created_by: user.id
    });

    if (error) return { error: error.message };

    revalidatePath('/user', 'layout');
    return { success: true };
}

export async function deletePromotionalBanner(id: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('promotional_banners').delete().eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/user', 'layout');
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Double check requester is admin
    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (requesterProfile?.role !== 'admin') {
        return { error: 'Unauthorized: Admin only' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) return { error: error.message };

    revalidatePath('/admin', 'layout');
    return { success: true };
}
