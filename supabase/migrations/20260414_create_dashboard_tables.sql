-- Create user_inputs table for storing form responses
CREATE TABLE IF NOT EXISTS user_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  industry VARCHAR(255),
  business_size VARCHAR(100),
  monthly_revenue VARCHAR(100),
  marketing_channels JSONB DEFAULT '[]',
  main_goals JSONB DEFAULT '[]',
  current_challenges TEXT,
  answers JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dashboards table for tracking generated dashboards
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_id UUID REFERENCES user_inputs(id) ON DELETE CASCADE,
  looker_url TEXT,
  embed_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_inputs_user_id ON user_inputs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inputs_email ON user_inputs(email);
CREATE INDEX IF NOT EXISTS idx_user_inputs_status ON user_inputs(status);
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_input_id ON dashboards(input_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_status ON dashboards(status);

-- Enable RLS
ALTER TABLE user_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_inputs
CREATE POLICY "Users can view their own inputs" ON user_inputs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert inputs" ON user_inputs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own inputs" ON user_inputs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for dashboards
CREATE POLICY "Users can view their own dashboards" ON dashboards
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage dashboards" ON dashboards
  FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_inputs_updated_at ON user_inputs;
CREATE TRIGGER update_user_inputs_updated_at
  BEFORE UPDATE ON user_inputs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
