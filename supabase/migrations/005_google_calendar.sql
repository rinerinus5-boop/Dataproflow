-- Google Calendar tokens storage
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      access_token TEXT NOT NULL,
        refresh_token TEXT,
          expiry_date TIMESTAMPTZ,
            scope TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                  UNIQUE(user_id)
                  );

                  -- Calendar bookings table
                  CREATE TABLE IF NOT EXISTS calendar_bookings (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
                        guest_name VARCHAR(255) NOT NULL,
                          guest_email VARCHAR(255) NOT NULL,
                            booking_date DATE NOT NULL,
                              start_time TIME NOT NULL,
                                end_time TIME NOT NULL,
                                  timezone VARCHAR(100) DEFAULT 'UTC',
                                    meeting_type VARCHAR(50) DEFAULT 'support_call',
                                      subject VARCHAR(500),
                                        description TEXT,
                                          google_event_id VARCHAR(255),
                                            google_meet_link TEXT,
                                              status VARCHAR(50) DEFAULT 'scheduled',
                                                ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
                                                  conversation_id UUID REFERENCES support_conversations(id) ON DELETE SET NULL,
                                                    created_at TIMESTAMPTZ DEFAULT NOW(),
                                                      updated_at TIMESTAMPTZ DEFAULT NOW()
                                                      );

                                                      -- Available time slots configuration (admin can set their availability)
                                                      CREATE TABLE IF NOT EXISTS booking_availability (
                                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                          admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                                                            day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
                                                              start_time TIME NOT NULL,
                                                                end_time TIME NOT NULL,
                                                                  is_active BOOLEAN DEFAULT true,
                                                                    created_at TIMESTAMPTZ DEFAULT NOW(),
                                                                      updated_at TIMESTAMPTZ DEFAULT NOW(),
                                                                        UNIQUE(admin_user_id, day_of_week)
                                                                        );

                                                                        -- Blocked dates (holidays, vacations, etc.)
                                                                        CREATE TABLE IF NOT EXISTS booking_blocked_dates (
                                                                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                                            admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                                                                              blocked_date DATE NOT NULL,
                                                                                reason VARCHAR(255),
                                                                                  created_at TIMESTAMPTZ DEFAULT NOW(),
                                                                                    UNIQUE(admin_user_id, blocked_date)
                                                                                    );

                                                                                    -- Enable RLS
                                                                                    ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
                                                                                    ALTER TABLE calendar_bookings ENABLE ROW LEVEL SECURITY;
                                                                                    ALTER TABLE booking_availability ENABLE ROW LEVEL SECURITY;
                                                                                    ALTER TABLE booking_blocked_dates ENABLE ROW LEVEL SECURITY;

                                                                                    -- RLS Policies for google_calendar_tokens
                                                                                    CREATE POLICY "Users can view own tokens" ON google_calendar_tokens
                                                                                      FOR SELECT USING (auth.uid() = user_id);

                                                                                      CREATE POLICY "Users can insert own tokens" ON google_calendar_tokens
                                                                                        FOR INSERT WITH CHECK (auth.uid() = user_id);

                                                                                        CREATE POLICY "Users can update own tokens" ON google_calendar_tokens
                                                                                          FOR UPDATE USING (auth.uid() = user_id);

                                                                                          CREATE POLICY "Users can delete own tokens" ON google_calendar_tokens
                                                                                            FOR DELETE USING (auth.uid() = user_id);

                                                                                            -- RLS Policies for calendar_bookings
                                                                                            CREATE POLICY "Users can view own bookings" ON calendar_bookings
                                                                                              FOR SELECT USING (auth.uid() = user_id OR guest_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

                                                                                              CREATE POLICY "Anyone can create bookings" ON calendar_bookings
                                                                                                FOR INSERT WITH CHECK (true);

                                                                                                CREATE POLICY "Admins can view all bookings" ON calendar_bookings
                                                                                                  FOR SELECT USING (
                                                                                                      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
                                                                                                        );

                                                                                                        CREATE POLICY "Admins can update bookings" ON calendar_bookings
                                                                                                          FOR UPDATE USING (
                                                                                                              EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
                                                                                                                );

                                                                                                                -- RLS Policies for booking_availability
                                                                                                                CREATE POLICY "Anyone can view availability" ON booking_availability
                                                                                                                  FOR SELECT USING (true);

                                                                                                                  CREATE POLICY "Admins can manage availability" ON booking_availability
                                                                                                                    FOR ALL USING (
                                                                                                                        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
                                                                                                                          );

                                                                                                                          -- RLS Policies for booking_blocked_dates
                                                                                                                          CREATE POLICY "Anyone can view blocked dates" ON booking_blocked_dates
                                                                                                                            FOR SELECT USING (true);

                                                                                                                            CREATE POLICY "Admins can manage blocked dates" ON booking_blocked_dates
                                                                                                                              FOR ALL USING (
                                                                                                                                  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
                                                                                                                                    );

                                                                                                                                    -- Indexes for performance
                                                                                                                                    CREATE INDEX idx_calendar_bookings_date ON calendar_bookings(booking_date);
                                                                                                                                    CREATE INDEX idx_calendar_bookings_status ON calendar_bookings(status);
                                                                                                                                    CREATE INDEX idx_calendar_bookings_guest_email ON calendar_bookings(guest_email);
                                                                                                                                    CREATE INDEX idx_booking_availability_day ON booking_availability(day_of_week);

                                                                                                                                    -- Insert default availability (Mon-Fri, 9 AM - 5 PM)
                                                                                                                                    -- This will be for the first admin user, you can update this later
                                                                                                                                    -- INSERT INTO booking_availability (admin_user_id, day_of_week, start_time, end_time)
                                                                                                                                    -- SELECT id, day, '09:00', '17:00'
                                                                                                                                    -- FROM profiles, generate_series(1, 5) AS day
                                                                                                                                    -- WHERE role = 'admin'
                                                                                                                                    -- LIMIT 5;
                                                                                                                                    