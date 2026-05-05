-- Insert initial templates
INSERT INTO templates (name, slug, description, category, required_platforms, metrics_included, is_featured, sort_order) VALUES
('Instagram Performance', 'instagram-performance', 'Track your Instagram profile metrics, follower growth, engagement rate, and top-performing posts.', 'social-media', ARRAY['instagram'], ARRAY['followers', 'engagement_rate', 'reach', 'impressions', 'profile_views'], true, 1),

('Facebook Analytics', 'facebook-analytics', 'Monitor your Facebook page performance with insights on reach, engagement, and audience demographics.', 'social-media', ARRAY['facebook'], ARRAY['page_likes', 'post_reach', 'engagement', 'page_views'], true, 2),

('TikTok Insights', 'tiktok-insights', 'Analyze your TikTok account with metrics on views, likes, shares, comments, and follower growth.', 'social-media', ARRAY['tiktok'], ARRAY['video_views', 'likes', 'shares', 'comments', 'followers'], true, 3),

('Social Media Overview', 'social-media-overview', 'Combined dashboard showing performance across Instagram, Facebook, and TikTok in one view.', 'social-media', ARRAY['instagram', 'facebook', 'tiktok'], ARRAY['followers', 'engagement', 'reach', 'impressions'], true, 4),

('Paid Ads Performance', 'paid-ads-performance', 'Track your paid advertising campaigns across platforms with spend, ROAS, and conversion metrics.', 'ppc', ARRAY['facebook', 'instagram'], ARRAY['ad_spend', 'impressions', 'clicks', 'conversions', 'roas'], false, 5);
