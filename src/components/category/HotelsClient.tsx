/**
 * Hotels Client Component
 * 
 * Handles the interactive catalog of hotels, including room selection.
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useState } from 'react';
import { useBooking } from '@/components/booking/BookingProvider';
import { Hotel, MapPin, Star, MoreVertical, Bed, Check, Wifi, Coffee } from 'lucide-react';
import Link from 'next/link';
import CategoryHeader from './CategoryHeader';

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
        <div className="space-y-6 lg:space-y-10">
            <CategoryHeader
                title="Hotels & Resorts"
                subtitle={`Selected: ${trip.hotel?.name || 'None'}`}
                icon={<Hotel className="w-5 h-5 lg:w-7 lg:h-7 text-blue-600" />}
                colorClass="bg-blue-50"
            />

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                {initialHotels.length > 0 ? (
                    initialHotels.map((hotel: any) => {
                        const isBooked = trip.hotel?.id === hotel.id;
                        return (
                            <div key={hotel.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-gray-100'}`}>
                                <div className="h-40 lg:h-56 bg-gray-100 relative overflow-hidden">
                                    {hotel.images?.[0] ? (
                                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 bg-blue-600 opacity-10"></div>
                                    )}
                                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-600 rounded-xl text-[9px] lg:text-[10px] font-black uppercase text-white shadow-lg">
                                        {hotel.star_rating}-Star
                                    </div>
                                    {isBooked && (
                                        <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 bg-blue-600 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                            <Check className="w-3 h-3 lg:w-4 lg:h-4 stroke-[3px]" />
                                            Selected
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 lg:p-8 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{hotel.name}</h3>
                                        <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg">
                                            <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />
                                            <span className="text-xs lg:text-sm font-black">{hotel.star_rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-4 lg:mb-6">
                                        <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" /> {hotel.location}
                                    </p>

                                    <div className="flex gap-2 lg:gap-3 mb-6 lg:mb-8">
                                        <div className="flex items-center gap-1.5 lg:gap-2 text-gray-400 border border-gray-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-xl bg-gray-50/50">
                                            <Wifi className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider">Free Wifi</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 lg:gap-2 text-gray-400 border border-gray-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-xl bg-gray-50/50">
                                            <Coffee className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider">Breakfast</span>
                                        </div>
                                    </div>

                                    <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed mb-6 lg:mb-8 flex-1 line-clamp-2">
                                        {hotel.description || "Experience unmatched luxury and comfort in our prime locations near top-tier golf courses."}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 lg:pt-8 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] lg:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">From</p>
                                            <p className="text-lg lg:text-xl font-black text-blue-600">Rp 1.500.000 <span className="text-[10px] lg:text-xs text-gray-400 font-medium">/nt</span></p>
                                        </div>

                                        {isBooked ? (
                                            <button
                                                onClick={() => removeItem('hotel')}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-gray-100 text-gray-600 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedHotel(hotel)}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-blue-600 text-white rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                            >
                                                See Rooms
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Hotel className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No Hotels Found</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">We couldn't find any luxury resorts available right now. Please try again later!</p>
                    </div>
                )}
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
                            ].map((room: any) => (
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
