import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - Fetch all bookings for admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'upcoming';
    
    const adminSupabase = createAdminClient();
    
    let query = adminSupabase
      .from('calendar_bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    const today = new Date().toISOString().split('T')[0];

    if (filter === 'upcoming') {
      query = query.gte('booking_date', today).neq('status', 'cancelled');
    } else if (filter === 'past') {
      query = query.lt('booking_date', today);
    } else if (filter === 'cancelled') {
      query = query.eq('status', 'cancelled');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update booking status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'bookingId and status are required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from('calendar_bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      booking: data 
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // First, get the booking to check if it has a Google Calendar event
    const { data: booking } = await adminSupabase
      .from('calendar_bookings')
      .select('google_event_id')
      .eq('id', bookingId)
      .single();

    // If booking has a Google Calendar event, try to delete it
    if (booking?.google_event_id) {
      try {
        // Get admin's Google Calendar tokens
        const { data: tokens } = await adminSupabase
          .from('google_calendar_tokens')
          .select('*')
          .limit(1)
          .single();

        if (tokens) {
          // Delete the Google Calendar event
          const { deleteCalendarEvent } = await import('@/lib/google-calendar');
          await deleteCalendarEvent(tokens.access_token, booking.google_event_id);
          console.log('Deleted Google Calendar event:', booking.google_event_id);
        }
      } catch (calendarError) {
        console.error('Error deleting Google Calendar event:', calendarError);
        // Continue with booking deletion even if calendar deletion fails
      }
    }

    // Delete the booking
    const { error } = await adminSupabase
      .from('calendar_bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
