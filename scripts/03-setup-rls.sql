-- Row Level Security (RLS) 설정
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 공간 정보는 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view spaces" ON spaces FOR SELECT USING (true);

-- 예약은 본인 것만 조회/생성/수정 가능
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON reservations FOR UPDATE USING (auth.uid() = user_id);

-- 커뮤니티 그룹은 모든 사용자가 읽기 가능, 생성자만 수정 가능
CREATE POLICY "Anyone can view active groups" ON community_groups FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create groups" ON community_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update groups" ON community_groups FOR UPDATE USING (auth.uid() = creator_id);

-- 그룹 멤버는 해당 그룹 멤버만 조회 가능
CREATE POLICY "Group members can view group membership" ON group_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid()
  )
);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- 메시지는 발신자와 수신자만 조회 가능
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received messages" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- 공간 사진은 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can view space photos" ON space_photos FOR SELECT USING (true);

-- 사용자 프로필은 본인 것만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
