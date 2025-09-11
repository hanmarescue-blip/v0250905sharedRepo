-- Create storage bucket for board photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-photos', 'board-photos', true);

-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated users to upload photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'board-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to photos
CREATE POLICY "Allow public read access to photos" ON storage.objects
FOR SELECT USING (bucket_id = 'board-photos');

-- Allow users to update their own photos
CREATE POLICY "Allow users to update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'board-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Allow users to delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'board-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
