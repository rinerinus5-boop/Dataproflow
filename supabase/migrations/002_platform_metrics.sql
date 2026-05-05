-- Platform metrics table for storing analytics data from connected accounts
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  metric_date DATE NOT NULL,
  
  -- Common metrics across platforms
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  
  -- Calculated metrics
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Platform-specific data stored as JSON
  platform_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate entries for same account/date
  UNIQUE(connected_account_id, metric_date)
);

-- Posts/Content table for individual post analytics
CREATE TABLE IF NOT EXISTS platform_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  
  -- Post identification
  platform_post_id TEXT NOT NULL,
  post_type TEXT, -- 'image', 'video', 'carousel', 'reel', 'story', etc.
  
  -- Post content
  caption TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  
  -- Post metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Timestamps
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Platform-specific data
  platform_data JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(connected_account_id, platform_post_id)
);

-- Audience demographics table
CREATE TABLE IF NOT EXISTS audience_demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok')),
  recorded_at DATE NOT NULL,
  
  -- Age demographics (stored as JSON: {"18-24": 25, "25-34": 40, ...})
  age_distribution JSONB DEFAULT '{}'::jsonb,
  
  -- Gender demographics (stored as JSON: {"male": 45, "female": 52, "other": 3})
  gender_distribution JSONB DEFAULT '{}'::jsonb,
  
  -- Location demographics (stored as JSON: {"US": 40, "UK": 15, ...})
  country_distribution JSONB DEFAULT '{}'::jsonb,
  city_distribution JSONB DEFAULT '{}'::jsonb,
  
  -- Active times (stored as JSON: {"monday": [9, 12, 18], ...})
  active_hours JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(connected_account_id, recorded_at)
);

-- Sync logs table to track data fetching
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connected_account_id UUID NOT NULL REFERENCES connected_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'metrics', 'posts', 'demographics', 'full'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  records_synced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_metrics_account ON platform_metrics(connected_account_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_user ON platform_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_date ON platform_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_platform ON platform_metrics(platform);

CREATE INDEX IF NOT EXISTS idx_platform_posts_account ON platform_posts(connected_account_id);
CREATE INDEX IF NOT EXISTS idx_platform_posts_user ON platform_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_posts_posted ON platform_posts(posted_at);

CREATE INDEX IF NOT EXISTS idx_audience_demographics_account ON audience_demographics(connected_account_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_account ON sync_logs(connected_account_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_platform_metrics_updated_at ON platform_metrics;
CREATE TRIGGER update_platform_metrics_updated_at
  BEFORE UPDATE ON platform_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_posts_updated_at ON platform_posts;
CREATE TRIGGER update_platform_posts_updated_at
  BEFORE UPDATE ON platform_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audience_demographics_updated_at ON audience_demographics;
CREATE TRIGGER update_audience_demographics_updated_at
  BEFORE UPDATE ON audience_demographics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own metrics
CREATE POLICY "Users can view own metrics" ON platform_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own posts" ON platform_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own demographics" ON audience_demographics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync logs" ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all data (for background sync jobs)
CREATE POLICY "Service can manage metrics" ON platform_metrics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage posts" ON platform_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage demographics" ON audience_demographics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage sync logs" ON sync_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Admins can view all data
CREATE POLICY "Admins can view all metrics" ON platform_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view all posts" ON platform_posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view all demographics" ON audience_demographics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
