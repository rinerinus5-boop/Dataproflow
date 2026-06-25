-- Fix RLS for pending_connections to allow INSERT by authenticated users

-- Drop existing policies to recreate correctly
DROP POLICY IF EXISTS "Users can view own pending connections" ON pending_connections;
DROP POLICY IF EXISTS "Users can insert own pending connections" ON pending_connections;
DROP POLICY IF EXISTS "Users can delete own pending connections" ON pending_connections;

-- Enable RLS
ALTER TABLE pending_connections ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT only their own pending connections
CREATE POLICY "Users can view own pending connections"
    ON pending_connections
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Allow users to INSERT their own pending connections
CREATE POLICY "Users can insert own pending connections"
    ON pending_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Allow users to DELETE their own pending connections
CREATE POLICY "Users can delete own pending connections"
    ON pending_connections
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Also allow service role to bypass RLS for cleanup
CREATE POLICY "Service role full access"
    ON pending_connections
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
