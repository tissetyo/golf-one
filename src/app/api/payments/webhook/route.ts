/**
 * Xendit Webhook Handler
 * 
 * Receives payment notifications from Xendit and updates booking status.
 * Creates settlement records for admin to process.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookToken, type WebhookPayload } from '@/lib/xendit/client';

export async function POST(request: NextRequest) {
    try {
        // Verify webhook token
        const webhookToken = request.headers.get('x-callback-token');
        if (!webhookToken || !verifyWebhookToken(webhookToken)) {
            console.error('Invalid webhook token');
            return NextResponse.json(
                { success: false, error: 'Invalid webhook token' },
                { status: 401 }
            );
        }

        // Parse webhook payload
        const payload: WebhookPayload = await request.json();
        console.log('Xendit Webhook received:', payload);

        const supabase = await createClient();

        // Find payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*, bookings(*)')
            .eq('xendit_external_id', payload.external_id)
            .single();

        if (paymentError || !payment) {
            console.error('Payment not found for external_id:', payload.external_id);
            return NextResponse.json(
                { success: false, error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Update payment status based on webhook
        const paymentUpdate: Record<string, unknown> = {
            status: payload.status.toLowerCase(),
            updated_at: new Date().toISOString(),
        };

        if (payload.status === 'PAID') {
            paymentUpdate.paid_at = payload.paid_at;
            paymentUpdate.payment_method = payload.payment_method;
            paymentUpdate.payment_channel = payload.payment_channel;
        }

        await supabase
            .from('payments')
            .update(paymentUpdate)
            .eq('id', payment.id);

        // Update booking status
        const booking = payment.bookings;
        let bookingStatus = booking.status;

        if (payload.status === 'PAID') {
            bookingStatus = 'paid';

            // Create settlement records for each vendor in the booking
            const vendorApprovals = booking.vendor_approvals || {};
            const vendorIds = Object.keys(vendorApprovals);

            if (vendorIds.length > 0) {
                // Calculate split amounts (simple equal split for now)
                // In production, this would be based on actual item prices
                const platformFee = Math.round(payment.amount * 0.05); // 5% platform fee
                const vendorAmount = payment.amount - platformFee;
                const perVendorAmount = Math.round(vendorAmount / vendorIds.length);

                // Create settlement records
                const settlements = vendorIds.map((vendorId) => ({
                    payment_id: payment.id,
                    vendor_id: vendorId,
                    amount: perVendorAmount,
                    status: 'pending',
                    notes: `Auto-generated from payment ${payment.id}`,
                }));

                await supabase
                    .from('split_settlements')
                    .insert(settlements);

                // Notify admin about new settlements
                await supabase
                    .from('notifications')
                    .insert({
                        recipient_id: null, // Will be handled by a trigger or admin query
                        type: 'settlement',
                        title: 'New payment received - settlements pending',
                        message: `Payment of ${payment.amount} received for booking ${booking.id}. ${vendorIds.length} vendor settlements pending.`,
                        data: {
                            payment_id: payment.id,
                            booking_id: booking.id,
                            vendor_count: vendorIds.length,
                            total_amount: payment.amount,
                        },
                    });
            }

            // Notify user
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: booking.user_id,
                    type: 'payment_received',
                    title: 'Payment Successful!',
                    message: `Your payment of ${payment.amount} has been received. Your booking is now confirmed.`,
                    data: {
                        payment_id: payment.id,
                        booking_id: booking.id,
                    },
                });

            // Notify vendors
            for (const vendorId of vendorIds) {
                await supabase
                    .from('notifications')
                    .insert({
                        recipient_id: vendorId,
                        type: 'payment_received',
                        title: 'Booking Payment Received',
                        message: `Payment received for a booking at your establishment. Settlement pending admin processing.`,
                        data: {
                            payment_id: payment.id,
                            booking_id: booking.id,
                        },
                    });
            }
        } else if (payload.status === 'EXPIRED') {
            bookingStatus = 'pending_payment'; // Allow retry
        }

        await supabase
            .from('bookings')
            .update({
                status: bookingStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', booking.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { success: false, error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Also handle GET for Xendit verification
export async function GET() {
    return NextResponse.json({ success: true, message: 'Webhook endpoint active' });
}
