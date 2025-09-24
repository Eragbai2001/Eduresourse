-- Update existing profiles with display names
-- Update existing profiles using metadata from auth.users when available
UPDATE public.profiles p
SET
  display_name = COALESCE(p.display_name, u.raw_user_meta_data->> 'display_name', u.raw_user_meta_data->> 'full_name', split_part(u.email, '@', 1)),
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->> 'full_name'),
  avatar_url = COALESCE(p.avatar_url, u.raw_user_meta_data->> 'avatar_url'),
  username = COALESCE(p.username, split_part(u.email, '@', 1)),
  updated_at = NOW()
FROM auth.users u
WHERE p.user_id = u.id
  AND u.email IS NOT NULL;

-- For any users that don't have profiles, create them
-- Ensure a UUID generator is available (pgcrypto provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

BEGIN;

INSERT INTO public.profiles (id, user_id, email, username, display_name, full_name, avatar_url, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  u.email,
  split_part(u.email, '@', 1),
  COALESCE(u.raw_user_meta_data->> 'display_name', u.raw_user_meta_data->> 'full_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->> 'full_name',
  u.raw_user_meta_data->> 'avatar_url',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM public.profiles);

COMMIT;
