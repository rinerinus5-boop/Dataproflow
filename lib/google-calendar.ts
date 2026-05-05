import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL 
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`
  : 'https://www.dataproflow.com/api/auth/callback/google';

// Scopes required for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Create OAuth2 client
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

// Generate auth URL for user to authorize
export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state || '',
  });
}

// Exchange code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Create calendar event
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventDetails: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmail?: string;
    timeZone?: string;
  }
) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startTime.toISOString(),
      timeZone: eventDetails.timeZone || 'UTC',
    },
    end: {
      dateTime: eventDetails.endTime.toISOString(),
      timeZone: eventDetails.timeZone || 'UTC',
    },
    attendees: [
      { email: eventDetails.attendeeEmail },
    ],
    conferenceData: {
      createRequest: {
        requestId: `dataproflow-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
  });

  return response.data;
}

// Get available time slots (for booking UI)
export async function getAvailableSlots(
  accessToken: string,
  refreshToken: string,
  date: Date,
  durationMinutes: number = 30
) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
  
  const endOfDay = new Date(date);
  endOfDay.setHours(18, 0, 0, 0); // End at 6 PM

  // Get existing events for the day
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const busySlots = response.data.items?.map((event) => ({
    start: new Date(event.start?.dateTime || event.start?.date || ''),
    end: new Date(event.end?.dateTime || event.end?.date || ''),
  })) || [];

  // Generate available slots
  const availableSlots: { start: Date; end: Date }[] = [];
  let currentTime = new Date(startOfDay);

  while (currentTime < endOfDay) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
    
    // Check if slot overlaps with any busy slot
    const isAvailable = !busySlots.some((busy: { start: Date; end: Date }) => 
      (currentTime >= busy.start && currentTime < busy.end) ||
      (slotEnd > busy.start && slotEnd <= busy.end) ||
      (currentTime <= busy.start && slotEnd >= busy.end)
    );

    if (isAvailable && slotEnd <= endOfDay) {
      availableSlots.push({
        start: new Date(currentTime),
        end: slotEnd,
      });
    }

    // Move to next slot (30-minute intervals)
    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }

  return availableSlots;
}

// Refresh access token if expired
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

// Delete calendar event
export async function deleteCalendarEvent(accessToken: string, eventId: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
}
