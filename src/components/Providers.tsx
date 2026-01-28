/**
 * client-side Providers Wrapper
 */

'use client';

import { BookingProvider } from '@/components/booking/BookingProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <BookingProvider>
            {children}
        </BookingProvider>
    );
}
