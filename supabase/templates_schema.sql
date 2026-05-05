-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  thumbnail_url TEXT,
  preview_images TEXT[],
  required_platforms TEXT[] NOT NULL,
  metrics_included TEXT[],
  looker_studio_template_id VARCHAR(255),
  looker_studio_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User templates tracking
CREATE TABLE IF NOT EXISTS user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  looker_studio_report_url TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for templates (public read)
CREATE POLICY "Anyone can view active templates"
  ON templates FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_templates
CREATE POLICY "Users can view own templates"
  ON user_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON user_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON user_templates FOR UPDATE
  USING (auth.uid() = user_id);
