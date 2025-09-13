-- Populate profiles for existing users
insert into public.profiles (id, display_name, email)
select 
  id,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)) as display_name,
  email
from auth.users
on conflict (id) do nothing;
