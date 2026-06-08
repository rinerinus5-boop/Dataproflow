-- Create pending_connections table for OAuth session tracking
-- This enables secure per-user OAuth flow with Windsor.ai

CREATE TABLE IF NOT EXISTS pending_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    windsor_access_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Ensure access tokens are unique per session
    CONSTRAINT unique_access_token UNIQUE (windsor_access_token)
);

-- Index for faster lookup by access token
CREATE INDEX IF NOT EXISTS idx_pending_connections_token 
    ON pending_connections(windsor_access_token);

-- Index for cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_pending_connections_expires 
    ON pending_connections(expires_at);

-- RLS: Users can only see their own pending connections
ALTER TABLE pending_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending connections"
    ON pending_connections
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Cleanup job runs every hour to remove expired entries
-- (This can be done via a cron job or just rely on the gt() filter in queries)

COMMENT ON TABLE pending_connections IS 
    'Temporary storage for OAuth sessions with Windsor.ai. 
     Access tokens are used to fetch session-specific accounts after user authorization.';
