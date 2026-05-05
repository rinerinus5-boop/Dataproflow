import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCalendarEvent, refreshAccessToken } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  console.log('=== CALENDAR EVENT API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Calendar event request body:', body);
    
    const { bookingId, adminUserId } = body;

    console.log('Extracted params:', { bookingId, adminUserId });

    if (!bookingId || !adminUserId) {
      console.error('Missing required fields:', { bookingId, adminUserId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Get booking details
    console.log('Fetching booking details for ID:', bookingId);
    const { data: booking, error: bookingError } = await adminSupabase
      .from('calendar_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    console.log('Booking query result:', { booking, bookingError });

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get admin's Google Calendar tokens
    console.log('Fetching Google Calendar tokens for user:', adminUserId);
    const { data: tokens, error: tokensError } = await adminSupabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', adminUserId)
      .single();

    console.log('Tokens query result:', { tokens, tokensError });

    if (tokensError || !tokens) {
      console.error('Google Calendar not connected:', tokensError);
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    let accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    
    console.log('Token expiry date:', tokens.expiry_date);
    console.log('Current date:', new Date().toISOString());
    console.log('Is token expired?', tokens.expiry_date && new Date(tokens.expiry_date) < new Date());

    // Check if token is expired and refresh if needed
    if (tokens.expiry_date && new Date(tokens.expiry_date) < new Date()) {
      console.log('Token expired, refreshing...');
      try {
        const newCredentials = await refreshAccessToken(refreshToken);
        console.log('Token refresh successful:', newCredentials);
        accessToken = newCredentials.access_token || accessToken;
        
        // Update tokens in database
        await adminSupabase
          .from('google_calendar_tokens')
          .update({
            access_token: newCredentials.access_token,
            expiry_date: newCredentials.expiry_date ? new Date(newCredentials.expiry_date).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', adminUserId);
        console.log('Tokens updated in database');
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return NextResponse.json({ error: 'Failed to refresh Google token' }, { status: 401 });
      }
    }

    // Create calendar event
    const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const endDateTime = new Date(`${booking.booking_date}T${booking.end_time}`);
    
    console.log('Creating calendar event with times:', { startDateTime, endDateTime });

    const eventDetails = {
      summary: booking.subject || 'Support Call with DataProFlow',
      description: `
Support call booked via DataProFlow

Guest: ${booking.guest_name}
Email: ${booking.guest_email}

${booking.description || ''}

---
Booking ID: ${booking.id}
        `.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      attendeeEmail: booking.guest_email,
      timeZone: booking.timezone || 'UTC',
    };
    
    console.log('Event details:', eventDetails);

    const event = await createCalendarEvent(
      accessToken,
      refreshToken,
      eventDetails
    );
    
    console.log('Calendar event created:', event);

    // Update booking with Google event details
    const meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri;
    
    await adminSupabase
      .from('calendar_bookings')
      .update({
        google_event_id: event.id,
        google_meet_link: meetLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      eventId: event.id,
      meetLink,
      htmlLink: event.htmlLink,
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}
