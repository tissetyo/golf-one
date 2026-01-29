'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadCampaignImage(formData: FormData) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Admin only' };
    }

    const file = formData.get('file') as File;
    if (!file) return { error: 'No file uploaded' };

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;

    // Upload using Admin Client
    const { error } = await adminClient.storage
        .from('campaigns')
        .upload(fileName, file, {
            contentType: file.type,
            upsert: true
        });

    if (error) return { error: error.message };

    const { data: { publicUrl } } = adminClient.storage
        .from('campaigns')
        .getPublicUrl(fileName);

    return { url: publicUrl };
}

export async function saveCampaignTheme(theme: any) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // Verify Admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[saveCampaignTheme] User Check:', user?.id, 'Error:', authError);

    if (!user) {
        console.error('[saveCampaignTheme] Unauthorized - No User. Cookie issue?');
        return { error: 'Unauthorized: No active session' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    console.log('[saveCampaignTheme] Profile Check:', profile);

    if (profile?.role !== 'admin') {
        console.error('[saveCampaignTheme] Unauthorized - Role mismatch:', profile?.role);
        return { error: 'Unauthorized: Admin only' };
    }

    // Use Service Role to bypass RLS
    const { error } = await adminClient
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
    const adminClient = await createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Admin only' };
    }

    const { error } = await adminClient.from('promotional_banners').insert({
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
    const adminClient = await createAdminClient();

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Unauthorized: Admin only' };
    }

    const { error } = await adminClient.from('promotional_banners').delete().eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/user', 'layout');
    return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();

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

    const { error } = await adminClient
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) return { error: error.message };

    revalidatePath('/admin', 'layout');
    return { success: true };
}
