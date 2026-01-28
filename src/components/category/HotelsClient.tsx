/**
 * Hotels Client Component
 * 
 * Handles the interactive catalog of hotels, including room selection.
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useState } from 'react';
import { useBooking } from '@/components/booking/BookingProvider';
import { Hotel, Search, MapPin, Star, MoreVertical, Bed, Check, Wifi, Coffee } from 'lucide-react';
import Link from 'next/link';

interface HotelsClientProps {
    initialHotels: any[];
}

export default function HotelsClient({ initialHotels }: HotelsClientProps) {
    const { addItem, trip, removeItem } = useBooking();
    const [selectedHotel, setSelectedHotel] = useState<any | null>(null);

    const handleSelectRoom = (hotel: any, roomType: string, price: number) => {
        addItem('hotel', {
            id: hotel.id,
            name: hotel.name,
            price: price,
            details: {
                room_type: roomType,
                check_in: new Date().toISOString().split('T')[0],
                check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Default to 1 night
            }
        });
        setSelectedHotel(null);
    };

    return (
        <div className="space-y-10">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm -mx-6 px-6 py-6 border-b-blue-100">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                <Hotel className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Hotels & Resorts</h1>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Selected: {trip.hotel?.name || 'None'}</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search luxury stays..."
                                className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all w-64 lg:w-[450px] shadow-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialHotels.map((hotel) => {
                    const isBooked = trip.hotel?.id === hotel.id;
                    return (
                        <div key={hotel.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-gray-100'}`}>
                            <div className="h-56 bg-gray-100 relative">
                                <div className="absolute top-6 right-6 z-10 px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg">
                                    {hotel.star_rating}-Star
                                </div>
                                {isBooked && (
                                    <div className="absolute top-6 left-6 z-10 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                        Selected
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{hotel.name}</h3>
                                    <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-black">{hotel.star_rating}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <MapPin className="w-4 h-4 text-blue-500" /> {hotel.location}
                                </p>

                                <div className="flex gap-3 mb-8">
                                    <div className="flex items-center gap-2 text-gray-400 border border-gray-100 px-3 py-1.5 rounded-xl bg-gray-50/50">
                                        <Wifi className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Free Wifi</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 border border-gray-100 px-3 py-1.5 rounded-xl bg-gray-50/50">
                                        <Coffee className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Breakfast</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-2">
                                    {hotel.description || "Experience unmatched luxury and comfort in our prime locations near top-tier golf courses."}
                                </p>

                                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">From</p>
                                        <p className="text-xl font-black text-blue-600">Rp 1.500.000 <span className="text-xs text-gray-400 font-medium">/nt</span></p>
                                    </div>

                                    {isBooked ? (
                                        <button
                                            onClick={() => removeItem('hotel')}
                                            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedHotel(hotel)}
                                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                        >
                                            See Rooms
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Room Picker Modal */}
            {selectedHotel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedHotel(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Select Room Type</h2>
                                <p className="text-gray-400 font-bold text-sm">{selectedHotel.name}</p>
                            </div>
                            <button onClick={() => setSelectedHotel(null)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center text-2xl font-light">×</button>
                        </div>

                        <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                            {[
                                { type: 'Deluxe Room', price: 1500000, desc: 'King bed, city view, 40sqm.' },
                                { type: 'Premier Golf View', price: 2200000, desc: 'Overlooks the fairway, private balcony.' },
                                { type: 'Executive Suite', price: 4500000, desc: 'Living area, marble bath, 80sqm.' }
                            ].map((room) => (
                                <button
                                    key={room.type}
                                    onClick={() => handleSelectRoom(selectedHotel, room.type, room.price)}
                                    className="w-full p-6 text-left rounded-3xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-lg font-black text-gray-900 group-hover:text-blue-700">{room.type}</p>
                                        <p className="text-lg font-black text-blue-600">Rp {room.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">{room.desc}</p>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Select This Room <Check className="w-3 h-3 stroke-[3px]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
