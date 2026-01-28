/**
 * Create Payment API Route
 * 
 * Creates a Xendit invoice for a booking after vendor approval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInvoice } from '@/lib/xendit/client';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json(
                { success: false, error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        // Get booking details
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .eq('user_id', user.id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if booking is approved
        if (booking.status !== 'approved' && booking.status !== 'pending_payment') {
            return NextResponse.json(
                { success: false, error: 'Booking must be approved before payment' },
                { status: 400 }
            );
        }

        // Check if payment already exists
        const { data: existingPayment } = await supabase
            .from('payments')
            .select('*')
            .eq('booking_id', bookingId)
            .eq('status', 'pending')
            .single();

        if (existingPayment?.xendit_invoice_id) {
            // Return existing invoice URL
            return NextResponse.json({
                success: true,
                data: {
                    invoiceUrl: `https://checkout.xendit.co/web/${existingPayment.xendit_invoice_id}`,
                    paymentId: existingPayment.id,
                },
            });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone, email')
            .eq('id', user.id)
            .single();

        // Create external ID for tracking
        const externalId = `GOLF-${bookingId.slice(0, 8).toUpperCase()}-${Date.now()}`;

        // Build invoice items from booking details
        const items = [];
        const bookingDetails = booking.booking_details;

        if (bookingDetails.golf) {
            items.push({
                name: 'Golf Tee Time',
                quantity: bookingDetails.golf.players || 1,
                price: Math.round(booking.total_amount * 0.6), // Estimate golf portion
                category: 'Golf',
            });
        }

        if (bookingDetails.hotel) {
            items.push({
                name: 'Hotel Accommodation',
                quantity: 1,
                price: Math.round(booking.total_amount * 0.3),
                category: 'Accommodation',
            });
        }

        if (bookingDetails.travel) {
            items.push({
                name: 'Travel Package',
                quantity: bookingDetails.travel.passengers || 1,
                price: Math.round(booking.total_amount * 0.1),
                category: 'Travel',
            });
        }

        // If no specific items, create generic item
        if (items.length === 0) {
            items.push({
                name: 'Golf Tourism Package',
                quantity: 1,
                price: booking.total_amount,
                category: 'Package',
            });
        }

        // Create Xendit invoice
        const invoice = await createInvoice({
            externalId,
            amount: booking.total_amount,
            payerEmail: profile?.email || user.email!,
            description: `Golf Tourism Booking - ${booking.booking_type}`,
            customerName: profile?.full_name || undefined,
            customerPhone: profile?.phone || undefined,
            items,
            successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?id=${bookingId}`,
            failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/failed?id=${bookingId}`,
        });

        // Create or update payment record
        const paymentData = {
            booking_id: bookingId,
            xendit_invoice_id: invoice.id,
            xendit_external_id: externalId,
            amount: booking.total_amount,
            status: 'pending',
        };

        let payment;
        if (existingPayment) {
            const { data, error } = await supabase
                .from('payments')
                .update(paymentData)
                .eq('id', existingPayment.id)
                .select()
                .single();

            if (error) throw error;
            payment = data;
        } else {
            const { data, error } = await supabase
                .from('payments')
                .insert(paymentData)
                .select()
                .single();

            if (error) throw error;
            payment = data;
        }

        // Update booking status
        await supabase
            .from('bookings')
            .update({ status: 'pending_payment' })
            .eq('id', bookingId);

        return NextResponse.json({
            success: true,
            data: {
                invoiceUrl: invoice.invoice_url,
                invoiceId: invoice.id,
                paymentId: payment.id,
                expiryDate: invoice.expiry_date,
            },
        });
    } catch (error) {
        console.error('Create Payment Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}
