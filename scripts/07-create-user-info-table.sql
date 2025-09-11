-- Create user_info table based on the provided structure
CREATE TABLE IF NOT EXISTS public.user_info (
    id BIGSERIAL PRIMARY KEY,
    user_login VARCHAR(60) NOT NULL UNIQUE,
    user_pass VARCHAR(255) NOT NULL,
    user_nicename VARCHAR(50) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    user_url VARCHAR(100) DEFAULT '',
    user_registered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_activation_key VARCHAR(255) DEFAULT '',
    user_status INTEGER DEFAULT 0,
    display_name VARCHAR(250) NOT NULL,
    -- Link to Supabase auth.users table
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_info_login ON public.user_info(user_login);
CREATE INDEX IF NOT EXISTS idx_user_info_email ON public.user_info(user_email);
CREATE INDEX IF NOT EXISTS idx_user_info_auth_user_id ON public.user_info(auth_user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own user info
CREATE POLICY "Users can view own user info" ON public.user_info
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can update their own user info
CREATE POLICY "Users can update own user info" ON public.user_info
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can insert their own user info
CREATE POLICY "Users can insert own user info" ON public.user_info
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_info_updated_at 
    BEFORE UPDATE ON public.user_info 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to sync user data from auth.users to user_info
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_info (
        auth_user_id,
        user_login,
        user_pass,
        user_nicename,
        user_email,
        display_name,
        user_registered
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        '', -- Password is handled by Supabase auth
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.created_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user_info when new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_info TO authenticated;
GRANT USAGE ON SEQUENCE user_info_id_seq TO authenticated;
