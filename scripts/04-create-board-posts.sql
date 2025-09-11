-- Create board posts table for community board with photo upload functionality
CREATE TABLE IF NOT EXISTS public.board_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for board posts
CREATE POLICY "Allow users to view all board posts" ON public.board_posts FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own board posts" ON public.board_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Allow users to update their own board posts" ON public.board_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Allow users to delete their own board posts" ON public.board_posts FOR DELETE USING (auth.uid() = author_id);
