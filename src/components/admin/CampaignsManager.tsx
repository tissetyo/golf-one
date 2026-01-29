'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Image as ImageIcon, Save, Plus, Trash2, Loader2, Upload, X } from 'lucide-react';
import { saveCampaignTheme, addPromotionalBanner, deletePromotionalBanner } from '@/app/(dashboard)/admin/actions';

export default function CampaignsManager() {
    const [settings, setSettings] = useState<any>({ background_url: '', use_image: false });
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Add Banner State
    const [isAddingBanner, setIsAddingBanner] = useState(false);
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
    const [newBannerPreview, setNewBannerPreview] = useState<string>('');
    const [uploadingBanner, setUploadingBanner] = useState(false);

    // Background Image State
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [backgroundPreview, setBackgroundPreview] = useState<string>('');

    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

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

    const uploadFile = async (file: File) => {
        // Create FormData to send file to server action
        const formData = new FormData();
        formData.append('file', file);

        // Use Server Action for consistent Admin access (bypassing Client RLS)
        const { uploadCampaignImage } = await import('@/app/(dashboard)/admin/actions');
        const result = await uploadCampaignImage(formData);

        if (result.error) throw new Error(result.error);
        return result.url;
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            let finalBackgroundUrl = settings.background_url;

            if (backgroundFile) {
                finalBackgroundUrl = await uploadFile(backgroundFile);
            }

            const newSettings = { ...settings, background_url: finalBackgroundUrl };

            const result = await saveCampaignTheme(newSettings);
            if (result.error) throw new Error(result.error);

            setSettings(newSettings);
            setBackgroundFile(null); // Clear pending upload
            alert('Theme updated successfully!');
        } catch (error: any) {
            console.error(error);
            alert('Failed to save theme: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddBanner = async () => {
        if (!newBannerTitle || (!newBannerFile && !newBannerPreview)) return;

        setUploadingBanner(true);
        try {
            let imageUrl = newBannerPreview; // Support direct URL if we add that field later, currently assumes file

            if (newBannerFile) {
                imageUrl = await uploadFile(newBannerFile);
            }

            const result = await addPromotionalBanner(newBannerTitle, imageUrl);
            if (result.error) throw new Error(result.error);

            // Reset form
            setNewBannerTitle('');
            setNewBannerFile(null);
            setNewBannerPreview('');
            setIsAddingBanner(false);

            // Reload data
            loadCampaignData();
        } catch (error: any) {
            console.error(error);
            alert('Failed to add banner: ' + error.message);
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        const result = await deletePromotionalBanner(id);
        if (result && result.error) {
            alert('Error deleting banner: ' + result.error);
        } else {
            loadCampaignData();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const previewUrl = URL.createObjectURL(file);

        if (isBanner) {
            setNewBannerFile(file);
            setNewBannerPreview(previewUrl);
        } else {
            setBackgroundFile(file);
            setBackgroundPreview(previewUrl);
        }
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

                    {/* Background Image Preview & Upload */}
                    <div className="space-y-4">
                        <label className="block text-xs font-black uppercase text-gray-400">Background Image</label>

                        {(backgroundPreview || settings.background_url) && (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                                <img
                                    src={backgroundPreview || settings.background_url}
                                    className="w-full h-full object-cover"
                                    alt="Background Preview"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-100"
                                    >
                                        <Upload className="w-4 h-4" /> Change Image
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {!backgroundPreview && !settings.background_url && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm flex items-center gap-2 hover:bg-gray-100"
                                >
                                    <Upload className="w-4 h-4" /> Upload Image
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e, false)}
                            />
                        </div>
                    </div>

                    {/* Enable Checkbox */}
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
                        onClick={handleSaveSettings}
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
                    {!isAddingBanner && (
                        <button onClick={() => setIsAddingBanner(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-800">
                            <Plus className="w-4 h-4" /> Add Banner
                        </button>
                    )}
                </div>

                {/* Add Banner Form */}
                {isAddingBanner && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900">New Banner Details</h3>
                            <button onClick={() => setIsAddingBanner(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Banner Title</label>
                                <input
                                    type="text"
                                    value={newBannerTitle}
                                    onChange={(e) => setNewBannerTitle(e.target.value)}
                                    className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-500 text-sm font-medium"
                                    placeholder="e.g., Summer Sale"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Banner Image</label>
                                {newBannerPreview ? (
                                    <div className="relative aspect-video w-48 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={newBannerPreview} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => { setNewBannerFile(null); setNewBannerPreview(''); }}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-pink-500 hover:text-pink-500 transition-colors bg-white"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span className="text-xs font-bold">Click to upload banner</span>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, true)}
                                />
                            </div>

                            <button
                                onClick={handleAddBanner}
                                disabled={uploadingBanner || !newBannerTitle || !newBannerPreview}
                                className="mt-2 w-full py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploadingBanner ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                Add Banner
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="relative group rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button onClick={() => handleDeleteBanner(banner.id)} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white font-bold">{banner.title}</p>
                            </div>
                        </div>
                    ))}
                    {banners.length === 0 && !isAddingBanner && (
                        <div className="col-span-2 p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium">
                            No banners active. Add one to display on the user dashboard.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
