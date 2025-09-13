-- Create user_info table to replace profiles table
CREATE TABLE IF NOT EXISTS user_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own user_info" ON user_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_info" ON user_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_info" ON user_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);
