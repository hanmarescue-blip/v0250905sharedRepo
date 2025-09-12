-- 팀 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  club_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀 멤버 테이블 생성
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 한 사용자는 같은 팀에 한 번만 가입 가능
  UNIQUE(team_id, user_id)
);

-- 팀미팅 테이블 생성
CREATE TABLE IF NOT EXISTS team_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  location VARCHAR(200),
  club_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_type VARCHAR(20) NOT NULL CHECK (meeting_type IN ('team_vs_team', 'team_vs_individuals')),
  team1_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team2_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀미팅 참가자 테이블 (개별 회원용)
CREATE TABLE IF NOT EXISTS team_meeting_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES team_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 한 사용자는 같은 미팅에 한 번만 참가 가능
  UNIQUE(meeting_id, user_id)
);

-- RLS 정책 설정
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meeting_participants ENABLE ROW LEVEL SECURITY;

-- 팀 정책
CREATE POLICY "Users can view teams in their clubs" ON teams FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = club_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create teams in their clubs" ON teams FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = club_id AND user_id = auth.uid()
  )
);

-- 팀 멤버 정책
CREATE POLICY "Users can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Users can join teams" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave teams" ON team_members FOR DELETE USING (auth.uid() = user_id);

-- 팀미팅 정책
CREATE POLICY "Users can view team meetings in their clubs" ON team_meetings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = club_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create team meetings in their clubs" ON team_meetings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = club_id AND user_id = auth.uid()
  )
);

-- 인덱스 생성
CREATE INDEX idx_teams_club_id ON teams(club_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_meetings_club_id ON team_meetings(club_id);
CREATE INDEX idx_team_meetings_date ON team_meetings(meeting_date);
