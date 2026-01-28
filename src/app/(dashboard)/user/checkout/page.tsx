/**
 * Checkout Page
 * 
 * Final review of the manually built trip.
 * Allows users to confirm their selection and create a formal booking request.
 */

'use client';

import { createClient } from '@/lib/supabase/client';
import { useBooking } from '@/components/booking/BookingProvider';
import { Flag, Hotel, Map, ChevronLeft, ChevronRight, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const supabase = createClient();
    const { trip, totalPrice, clearTrip } = useBooking();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-200 shadow-xl shadow-emerald-900/10">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900">Booking Requested!</h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Your trip has been sent to our vendors for approval. You'll receive a payment link once confirmed.
                    </p>
                    <button
                        onClick={() => router.push('/user')}
                        className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('bookings')
                .insert({
                    user_id: user.id,
                    booking_type: 'package',
                    total_amount: totalPrice + 75000,
                    status: 'pending_approval',
                    booking_details: {
                        golf: trip.golf,
                        hotel: trip.hotel,
                        travel: trip.travel
                    }
                });

            if (error) throw error;
            setIsSuccess(true);
            clearTrip();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to request booking. Please try again.');
        } finally {
            setIsSubmitting(true); // Keep spinner until redirect
            setIsSubmitting(false);
        }
    };

    const hasItems = trip.golf || trip.hotel || trip.travel;

    if (!hasItems) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                    <Flag className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Your Trip is Empty</h1>
                <p className="text-gray-400 font-medium mb-8">Start by selecting a course or a hotel.</p>
                <Link href="/user/golf" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                    Browse Golf Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
            {/* Checkout Navbar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link href="/user/golf" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to discovery
                    </Link>
                    <h1 className="text-xl font-black">Review Your Trip</h1>
                    <div className="w-24"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
                {/* Trip Summary Section */}
                <section className="space-y-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-gray-200"></div>
                        Manual Selections
                    </h2>

                    <div className="space-y-4">
                        {trip.golf && (
                            <div className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm flex items-center gap-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Flag className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Golf Course</p>
                                    <p className="text-xl font-black text-gray-900">{trip.golf.name}</p>
                                    <p className="text-sm font-bold text-gray-400">{trip.golf.details.time} • Today</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">Rp {trip.golf.price.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {trip.hotel && (
                            <div className="bg-white p-6 rounded-[32px] border border-blue-100 shadow-sm flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                    <Hotel className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Accommodation</p>
                                    <p className="text-xl font-black text-gray-900">{trip.hotel.name}</p>
                                    <p className="text-sm font-bold text-gray-400">{trip.hotel.details.room_type} • 1 Night</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">Rp {trip.hotel.price.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        {trip.travel && (
                            <div className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm flex items-center gap-6">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                                    <Map className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Transport</p>
                                    <p className="text-xl font-black text-gray-900">{trip.travel.name}</p>
                                    <p className="text-sm font-bold text-gray-400">{trip.travel.details.package_type} • {trip.travel.details.duration}h</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">Rp {trip.travel.price.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pricing Breakdown */}
                <section className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-10 -mr-32 -mt-32"></div>

                    <h3 className="text-xl font-black mb-8">Trip Summary</h3>

                    <div className="space-y-4 mb-10">
                        <div className="flex items-center justify-between text-gray-400">
                            <span className="text-sm font-medium">Subtotal</span>
                            <span className="text-sm font-bold">Rp {totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-400">
                            <span className="text-sm font-medium">Service Fee & Insurance</span>
                            <span className="text-sm font-bold">Rp 75,000</span>
                        </div>
                        <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-xl font-black">Total Amount</span>
                            <span className="text-2xl font-black text-emerald-400">Rp {(totalPrice + 75000).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-start gap-4 p-5 bg-gray-800/50 rounded-3xl border border-gray-700/50">
                            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-sm font-bold mb-1">Guaranteed Service</p>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">Our vendors are verified for quality and reliability. Full refunds available up to 48 hours prior.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={isSubmitting}
                            className="group relative w-full py-6 bg-emerald-600 rounded-[28px] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-950/40 hover:bg-emerald-700 transition-all disabled:opacity-50 overflow-hidden"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <LoaderIcon /> Requesting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Confirm & Request Approval
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

function LoaderIcon() {
    return (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    );
}
