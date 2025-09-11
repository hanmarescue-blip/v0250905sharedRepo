-- Create all necessary tables for the shared space rental application

-- Users table (handled by Supabase Auth)
-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INTEGER NOT NULL,
    price_per_hour INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Space photos table
CREATE TABLE IF NOT EXISTS space_photos (
    id SERIAL PRIMARY KEY,
    space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community groups table
CREATE TABLE IF NOT EXISTS community_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial space data
INSERT INTO spaces (name, location, capacity, price_per_hour, description) VALUES
('염리점', '서울 마포구 마포대로 115-12 공덕상성아파트 상가 3층 319-1호', 8, 9000, '깔끔하고 현대적인 회의실로 65인치 TV가 구비되어 있습니다. 무료 WiFi 이용 가능합니다.'),
('공덕점', '서울 마포구 공덕동 371', 6, 9000, '프로젝터와 화이트보드가 구비된 소규모 회의실입니다. 무료 WiFi 이용 가능합니다.');

-- Insert space photos
INSERT INTO space_photos (space_id, url, description, display_order) VALUES
-- 염리점 사진들
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%86%E1%85%A1%E1%84%91%E1%85%A9%E1%84%80%E1%85%AE%20%E1%84%92%E1%85%AC%E1%84%8B%E1%85%B4%E1%84%89%E1%85%B5%E1%86%AF.jpg-qKzfxfjGZQD0EsV4qvr8yN4rAJTNkW.jpeg', '염리점 회의실 전경', 1),
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%83%E1%85%A9%E1%86%BC%20%E1%84%92%E1%85%AC%E1%84%8B%E1%85%B4%E1%84%89%E1%85%B5%E1%86%AF.jpg-vLWYJcoVGYnmByDWgYuEIcIlsLWRGl.jpeg', '염리점 회의실 측면', 2),
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%20%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7.jpg-tRUIttw6nWPaqEiognFYo5TAiMqLIQ.jpeg', '염리점 회의실 TV 설치 모습', 3),
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%20%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%AE.jpg-xKg39UKmwvdIuqbgFMECHauYTRQs1P.jpeg', '염리점 건물 입구', 4),
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8B%E1%85%A7%E1%86%B7%E1%84%85%E1%85%B5%E1%84%8C%E1%85%A5%E1%86%B7%20%E1%84%87%E1%85%A9%E1%86%A8%E1%84%83%E1%85%A9.jpg-zNZUesidMxKbPD7QLIOcsLmDmg9YqN.jpeg', '염리점 복도', 5),
(1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%B2%E1%84%80%E1%85%A9%E1%86%BC%E1%84%80%E1%85%A1%E1%86%AB%202%E1%84%8E%E1%85%B3%E1%86%BC.jpg-cjk4b29B8vD5E0SNOeQnbJTx79iGmm.jpeg', '염리점 안내판', 6),
-- 공덕점 사진들
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4162.jpg-IzRa2cl0lJwS4QktMTFWCTBIV8vfzF.jpeg', '공덕점 회의실 프레젠테이션 중', 1),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4163.jpg-IsJ0nJ1hWoeSpUm6e9t0kYSZM1fwCj.jpeg', '공덕점 회의실 전경', 2),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4160.jpg-E9QNWHmO2nwRyTFVprUwGl7ZLYYxr0.jpeg', '공덕점 3D 모델 프레젠테이션', 3),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4165.jpg-PtysuqnTC8jnvBpSvxfkWgte0OjQ1n.jpeg', '공덕점 회의실 테이블 배치', 4),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4124.jpg-4cKRmSNg4qzmMyPi2WesZtBlTeiSP9.jpeg', '공덕점 복도 및 입구', 5),
(2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4161.jpg-mJU4noGXaRCNyjoPMZL0shYz3jEHqA.jpeg', '공덕점 사용 스크립트 안내', 6);

-- Enable Row Level Security
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to spaces and photos
CREATE POLICY "Public can view spaces" ON spaces FOR SELECT USING (true);
CREATE POLICY "Public can view space photos" ON space_photos FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can create groups" ON community_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can view groups" ON community_groups FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view memberships" ON group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
