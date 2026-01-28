/**
 * Bookings API Route
 * 
 * Handles CRUD operations for bookings.
 * Manages vendor approval workflow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET - List bookings
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        let query = supabase.from('bookings').select('*, payments(*)');

        // Filter based on role
        if (profile?.role === 'admin') {
            // Admin sees all bookings
        } else if (['golf_vendor', 'hotel_vendor', 'travel_vendor'].includes(profile?.role || '')) {
            // Vendors see bookings that involve them
            query = query.contains('vendor_approvals', { [user.id]: {} });
        } else {
            // Regular users see only their bookings
            query = query.eq('user_id', user.id);
        }

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (type) {
            query = query.eq('booking_type', type);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('GET Bookings Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST - Create a new booking
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { booking_type, booking_details, total_amount, notes } = body;

        if (!booking_type || !booking_details || !total_amount) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Identify vendors to request approval from
        const vendorApprovals: Record<string, { status: string }> = {};

        // Get vendor IDs from booking details
        if (booking_details.golf?.course_id) {
            const { data: course } = await supabase
                .from('golf_courses')
                .select('vendor_id')
                .eq('id', booking_details.golf.course_id)
                .single();

            if (course) {
                vendorApprovals[course.vendor_id] = { status: 'pending' };
            }
        }

        if (booking_details.hotel?.hotel_id) {
            const { data: hotel } = await supabase
                .from('hotels')
                .select('vendor_id')
                .eq('id', booking_details.hotel.hotel_id)
                .single();

            if (hotel) {
                vendorApprovals[hotel.vendor_id] = { status: 'pending' };
            }
        }

        if (booking_details.travel?.package_id) {
            const { data: pkg } = await supabase
                .from('travel_packages')
                .select('vendor_id')
                .eq('id', booking_details.travel.package_id)
                .single();

            if (pkg) {
                vendorApprovals[pkg.vendor_id] = { status: 'pending' };
            }
        }

        // Create booking
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                booking_type,
                booking_details,
                total_amount,
                notes,
                vendor_approvals: vendorApprovals,
                status: Object.keys(vendorApprovals).length > 0 ? 'pending_approval' : 'approved',
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Send notifications to vendors
        for (const vendorId of Object.keys(vendorApprovals)) {
            await supabase.from('notifications').insert({
                recipient_id: vendorId,
                type: 'approval_needed',
                title: 'New Booking Request',
                message: `A new ${booking_type} booking requires your approval.`,
                data: {
                    booking_id: booking.id,
                    booking_type,
                    total_amount,
                },
            });
        }

        return NextResponse.json({ success: true, data: booking });
    } catch (error) {
        console.error('POST Booking Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH - Update booking (for vendor approval)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { booking_id, action, notes } = body;

        if (!booking_id || !action) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', booking_id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Check if user is a vendor for this booking
        const vendorApprovals = booking.vendor_approvals || {};
        if (!vendorApprovals[user.id]) {
            return NextResponse.json(
                { success: false, error: 'Not authorized to approve this booking' },
                { status: 403 }
            );
        }

        // Update vendor approval status
        vendorApprovals[user.id] = {
            status: action === 'approve' ? 'approved' : 'rejected',
            approved_at: new Date().toISOString(),
            notes,
        };

        // Check if all vendors have approved
        const approvals = Object.values(vendorApprovals) as { status: string }[];
        const allApproved = approvals.every((v) => v.status === 'approved');
        const anyRejected = approvals.some((v) => v.status === 'rejected');

        let newStatus = booking.status;
        if (anyRejected) {
            newStatus = 'cancelled';
        } else if (allApproved) {
            newStatus = 'approved';
        }

        // Update booking
        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
                vendor_approvals: vendorApprovals,
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq('id', booking_id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        // Notify user about approval status
        await supabase.from('notifications').insert({
            recipient_id: booking.user_id,
            type: 'booking_request',
            title: action === 'approve' ? 'Booking Approved!' : 'Booking Update',
            message: action === 'approve'
                ? allApproved
                    ? 'All vendors have approved your booking. You can now proceed to payment.'
                    : 'A vendor has approved your booking. Waiting for other approvals.'
                : 'A vendor has declined your booking request.',
            data: {
                booking_id,
                action,
                all_approved: allApproved,
            },
        });

        return NextResponse.json({ success: true, data: updatedBooking });
    } catch (error) {
        console.error('PATCH Booking Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
