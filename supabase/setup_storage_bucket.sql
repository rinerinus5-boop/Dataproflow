-- Step 1: Create a public bucket for template images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'template-images', 
  'template-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);

-- Step 2: Set up storage policies for public read access
CREATE POLICY "Public can view template images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'template-images' );

-- Step 3: Allow authenticated users to upload template images
CREATE POLICY "Authenticated users can upload template images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'template-images' );

-- Step 4: Allow authenticated users to update template images
CREATE POLICY "Authenticated users can update template images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'template-images' );

-- Step 5: Allow authenticated users to delete template images
CREATE POLICY "Authenticated users can delete template images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'template-images' );
