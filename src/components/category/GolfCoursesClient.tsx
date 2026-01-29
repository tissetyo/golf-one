/**
 * Golf Courses Client Component
 * 
 * Handles the interactive catalog of golf courses, including tee time selection.
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useState } from 'react';
import { useBooking } from '@/components/booking/BookingProvider';
import { Flag, MapPin, Star, MoreVertical, Clock, Check } from 'lucide-react';
import Link from 'next/link';
import CategoryHeader from './CategoryHeader';
import QuickFilters from './QuickFilters';

interface GolfCoursesClientProps {
    initialCourses: any[];
}

export default function GolfCoursesClient({ initialCourses }: GolfCoursesClientProps) {
    const { addItem, trip, removeItem } = useBooking();
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

    const handleSelectSlot = (course: any, timeId: string, time: string, price: number) => {
        addItem('golf', {
            id: course.id,
            name: course.name,
            price: price,
            details: {
                time: time,
                time_id: timeId,
                date: new Date().toISOString().split('T')[0] // Default to today for demo
            }
        });
        setSelectedCourse(null); // Close picker
    };

    return (
        <div className="space-y-6 lg:space-y-10">
            <CategoryHeader
                title="Golf Courses"
                subtitle={`Selected: ${trip.golf?.name || 'None'}`}
                icon={<Flag className="w-5 h-5 lg:w-7 lg:h-7 text-emerald-600" />}
                colorClass="bg-emerald-50"
            />

            <QuickFilters category="golf" />

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                {initialCourses.length > 0 ? (
                    initialCourses.map((course: any) => {
                        const isBooked = trip.golf?.id === course.id;
                        return (
                            <div key={course.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-gray-100'}`}>
                                <div className="h-40 lg:h-56 bg-gray-100 relative overflow-hidden">
                                    {course.images?.[0] ? (
                                        <img src={course.images[0]} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className={`absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                                    )}
                                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-10">
                                        <button className="p-2 lg:p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-400 hover:text-emerald-600 border border-white shadow-xl transition-all">
                                            <MoreVertical className="w-4 h-4 lg:w-5 lg:h-5" />
                                        </button>
                                    </div>
                                    {isBooked && (
                                        <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 bg-emerald-600 text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                            <Check className="w-3 h-3 lg:w-4 lg:h-4 stroke-[3px]" />
                                            Selected
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 lg:p-8 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{course.name}</h3>
                                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                                            <Star className="w-3 h-3 lg:w-4 lg:h-4 fill-current" />
                                            <span className="text-xs lg:text-sm font-black">{course.rating || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-4 lg:mb-6">
                                        <MapPin className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-500" /> {course.location}
                                    </p>
                                    <p className="text-xs lg:text-sm text-gray-500 font-medium leading-relaxed mb-6 lg:mb-8 flex-1 line-clamp-2 lg:line-clamp-3">
                                        {course.description || "Experience a world-class round of golf on these pristine fairways."}
                                    </p>
                                    <div className="flex items-center justify-between pt-6 lg:pt-8 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <p className="text-[9px] lg:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Starts From</p>
                                            <p className="text-lg lg:text-xl font-black text-emerald-600">Rp {Number(course.price_range?.min || 0).toLocaleString()}</p>
                                        </div>

                                        {isBooked ? (
                                            <button
                                                onClick={() => removeItem('golf')}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-gray-100 text-gray-600 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedCourse(course)}
                                                className="px-6 lg:px-8 py-3 lg:py-4 bg-emerald-600 text-white rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                                            >
                                                See Slots
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
                            <Flag className="w-10 h-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No Courses Found</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">We couldn't find any active courses. Please try again later or check back soon!</p>
                    </div>
                )}
            </div>

            {/* Tee Time Picker Overlay (Modal) */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedCourse(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Select Tee Time</h2>
                                <p className="text-gray-400 font-bold text-sm">{selectedCourse.name}</p>
                            </div>
                            <button onClick={() => setSelectedCourse(null)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center text-2xl font-light">×</button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {['07:00 AM', '09:00 AM', '11:30 AM', '01:00 PM', '03:30 PM'].map((time: string) => (
                                    <button
                                        key={time}
                                        onClick={() => handleSelectSlot(selectedCourse, time, time, selectedCourse.price_range?.min || 1500000)}
                                        className="p-6 rounded-3xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg transition-all group text-left"
                                    >
                                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 mb-3" />
                                        <p className="font-black text-gray-900 group-hover:text-emerald-700">{time}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rp {Number(selectedCourse.price_range?.min).toLocaleString()}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-gray-50 flex items-center justify-between">
                            <p className="text-sm text-gray-400 font-medium">All times are in local clubhouse time.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
