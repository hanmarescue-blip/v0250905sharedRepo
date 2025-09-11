-- Create comprehensive photo storage system with proper database design

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('board-photos', 'board-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create photos table to store photo metadata
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_post_photos junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.board_post_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_post_id INTEGER NOT NULL REFERENCES public.board_posts(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_post_id, photo_id)
);

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for photos table
CREATE POLICY "Users can view all photos" ON public.photos
  FOR SELECT USING (true);

CREATE POLICY "Users can upload their own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own photos" ON public.photos
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own photos" ON public.photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Enable RLS on board_post_photos table
ALTER TABLE public.board_post_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for board_post_photos table
CREATE POLICY "Users can view all board post photos" ON public.board_post_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can link photos to their own posts" ON public.board_post_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.board_posts 
      WHERE id = board_post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own post photo links" ON public.board_post_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.board_posts 
      WHERE id = board_post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own post photo links" ON public.board_post_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.board_posts 
      WHERE id = board_post_id AND author_id = auth.uid()
    )
  );

-- Storage policies for board-photos bucket
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'board-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'board-photos');

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'board-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'board-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_post_photos_post_id ON public.board_post_photos(board_post_id);
CREATE INDEX IF NOT EXISTS idx_board_post_photos_photo_id ON public.board_post_photos(photo_id);
CREATE INDEX IF NOT EXISTS idx_board_post_photos_display_order ON public.board_post_photos(board_post_id, display_order);

-- Create updated_at trigger for photos table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at 
  BEFORE UPDATE ON public.photos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
