'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, Save, Plus, Trash2, Loader2 } from 'lucide-react';

export default function CampaignsManager() {
    const [settings, setSettings] = useState<any>({ background_url: '', use_image: false });
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadCampaignData();
    }, []);

    const loadCampaignData = async () => {
        setLoading(true);
        // Load Settings
        const { data: settingData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'user_dashboard_theme')
            .single();

        if (settingData) setSettings(settingData.value);

        // Load Banners
        const { data: bannerData } = await supabase
            .from('promotional_banners')
            .select('*')
            .order('sort_order', { ascending: true });

        if (bannerData) setBanners(bannerData);
        setLoading(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        await supabase
            .from('system_settings')
            .upsert({
                key: 'user_dashboard_theme',
                value: settings,
                description: 'User Dashboard Theme Config'
            });
        setSaving(false);
        alert('Theme updated!');
    };

    const addBanner = async () => {
        const title = prompt('Banner Title:');
        const url = prompt('Image URL:');
        if (!title || !url) return;

        await supabase.from('promotional_banners').insert({
            title,
            image_url: url,
            sort_order: banners.length + 1
        });
        loadCampaignData();
    };

    const deleteBanner = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await supabase.from('promotional_banners').delete().eq('id', id);
        loadCampaignData();
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading Campaign Data...</div>;

    return (
        <div className="space-y-10">
            {/* Dashboard Theme Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                    Dashboard Theme
                </h2>
                <div className="grid gap-6 max-w-2xl">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-400 mb-2">Background Image URL</label>
                        <input
                            type="text"
                            value={settings.background_url}
                            onChange={(e) => setSettings({ ...settings, background_url: e.target.value })}
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 font-medium"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="use_image"
                            checked={settings.use_image}
                            onChange={(e) => setSettings({ ...settings, use_image: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="use_image" className="font-bold text-gray-700">Enable Custom Background</label>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 w-fit disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Banners Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Save className="w-6 h-6 text-pink-600" />
                        Promotional Banners
                    </h2>
                    <button onClick={addBanner} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-800">
                        <Plus className="w-4 h-4" /> Add Banner
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="relative group rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => deleteBanner(banner.id)} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white font-bold">{banner.title}</p>
                            </div>
                        </div>
                    ))}
                    {banners.length === 0 && (
                        <div className="col-span-2 p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium">
                            No banners active. Add one to display on the user dashboard.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
