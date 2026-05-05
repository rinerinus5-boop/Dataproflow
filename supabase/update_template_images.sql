-- Update template thumbnails and preview images
-- Replace these URLs with your actual Looker Studio template screenshot URLs

-- Instagram Performance Template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-storage-url.com/templates/instagram-performance-thumb.png',
  preview_images = ARRAY[
    'https://your-storage-url.com/templates/instagram-performance-1.png',
    'https://your-storage-url.com/templates/instagram-performance-2.png',
    'https://your-storage-url.com/templates/instagram-performance-3.png'
  ]
WHERE slug = 'instagram-performance';

-- Facebook Analytics Template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-storage-url.com/templates/facebook-analytics-thumb.png',
  preview_images = ARRAY[
    'https://your-storage-url.com/templates/facebook-analytics-1.png',
    'https://your-storage-url.com/templates/facebook-analytics-2.png',
    'https://your-storage-url.com/templates/facebook-analytics-3.png'
  ]
WHERE slug = 'facebook-analytics';

-- TikTok Insights Template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-storage-url.com/templates/tiktok-insights-thumb.png',
  preview_images = ARRAY[
    'https://your-storage-url.com/templates/tiktok-insights-1.png',
    'https://your-storage-url.com/templates/tiktok-insights-2.png',
    'https://your-storage-url.com/templates/tiktok-insights-3.png'
  ]
WHERE slug = 'tiktok-insights';

-- Social Media Overview Template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-storage-url.com/templates/social-media-overview-thumb.png',
  preview_images = ARRAY[
    'https://your-storage-url.com/templates/social-media-overview-1.png',
    'https://your-storage-url.com/templates/social-media-overview-2.png',
    'https://your-storage-url.com/templates/social-media-overview-3.png'
  ]
WHERE slug = 'social-media-overview';

-- Paid Ads Performance Template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-storage-url.com/templates/paid-ads-performance-thumb.png',
  preview_images = ARRAY[
    'https://your-storage-url.com/templates/paid-ads-performance-1.png',
    'https://your-storage-url.com/templates/paid-ads-performance-2.png',
    'https://your-storage-url.com/templates/paid-ads-performance-3.png'
  ]
WHERE slug = 'paid-ads-performance';

-- Verify the updates
SELECT slug, thumbnail_url, preview_images FROM templates ORDER BY sort_order;
