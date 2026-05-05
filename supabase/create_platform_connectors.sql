-- Create table for global platform connector IDs
-- These are YOUR Google Apps Script connectors that ALL users will use

CREATE TABLE IF NOT EXISTS platform_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  connector_id VARCHAR(255) NOT NULL,
  connector_name VARCHAR(255),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your connector IDs (replace with your actual connector IDs)
INSERT INTO platform_connectors (platform, connector_id, connector_name, description) VALUES
(
  'instagram', 
  'YOUR_INSTAGRAM_CONNECTOR_ID_HERE',
  'Instagram Insights Connector',
  'Community connector for Instagram business account insights'
),
(
  'facebook', 
  'YOUR_FACEBOOK_CONNECTOR_ID_HERE',
  'Facebook Pages Connector',
  'Community connector for Facebook page analytics'
),
(
  'tiktok', 
  'YOUR_TIKTOK_CONNECTOR_ID_HERE',
  'TikTok Analytics Connector',
  'Community connector for TikTok business account analytics'
)
ON CONFLICT (platform) DO UPDATE SET
  connector_id = EXCLUDED.connector_id,
  connector_name = EXCLUDED.connector_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Example: How to update a connector ID later
-- UPDATE platform_connectors 
-- SET connector_id = 'AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXX'
-- WHERE platform = 'instagram';
