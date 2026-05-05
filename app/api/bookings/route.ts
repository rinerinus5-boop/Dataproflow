import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmationEmail, sendAdminBookingNotificationEmail } from '@/lib/email/email-service';

// GET - Fetch available time slots for a given date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    // Use admin client to bypass RLS for public booking availability
    const supabase = createAdminClient();
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get availability for this day of week
    const { data: availability } = await supabase
      .from('booking_availability')
      .select('*')
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single();

    if (!availability) {
      return NextResponse.json({ 
        slots: [],
        message: 'No availability for this day' 
      });
    }

    // Check if date is blocked
    const { data: blockedDate } = await supabase
      .from('booking_blocked_dates')
      .select('*')
      .eq('blocked_date', date)
      .single();

    if (blockedDate) {
      return NextResponse.json({ 
        slots: [],
        message: 'This date is not available for booking' 
      });
    }

    // Get existing bookings for this date
    const { data: existingBookings } = await supabase
      .from('calendar_bookings')
      .select('start_time, end_time')
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    // Generate time slots (30-minute intervals)
    const slots: { time: string; available: boolean }[] = [];
    const startTime = availability.start_time.split(':');
    const endTime = availability.end_time.split(':');
    
    let currentHour = parseInt(startTime[0]);
    let currentMinute = parseInt(startTime[1]);
    const endHour = parseInt(endTime[0]);
    const endMinute = parseInt(endTime[1]);

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this slot is already booked
      const isBooked = existingBookings?.some(booking => {
        const bookingStart = booking.start_time.substring(0, 5);
        return bookingStart === timeString;
      });

      slots.push({
        time: timeString,
        available: !isBooked,
      });

      // Move to next 30-minute slot
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return NextResponse.json({ slots });

  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  console.log('=== BOOKING API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { 
      guestName, 
      guestEmail, 
      date, 
      time, 
      subject, 
      description,
      timezone = 'UTC',
      ticketId,
      conversationId,
    } = body;
    
    console.log('Parsed booking details:', {
      guestName,
      guestEmail,
      date,
      time,
      timezone,
      subject,
      description,
      ticketId,
      conversationId,
    });

    // Validate required fields
    if (!guestName || !guestEmail || !date || !time) {
      return NextResponse.json({ 
        error: 'Missing required fields: guestName, guestEmail, date, time' 
      }, { status: 400 });
    }

    // Use admin client to bypass RLS for guest bookings
    const adminSupabase = createAdminClient();
    const supabase = await createClient();
    
    // Get current user (optional - guests can book without being logged in)
    let userId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // Guest user - no auth
    }

    // Calculate end time (30 minutes after start)
    const [hours, minutes] = time.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endTime = `${endHours.toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    // Check if slot is still available
    const { data: existingBooking } = await adminSupabase
      .from('calendar_bookings')
      .select('id')
      .eq('booking_date', date)
      .eq('start_time', time)
      .neq('status', 'cancelled')
      .single();

    if (existingBooking) {
      return NextResponse.json({ 
        error: 'This time slot is no longer available' 
      }, { status: 409 });
    }

    // Create the booking
    const { data: booking, error: bookingError } = await adminSupabase
      .from('calendar_bookings')
      .insert({
        user_id: userId,
        guest_name: guestName,
        guest_email: guestEmail,
        booking_date: date,
        start_time: time,
        end_time: endTime,
        timezone,
        subject: subject || 'Support Call with DataProFlow',
        description: description || '',
        meeting_type: 'support_call',
        status: 'scheduled',
        ticket_id: ticketId || null,
        conversation_id: conversationId || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw bookingError;
    }

    // Try to create Google Calendar event if admin has connected calendar
    let googleMeetLink = null;
    console.log('=== STARTING CALENDAR INTEGRATION ===');
    try {
      // Find admin user with Google Calendar tokens (for guest bookings)
      console.log('Looking for admin with Google Calendar tokens...');
      const { data: adminTokens, error: tokensError } = await adminSupabase
        .from('google_calendar_tokens')
        .select('user_id')
        .limit(1)
        .single();

      console.log('Tokens query result:', { adminTokens, tokensError });

      if (tokensError) {
        console.error('Error fetching tokens:', tokensError);
      }

      if (adminTokens) {
        console.log('Found admin tokens:', adminTokens);
        console.log('Creating calendar event for booking:', booking.id, 'using admin user:', adminTokens.user_id);
        
        const calendarApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com'}/api/bookings/calendar-event`;
        console.log('Calling calendar API at:', calendarApiUrl);
        
        const requestBody = {
          bookingId: booking.id,
          adminUserId: adminTokens.user_id,
        };
        console.log('Calendar API request body:', requestBody);
        
        // Create calendar event via separate API call
        const eventResponse = await fetch(calendarApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        console.log('Calendar API response status:', eventResponse.status);
        
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          googleMeetLink = eventData.meetLink;
          console.log('Calendar event created successfully:', eventData);
        } else {
          const errorText = await eventResponse.text();
          console.error('Failed to create calendar event. Status:', eventResponse.status);
          console.error('Response text:', errorText);
        }
      } else {
        console.log('No admin with Google Calendar tokens found');
      }
    } catch (calendarError) {
      console.error('Error creating calendar event:', calendarError);
      // Continue without calendar event - booking is still valid
    }
    console.log('=== CALENDAR INTEGRATION COMPLETE ===');

    // Send confirmation emails
    try {
      // Send confirmation to guest
      await sendBookingConfirmationEmail(guestEmail, guestName, {
        date,
        time,
        subject: subject || 'Support Call with DataProFlow',
        meetLink: googleMeetLink || undefined,
      });

      // Send notification to admin
      await sendAdminBookingNotificationEmail({
        id: booking.id,
        guestName,
        guestEmail,
        date,
        time,
        subject: subject || 'Support Call with DataProFlow',
        description: description || undefined,
      });

      console.log('Booking confirmation emails sent successfully');
    } catch (emailError) {
      console.error('Error sending booking emails:', emailError);
      // Continue - booking is still valid even if emails fail
    }

    return NextResponse.json({ 
      success: true,
      booking: {
        ...booking,
        google_meet_link: googleMeetLink,
      },
      message: 'Booking created successfully',
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
