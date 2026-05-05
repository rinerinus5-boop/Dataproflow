# How to Upload Template Images to Supabase Storage

## Step 1: Create Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a public bucket for template images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('template-images', 'template-images', true);

-- Set up storage policies to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'template-images' );

CREATE POLICY "Authenticated users can upload template images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'template-images' AND auth.role() = 'authenticated' );
```

## Step 2: Upload Images via Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click on the **template-images** bucket
5. Create folders for each template:
   - `instagram-performance/`
   - `facebook-analytics/`
   - `tiktok-insights/`
   - `social-media-overview/`
   - `paid-ads-performance/`

6. Upload images to each folder:
   - `thumbnail.png` - Main card image
   - `preview-1.png` - First preview image
   - `preview-2.png` - Second preview image
   - `preview-3.png` - Third preview image (optional)

## Step 3: Get Public URLs

After uploading, get the public URL for each image:

Format: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/[folder]/[filename]`

Example:
```
https://abcdefgh.supabase.co/storage/v1/object/public/template-images/instagram-performance/thumbnail.png
```

## Step 4: Update Database with Image URLs

Run this SQL with your actual Supabase URLs:

```sql
-- Instagram Performance
UPDATE templates 
SET 
  thumbnail_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/thumbnail.png',
  preview_images = ARRAY[
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-1.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-2.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-3.png'
  ]
WHERE slug = 'instagram-performance';

-- Facebook Analytics
UPDATE templates 
SET 
  thumbnail_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/thumbnail.png',
  preview_images = ARRAY[
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/preview-1.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/preview-2.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/preview-3.png'
  ]
WHERE slug = 'facebook-analytics';

-- TikTok Insights
UPDATE templates 
SET 
  thumbnail_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/thumbnail.png',
  preview_images = ARRAY[
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/preview-1.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/preview-2.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/preview-3.png'
  ]
WHERE slug = 'tiktok-insights';

-- Social Media Overview
UPDATE templates 
SET 
  thumbnail_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/thumbnail.png',
  preview_images = ARRAY[
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/preview-1.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/preview-2.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/preview-3.png'
  ]
WHERE slug = 'social-media-overview';

-- Paid Ads Performance
UPDATE templates 
SET 
  thumbnail_url = 'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/thumbnail.png',
  preview_images = ARRAY[
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/preview-1.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/preview-2.png',
    'https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/preview-3.png'
  ]
WHERE slug = 'paid-ads-performance';
```

## Alternative: Upload via Supabase CLI

If you prefer command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Upload files
supabase storage upload template-images/instagram-performance/thumbnail.png ./path/to/instagram-thumb.png
supabase storage upload template-images/instagram-performance/preview-1.png ./path/to/instagram-preview-1.png
```

## Verify Images

After updating, verify by visiting:
- Your app: http://localhost:3000/dashboard/templates
- Direct URL: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/thumbnail.png`

Images should now display on your template cards!
