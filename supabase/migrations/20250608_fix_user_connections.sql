-- Fix: Store user connections properly with user_id
-- This ensures each user only sees their own connections

-- Drop existing connections table if it exists (clean slate)
DROP TABLE IF EXISTS user_connections CASCADE;

-- Create proper user_connections table
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  windsor_account_id TEXT, -- The ID from Windsor API (for disconnect API calls)
  platform TEXT NOT NULL, -- facebook, instagram, tiktok, etc.
  platform_username TEXT, -- Display name for the account
  ds_id TEXT, -- Windsor data source ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX idx_user_connections_platform ON user_connections(platform);

-- RLS policies
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connections
CREATE POLICY "Users can view own connections"
  ON user_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own connections
CREATE POLICY "Users can insert own connections"
  ON user_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own connections
CREATE POLICY "Users can delete own connections"
  ON user_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can see all connections
CREATE POLICY "Admins can view all connections"
  ON user_connections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment explaining the fix
COMMENT ON TABLE user_connections IS 'Stores user social media connections. Each user only sees their own connections via RLS policies.';
