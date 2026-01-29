'use client';

import { Calendar, MapPin, Filter, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
    id: string;
    label: string;
}

interface QuickFiltersProps {
    onFilterChange?: (filters: any) => void;
    category: 'golf' | 'hotel' | 'travel';
}

const locations = [
    { id: 'all', label: 'All Indonesia' },
    { id: 'bali', label: 'Bali' },
    { id: 'jakarta', label: 'Jakarta' },
    { id: 'bandung', label: 'Bandung' },
    { id: 'bogor', label: 'Bogor' },
];

const sorts = [
    { id: 'rating', label: 'Top Rated' },
    { id: 'price_low', label: 'Lowest Price' },
    { id: 'price_high', label: 'Highest Price' },
    { id: 'proximity', label: 'Nearest' },
];

export default function QuickFilters({ onFilterChange, category }: QuickFiltersProps) {
    const [selectedLocation, setSelectedLocation] = useState(locations[0]);
    const [selectedSort, setSelectedSort] = useState(sorts[0]);
    const [activeTab, setActiveTab] = useState<'location' | 'date' | 'sort' | null>(null);

    return (
        <div className="bg-white border-b border-gray-100 -mx-6 px-6 py-4 sticky top-[72px] lg:top-[88px] z-30">
            <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* Location Selector */}
                <button
                    onClick={() => setActiveTab(activeTab === 'location' ? null : 'location')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${activeTab === 'location' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-tight">{selectedLocation.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeTab === 'location' ? 'rotate-180' : ''}`} />
                </button>

                {/* Date Selector (Simulation) */}
                <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 whitespace-nowrap"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-tight">Today, 29 Jan</span>
                    <ChevronDown className="w-3 h-3" />
                </button>

                {/* Sort Selector */}
                <button
                    onClick={() => setActiveTab(activeTab === 'sort' ? null : 'sort')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${activeTab === 'sort' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-black uppercase tracking-tight">{selectedSort.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeTab === 'sort' ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown Sheets */}
            {activeTab === 'location' && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl p-6 animate-in slide-in-from-top duration-200">
                    <div className="grid grid-cols-2 gap-3 max-w-7xl mx-auto">
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => { setSelectedLocation(loc); setActiveTab(null); }}
                                className={`p-4 rounded-2xl border flex items-center justify-between ${selectedLocation.id === loc.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600'}`}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">{loc.label}</span>
                                {selectedLocation.id === loc.id && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'sort' && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl p-6 animate-in slide-in-from-top duration-200">
                    <div className="grid grid-cols-2 gap-3 max-w-7xl mx-auto">
                        {sorts.map(sort => (
                            <button
                                key={sort.id}
                                onClick={() => { setSelectedSort(sort); setActiveTab(null); }}
                                className={`p-4 rounded-2xl border flex items-center justify-between ${selectedSort.id === sort.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 text-gray-600'}`}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">{sort.label}</span>
                                {selectedSort.id === sort.id && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
