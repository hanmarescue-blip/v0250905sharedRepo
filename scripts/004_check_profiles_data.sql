-- Check if profiles table has any data
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as profiles_with_names,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as profiles_with_emails
FROM profiles;

-- Show sample profiles data
SELECT id, display_name, email, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check auth.users table to see if there are users to migrate
SELECT 
  COUNT(*) as total_auth_users,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as users_with_emails
FROM auth.users;

-- Show sample auth users
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
