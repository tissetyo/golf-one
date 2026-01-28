/**
 * Travel Client Component
 * 
 * Handles the interactive catalog of travel packages (transfers/tours).
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useBooking } from '@/components/booking/BookingProvider';
import { Map, Search, MapPin, Clock, Check, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface TravelClientProps {
    initialPackages: any[];
}

export default function TravelClient({ initialPackages }: TravelClientProps) {
    const { addItem, trip, removeItem } = useBooking();

    const handleSelectItem = (pkg: any) => {
        addItem('travel', {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            details: {
                package_type: pkg.package_type,
                duration: pkg.duration_hours
            }
        });
    };

    return (
        <div className="space-y-10">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm -mx-6 px-6 py-6 border-b-orange-100">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm">
                                <Map className="w-7 h-7 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Travel Packages</h1>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Selected: {trip.travel?.name || 'None'}</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search transfers & tours..."
                                className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all w-64 lg:w-[450px] shadow-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialPackages.map((pkg) => {
                    const isBooked = trip.travel?.id === pkg.id;
                    return (
                        <div key={pkg.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-orange-500 ring-4 ring-orange-500/5' : 'border-gray-100'}`}>
                            <div className="h-40 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                                <div className="p-4 bg-orange-100/50 rounded-full group-hover:scale-125 transition-transform duration-700">
                                    <Map className="w-12 h-12 text-orange-600/40" />
                                </div>
                                <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl text-[10px] font-black uppercase text-orange-600 border border-orange-100 shadow-sm">
                                    {pkg.package_type.replace('_', ' ')}
                                </div>
                                {isBooked && (
                                    <div className="absolute top-6 right-6 z-10 bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                        Selected
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-4 line-clamp-1">{pkg.name}</h3>

                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                                    {pkg.description || "Reliable and safe transportation service for your premium golf trip, including private chauffeured vehicles."}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-3 text-gray-400 border border-gray-100 px-4 py-2.5 rounded-2xl bg-gray-50/50">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">{pkg.duration_hours || 'Flex'} Hrs</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400 border border-gray-100 px-4 py-2.5 rounded-2xl bg-gray-50/50">
                                        <ShieldCheck className="w-4 h-4 text-orange-400" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Insured</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Package Rate</p>
                                        <p className="text-xl font-black text-orange-600">Rp {Number(pkg.price).toLocaleString()}</p>
                                    </div>

                                    {isBooked ? (
                                        <button
                                            onClick={() => removeItem('travel')}
                                            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSelectItem(pkg)}
                                            className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm active:scale-95"
                                        >
                                            Select
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
