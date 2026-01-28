/**
 * Trip Summary Component
 * 
 * Sticky bar that shows the current manual selection progress.
 * Appears when at least one item is in the cart.
 */

'use client';

import { useBooking } from '@/components/booking/BookingProvider';
import { ChevronRight, Flag, Hotel, Map, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';

export default function TripSummary() {
    const { trip, totalPrice, removeItem, clearTrip } = useBooking();

    const hasItems = trip.golf || trip.hotel || trip.travel;

    if (!hasItems) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6 animate-in slide-in-from-bottom-12 fade-in duration-500">
            <div className="bg-gray-900 border border-gray-800 rounded-[32px] shadow-2xl p-4 flex items-center gap-6 backdrop-blur-xl">
                {/* Cart Info */}
                <div className="flex items-center gap-4 pl-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Your Manual Trip</p>
                        <p className="text-xl font-black text-white">Rp {totalPrice.toLocaleString()}</p>
                    </div>
                </div>

                {/* Selected Category Indicators */}
                <div className="flex-1 flex items-center gap-3">
                    <CategoryBadge active={!!trip.golf} icon={<Flag />} onRemove={() => removeItem('golf')} />
                    <CategoryBadge active={!!trip.hotel} icon={<Hotel />} onRemove={() => removeItem('hotel')} />
                    <CategoryBadge active={!!trip.travel} icon={<Map />} onRemove={() => removeItem('travel')} />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pr-2">
                    <button
                        onClick={clearTrip}
                        className="px-6 py-4 bg-gray-800 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-900/40 hover:text-red-400 transition-all"
                    >
                        Clear
                    </button>
                    <Link
                        href="/user/checkout"
                        className="px-8 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                    >
                        Book Trip
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function CategoryBadge({ active, icon, onRemove }: { active: boolean, icon: any, onRemove: () => void }) {
    return (
        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-600 border border-transparent opacity-20'}`}>
            {icon}
            {active && (
                <button
                    onClick={onRemove}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-[10px] shadow-lg border-2 border-gray-900 hover:scale-110 transition-transform"
                >
                    <X className="w-3 h-3 stroke-[4px]" />
                </button>
            )}
        </div>
    );
}
