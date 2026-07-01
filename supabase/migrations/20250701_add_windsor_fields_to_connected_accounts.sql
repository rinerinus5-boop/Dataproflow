-- Add Windsor-specific fields to connected_accounts and relax constraints

-- Add windsor_account_id column if it doesn't exist
ALTER TABLE connected_accounts
  ADD COLUMN IF NOT EXISTS windsor_account_id TEXT,
  ADD COLUMN IF NOT EXISTS ds_id TEXT;

-- Make access_token and platform_user_id optional (Windsor doesn't use them)
ALTER TABLE connected_accounts
  ALTER COLUMN access_token DROP NOT NULL,
  ALTER COLUMN platform_user_id DROP NOT NULL;

-- Widen the platform CHECK to allow more platforms
ALTER TABLE connected_accounts
  DROP CONSTRAINT IF EXISTS connected_accounts_platform_check;

ALTER TABLE connected_accounts
  ADD CONSTRAINT connected_accounts_platform_check
  CHECK (platform IN (
    'instagram', 'facebook', 'tiktok',
    'facebook_organic', 'tiktok_organic', 'tiktok_ads',
    'google_ads', 'google_analytics', 'linkedin',
    'snapchat', 'pinterest', 'twitter', 'unknown'
  ));

-- Add index on windsor_account_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_connected_accounts_windsor_id
  ON connected_accounts(windsor_account_id);
