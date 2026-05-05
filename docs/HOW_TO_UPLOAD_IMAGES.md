# How to Upload Your Template Images - Step by Step

You mentioned you have all the images downloaded. Here's exactly how to upload them to Supabase and update your database.

## Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'template-images', 
  'template-images', 
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- Add public read policy
CREATE POLICY "Public can view template images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'template-images' );

-- Add authenticated upload policy
CREATE POLICY "Authenticated users can upload template images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'template-images' );
```

6. Click **Run** to execute

## Step 2: Upload Your Images via Supabase Dashboard

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. Click on the **template-images** bucket you just created
3. Create folders for organization (optional but recommended):
   - Click **New Folder** button
   - Create folders: `instagram-performance`, `facebook-analytics`, `tiktok-insights`, etc.

4. **Upload your images:**
   - Click **Upload Files** button
   - Select your downloaded template images
   - Upload them to the appropriate folders

**Naming convention (recommended):**
```
instagram-performance/
  ├── thumbnail.png          (main card image)
  ├── preview-1.png         (first gallery image)
  ├── preview-2.png         (second gallery image)
  └── preview-3.png         (third gallery image)

facebook-analytics/
  ├── thumbnail.png
  ├── preview-1.png
  └── preview-2.png

tiktok-insights/
  ├── thumbnail.png
  ├── preview-1.png
  └── preview-2.png
```

## Step 3: Get Image URLs

After uploading, you need to get the public URL for each image:

1. Click on any uploaded image in Supabase Storage
2. Click **Get URL** or **Copy URL**
3. The URL format will be:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/[folder]/[filename]
   ```

**Example:**
```
https://abcdefgh.supabase.co/storage/v1/object/public/template-images/instagram-performance/thumbnail.png
```

## Step 4: Update Database with Image URLs

1. Go back to **SQL Editor** in Supabase
2. Create a **New Query**
3. Copy and paste this SQL (replace with YOUR actual URLs):

```sql
-- Instagram Performance Template
UPDATE templates 
SET 
  thumbnail_url = 'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/thumbnail.png',
  preview_images = ARRAY[
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-1.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-2.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/instagram-performance/preview-3.png'
  ]
WHERE slug = 'instagram-performance';

-- Facebook Analytics Template
UPDATE templates 
SET 
  thumbnail_url = 'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/thumbnail.png',
  preview_images = ARRAY[
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/preview-1.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/facebook-analytics/preview-2.png'
  ]
WHERE slug = 'facebook-analytics';

-- TikTok Insights Template
UPDATE templates 
SET 
  thumbnail_url = 'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/thumbnail.png',
  preview_images = ARRAY[
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/preview-1.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/tiktok-insights/preview-2.png'
  ]
WHERE slug = 'tiktok-insights';

-- Social Media Overview Template
UPDATE templates 
SET 
  thumbnail_url = 'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/thumbnail.png',
  preview_images = ARRAY[
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/preview-1.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/social-media-overview/preview-2.png'
  ]
WHERE slug = 'social-media-overview';

-- Paid Ads Performance Template
UPDATE templates 
SET 
  thumbnail_url = 'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/thumbnail.png',
  preview_images = ARRAY[
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/preview-1.png',
    'https://[YOUR_PROJECT_REF].supabase.co/storage/v1/object/public/template-images/paid-ads-performance/preview-2.png'
  ]
WHERE slug = 'paid-ads-performance';

-- Verify the updates
SELECT slug, thumbnail_url, array_length(preview_images, 1) as preview_count 
FROM templates 
ORDER BY sort_order;
```

4. **Replace `[YOUR_PROJECT_REF]`** with your actual Supabase project reference
5. Click **Run** to execute

## Step 5: Verify Images Display

1. Go to your app: http://localhost:3000/dashboard/templates
2. Refresh the page
3. You should now see:
   - ✅ Actual template thumbnails on cards (not dummy gradients)
   - ✅ Platform icons in top-right corner
   - ✅ Category badge in top-left
   - ✅ Preview and Use buttons

4. Click on any template card to open the modal:
   - ✅ Large image preview on the left
   - ✅ Image gallery thumbnails below (if multiple images)
   - ✅ Template details on the right
   - ✅ Categories, metrics, and platform info
   - ✅ "Preview template" and "Use this template" buttons

## Quick Reference: Finding Your Project Reference

Your Supabase project reference is in your project URL:
```
https://[YOUR_PROJECT_REF].supabase.co
```

Example: If your URL is `https://abcdefgh.supabase.co`, then `abcdefgh` is your project reference.

## Alternative: Use Direct File Paths (for testing)

If you want to test quickly without uploading to Supabase:

1. Create folder: `c:\laragon\www\dataflow\public\templates\`
2. Copy your images there
3. Update database with local paths:

```sql
UPDATE templates 
SET 
  thumbnail_url = '/templates/instagram-thumb.png',
  preview_images = ARRAY['/templates/instagram-1.png', '/templates/instagram-2.png']
WHERE slug = 'instagram-performance';
```

This works for local development but you'll need Supabase Storage for production.

## Summary

1. ✅ Run `setup_storage_bucket.sql` to create bucket
2. ✅ Upload your images via Supabase Dashboard → Storage
3. ✅ Copy the public URLs for each image
4. ✅ Run UPDATE queries with your actual image URLs
5. ✅ Refresh your app to see the templates with real images!

The templates will now look professional like Porter Metrics with actual Looker Studio screenshots! 🎨
