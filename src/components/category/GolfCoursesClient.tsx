/**
 * Golf Courses Client Component
 * 
 * Handles the interactive catalog of golf courses, including tee time selection.
 * Integrates with the BookingProvider to manage selections.
 */

'use client';

import { useState } from 'react';
import { useBooking } from '@/components/booking/BookingProvider';
import { Flag, Search, MapPin, Star, MoreVertical, Clock, Check } from 'lucide-react';
import Link from 'next/link';

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
        <div className="space-y-10">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm -mx-6 px-6 py-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <Flag className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900">Golf Courses</h1>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Selected: {trip.golf?.name || 'None'}</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search world-class courses..."
                                className="pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all w-64 lg:w-[450px] shadow-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {initialCourses.map((course) => {
                    const isBooked = trip.golf?.id === course.id;
                    return (
                        <div key={course.id} className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-2xl ${isBooked ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-gray-100'}`}>
                            <div className="h-56 bg-gray-100 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                                <div className="absolute top-6 right-6 z-10">
                                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-gray-400 hover:text-emerald-600 border border-white shadow-xl transition-all">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                                {isBooked && (
                                    <div className="absolute top-6 left-6 z-10 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                        Selected
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{course.name}</h3>
                                    <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-black">{course.rating || 'N/A'}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> {course.location}
                                </p>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                                    {course.description || "Experience a world-class round of golf on these pristine fairways with breathtaking scenic views and professional facilities."}
                                </p>
                                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Starts From</p>
                                        <p className="text-xl font-black text-emerald-600">Rp {Number(course.price_range?.min || 0).toLocaleString()}</p>
                                    </div>

                                    {isBooked ? (
                                        <button
                                            onClick={() => removeItem('golf')}
                                            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedCourse(course)}
                                            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
                                        >
                                            See Slots
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                                {['07:00 AM', '09:00 AM', '11:30 AM', '01:00 PM', '03:30 PM'].map((time) => (
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
