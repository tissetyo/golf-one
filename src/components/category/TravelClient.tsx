/**
 * Travel Client Component
 * 
 * Handles the interactive catalog of travel packages (transfers/tours).
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useBooking } from '@/components/booking/BookingProvider';
import { Map, MapPin, Clock, Check, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CategoryHeader from './CategoryHeader';

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
        <div className="space-y-6 lg:space-y-10">
            <CategoryHeader
                title="Travel Packages"
                subtitle={`Selected: ${trip.travel?.name || 'None'}`}
                icon={<Map className="w-5 h-5 lg:w-7 lg:h-7 text-orange-600" />}
                colorClass="bg-orange-50"
            />

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                {initialPackages.length > 0 ? (
                    initialPackages.map((pkg: any) => {
                        const isBooked = trip.travel?.id === pkg.id;
                        return (
                            <div key={pkg.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-orange-500 ring-4 ring-orange-500/5' : 'border-gray-100'}`}>
                                <div className="h-32 lg:h-40 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                                    <div className="p-3 lg:p-4 bg-orange-100/50 rounded-full group-hover:scale-125 transition-transform duration-700">
                                        <Map className="w-8 h-8 lg:w-12 lg:h-12 text-orange-600/40" />
                                    </div>
                                    <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 px-3 py-1.5 lg:px-4 lg:py-2 bg-white/80 backdrop-blur-md rounded-xl text-[8px] lg:text-[10px] font-black uppercase text-orange-600 border border-orange-100 shadow-sm">
                                        {pkg.package_type.replace('_', ' ')}
                                    </div>
                                    {isBooked && (
                                        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10 bg-orange-600 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                            <Check className="w-3 h-3 lg:w-4 lg:h-4 stroke-[3px]" />
                                            Selected
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 lg:p-8 flex flex-col flex-1">
                                    <h3 className="text-xl lg:text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors mb-3 lg:mb-4 line-clamp-1">{pkg.name}</h3>

                                    <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed mb-6 lg:mb-8 flex-1 line-clamp-2 lg:line-clamp-3">
                                        {pkg.description || "Reliable and safe transportation service for your premium golf trip."}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
                                        <div className="flex items-center gap-1.5 lg:gap-3 text-gray-400 border border-gray-100 px-3 py-2 lg:px-4 lg:py-2.5 rounded-2xl bg-gray-50/50">
                                            <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider">{pkg.duration_hours || 'Flex'} Hrs</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 lg:gap-3 text-gray-400 border border-gray-100 px-3 py-2 lg:px-4 lg:py-2.5 rounded-2xl bg-gray-50/50">
                                            <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                                            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-wider">Insured</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 lg:pt-8 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] lg:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Package Rate</p>
                                            <p className="text-lg lg:text-xl font-black text-orange-600">Rp {Number(pkg.price).toLocaleString()}</p>
                                        </div>

                                        {isBooked ? (
                                            <button
                                                onClick={() => removeItem('travel')}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-gray-100 text-gray-600 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSelectItem(pkg)}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm active:scale-95"
                                            >
                                                Select
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
                            <Map className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No Packages Found</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">We couldn't find any travel packages in this category. Check back soon for updates!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
