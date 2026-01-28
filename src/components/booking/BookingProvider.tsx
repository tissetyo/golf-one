/**
 * Booking Provider
 * 
 * Context provider to manage the manual booking state (trip builder).
 * Allows users to select items across different categories and maintain a unified trip configuration.
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GolfCourse, Hotel, TravelPackage } from '@/types';

interface TripItem {
    id: string;
    name: string;
    price: number;
    details?: any;
}

interface BookingContextType {
    trip: {
        golf: TripItem | null;
        hotel: TripItem | null;
        travel: TripItem | null;
    };
    addItem: (type: 'golf' | 'hotel' | 'travel', item: TripItem) => void;
    removeItem: (type: 'golf' | 'hotel' | 'travel') => void;
    clearTrip: () => void;
    totalPrice: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [trip, setTrip] = useState<{
        golf: TripItem | null;
        hotel: TripItem | null;
        travel: TripItem | null;
    }>({
        golf: null,
        hotel: null,
        travel: null,
    });

    const addItem = (type: 'golf' | 'hotel' | 'travel', item: TripItem) => {
        setTrip((prev) => ({ ...prev, [type]: item }));
    };

    const removeItem = (type: 'golf' | 'hotel' | 'travel') => {
        setTrip((prev) => ({ ...prev, [type]: null }));
    };

    const clearTrip = () => {
        setTrip({ golf: null, hotel: null, travel: null });
    };

    const totalPrice =
        (trip.golf?.price || 0) +
        (trip.hotel?.price || 0) +
        (trip.travel?.price || 0);

    return (
        <BookingContext.Provider value={{ trip, addItem, removeItem, clearTrip, totalPrice }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
