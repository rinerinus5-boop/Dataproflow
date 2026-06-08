-- Create table for tracking weekly report generation and sending
CREATE TABLE IF NOT EXISTS weekly_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, approved, sent, skipped
  summary TEXT,
  metrics JSONB DEFAULT '{}',
  sent_at TIMESTAMP,
  sent_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one report per user per week
  UNIQUE(user_id, week_of)
);

-- Index for fast lookups
CREATE INDEX idx_weekly_report_logs_user_id ON weekly_report_logs(user_id);
CREATE INDEX idx_weekly_report_logs_week_of ON weekly_report_logs(week_of);
CREATE INDEX idx_weekly_report_logs_status ON weekly_report_logs(status);

-- RLS policies
ALTER TABLE weekly_report_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own reports
CREATE POLICY "Users can view own weekly reports"
  ON weekly_report_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all reports (role = 'admin')
CREATE POLICY "Admins can view all weekly reports"
  ON weekly_report_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admins can update all reports (role = 'admin')
CREATE POLICY "Admins can update weekly reports"
  ON weekly_report_logs FOR ALL
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

CREATE TRIGGER update_weekly_report_logs_updated_at
  BEFORE UPDATE ON weekly_report_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
