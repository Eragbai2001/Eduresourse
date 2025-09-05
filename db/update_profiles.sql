-- Update existing profiles with display names
UPDATE public.profiles
SET 
  display_name = COALESCE(display_name, split_part(email, '@', 1)),
  username = COALESCE(username, split_part(email, '@', 1)),
  updated_at = NOW()
WHERE email IS NOT NULL;

-- For any users that don't have profiles, create them
INSERT INTO public.profiles (user_id, email, username, display_name)
SELECT 
  id, 
  email,
  split_part(email, '@', 1),
  split_part(email, '@', 1)
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.profiles);
