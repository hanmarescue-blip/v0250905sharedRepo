-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disbanded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table for tracking invitation status
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, invitee_id)
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "teams_select_all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_own" ON public.teams FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "teams_update_leader" ON public.teams FOR UPDATE USING (auth.uid() = leader_id);
CREATE POLICY "teams_delete_leader" ON public.teams FOR DELETE USING (auth.uid() = leader_id);

-- RLS Policies for team_members
CREATE POLICY "team_members_select_all" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_insert_leader" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "team_members_update_own" ON public.team_members FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "team_members_delete_leader" ON public.team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);

-- RLS Policies for team_invitations
CREATE POLICY "team_invitations_select_involved" ON public.team_invitations FOR SELECT USING (
  auth.uid() = inviter_id OR auth.uid() = invitee_id
);
CREATE POLICY "team_invitations_insert_leader" ON public.team_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);
CREATE POLICY "team_invitations_update_invitee" ON public.team_invitations FOR UPDATE USING (
  auth.uid() = invitee_id
);
CREATE POLICY "team_invitations_delete_leader" ON public.team_invitations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid())
);

-- Create function to automatically generate team names
CREATE OR REPLACE FUNCTION generate_team_name()
RETURNS TEXT AS $$
DECLARE
  team_count INTEGER;
  team_name TEXT;
BEGIN
  SELECT COUNT(*) INTO team_count FROM public.teams;
  team_name := CHR(65 + (team_count % 26)); -- A, B, C, etc.
  
  -- If we have more than 26 teams, add numbers: A1, B1, etc.
  IF team_count >= 26 THEN
    team_name := team_name || (team_count / 26)::TEXT;
  END IF;
  
  RETURN team_name;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate team names
CREATE OR REPLACE FUNCTION set_team_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS NULL OR NEW.name = '' THEN
    NEW.name := generate_team_name();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_team_name
  BEFORE INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION set_team_name();

-- Create function to update team status when all members confirm
CREATE OR REPLACE FUNCTION check_team_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_members INTEGER;
  confirmed_members INTEGER;
BEGIN
  -- Count total members and confirmed members for the team
  SELECT COUNT(*) INTO total_members 
  FROM public.team_members 
  WHERE team_id = NEW.team_id;
  
  SELECT COUNT(*) INTO confirmed_members 
  FROM public.team_members 
  WHERE team_id = NEW.team_id AND status = 'confirmed';
  
  -- If all 4 members have confirmed, activate the team
  IF total_members = 4 AND confirmed_members = 4 THEN
    UPDATE public.teams 
    SET status = 'active', updated_at = NOW() 
    WHERE id = NEW.team_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_team_completion
  AFTER UPDATE ON public.team_members
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION check_team_completion();
