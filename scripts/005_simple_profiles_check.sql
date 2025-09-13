-- 간단한 profiles 테이블 조회
SELECT 
    COUNT(*) as total_profiles,
    'profiles table row count' as description
FROM profiles;

-- profiles 테이블의 모든 데이터 조회 (최대 10개)
SELECT 
    id,
    email,
    display_name,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- auth.users 테이블 확인 (비교용)
SELECT 
    COUNT(*) as total_auth_users,
    'auth users count' as description
FROM auth.users;
