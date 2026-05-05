# Template Images Setup Guide

## Overview

The template system now supports thumbnail and preview images to display actual Looker Studio template screenshots instead of placeholder gradients.

## Database Fields

Each template has two image-related fields:

1. **`thumbnail_url`** (TEXT) - Main thumbnail image displayed on template cards
2. **`preview_images`** (TEXT[]) - Array of preview images shown in the template modal gallery

## How to Add Template Images

### Step 1: Take Screenshots of Your Looker Studio Templates

For each template, you need to capture screenshots:

1. **Open your Looker Studio template**
2. **Take screenshots** of different sections/views:
   - Main dashboard view (for thumbnail)
   - Overview section
   - Detailed metrics section
   - Charts and visualizations section
   
3. **Recommended image specifications:**
   - **Thumbnail**: 800x600px (4:3 ratio)
   - **Preview images**: 1200x800px or higher
   - Format: PNG or JPG
   - Optimize for web (compress to reduce file size)

### Step 2: Upload Images to Storage

You have several options for hosting images:

#### Option A: Supabase Storage (Recommended)
```sql
-- Create a public bucket for template images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('template-images', 'template-images', true);
```

Then upload via Supabase Dashboard or API.

#### Option B: External CDN
- Cloudinary
- AWS S3
- Google Cloud Storage
- Imgur (for testing)

#### Option C: Public folder (Development only)
Place images in `/public/templates/` folder and reference as `/templates/image.png`

### Step 3: Update Database with Image URLs

Use the provided SQL script `supabase/update_template_images.sql`:

```sql
-- Example for Instagram template
UPDATE templates 
SET 
  thumbnail_url = 'https://your-cdn.com/instagram-thumb.png',
  preview_images = ARRAY[
    'https://your-cdn.com/instagram-preview-1.png',
    'https://your-cdn.com/instagram-preview-2.png',
    'https://your-cdn.com/instagram-preview-3.png'
  ]
WHERE slug = 'instagram-performance';
```

### Step 4: Verify Images Display Correctly

1. Navigate to `/dashboard/templates`
2. Check that thumbnail images appear on template cards
3. Click "Use Template" to open modal
4. Verify preview gallery shows multiple images
5. Test image navigation (if multiple previews)

## Image Best Practices

### For Thumbnails
- Show the most important/attractive part of the dashboard
- Ensure text is readable
- Use consistent aspect ratio across all templates
- Optimize file size (aim for < 200KB)

### For Preview Images
- Show different sections of the template
- Include 2-4 preview images per template
- Highlight key metrics and visualizations
- Show variety (charts, tables, scorecards)

## Porter Metrics Style Implementation

Like Porter Metrics, your templates now feature:

✅ **Template Cards** - Display thumbnail images instead of placeholder gradients  
✅ **Image Gallery** - Multiple preview images in modal  
✅ **Image Navigation** - Click thumbnails to switch between previews  
✅ **Responsive Design** - Images adapt to different screen sizes  

## Example Image URLs Structure

```
/template-images/
  ├── instagram-performance/
  │   ├── thumbnail.png
  │   ├── preview-1.png
  │   ├── preview-2.png
  │   └── preview-3.png
  ├── facebook-analytics/
  │   ├── thumbnail.png
  │   ├── preview-1.png
  │   └── preview-2.png
  └── tiktok-insights/
      ├── thumbnail.png
      ├── preview-1.png
      └── preview-2.png
```

## Quick Test with Placeholder Images

For testing purposes, you can use placeholder image services:

```sql
UPDATE templates 
SET 
  thumbnail_url = 'https://via.placeholder.com/800x600/6366f1/ffffff?text=Instagram+Template',
  preview_images = ARRAY[
    'https://via.placeholder.com/1200x800/6366f1/ffffff?text=Preview+1',
    'https://via.placeholder.com/1200x800/6366f1/ffffff?text=Preview+2'
  ]
WHERE slug = 'instagram-performance';
```

## Troubleshooting

### Images not showing?
- Check image URLs are accessible (test in browser)
- Verify CORS settings if using external CDN
- Check browser console for errors
- Ensure URLs are HTTPS (not HTTP)

### Images too large/slow?
- Compress images using tools like TinyPNG
- Use WebP format for better compression
- Consider using a CDN with automatic optimization
- Lazy load images (already implemented)

### Gallery not working?
- Ensure `preview_images` is an array with at least 1 image
- Check that array syntax is correct in SQL
- Verify image URLs in array are valid

## Next Steps

1. ✅ Take screenshots of your Looker Studio templates
2. ✅ Upload images to your preferred storage
3. ✅ Run the SQL update script with your image URLs
4. ✅ Test the templates page to verify images display correctly
5. ✅ Share with users!
