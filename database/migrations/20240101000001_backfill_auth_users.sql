-- Backfill existing auth.users into public.users for admin panel visibility
INSERT INTO public.users (id, email, full_name, school_name, phone, role, created_at)
SELECT 
  id,
  email,
  COALESCE((raw_user_meta_data->>'full_name')::TEXT, ''),
  COALESCE((raw_user_meta_data->>'school_name')::TEXT, ''),
  COALESCE((raw_user_meta_data->>'phone')::TEXT, ''),
  'user',
  NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Assign default 'user' role in user_roles mapping if not already assigned
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u
CROSS JOIN (SELECT id FROM public.roles WHERE name = 'user') r
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id
);