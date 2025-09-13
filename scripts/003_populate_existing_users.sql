-- 기존 auth.users에서 profiles 테이블로 사용자 정보 복사
INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as display_name,
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
  updated_at = EXCLUDED.updated_at;

-- 결과 확인
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as profiles_with_display_name
FROM public.profiles;
