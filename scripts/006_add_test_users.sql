-- 테스트용 사용자들을 profiles 테이블에 추가
-- 실제 auth.users에 있는 사용자들과 매칭되지 않을 수 있지만 검색 테스트용으로 사용

-- 기존 데이터 확인
SELECT 'Current profiles count:' as info, COUNT(*) as count FROM profiles;

-- 테스트 사용자들 추가 (UUID는 임의로 생성)
INSERT INTO profiles (id, email, display_name, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'caber.han@example.com', 'caber han', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'cruise.h@example.com', 'cruise H', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'eunjung.kim@example.com', 'eunjung kim', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'hanmabong@example.com', 'hanmabong', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'john.doe@example.com', 'John Doe', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'jane.smith@example.com', 'Jane Smith', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- 결과 확인
SELECT 'After insert count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Sample profiles:' as info;
SELECT id, email, display_name FROM profiles LIMIT 10;
