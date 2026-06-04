-- 1. Drop existing RLS policies that rely on Supabase Auth
DROP POLICY IF EXISTS "Schools can view own data" ON public.schools;
DROP POLICY IF EXISTS "Schools can update own data" ON public.schools;
DROP POLICY IF EXISTS "Schools can insert own data" ON public.schools;

-- 2. Alter the schools table to use firebase_uid instead of auth_id
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_auth_id_fkey;
ALTER TABLE public.schools DROP COLUMN IF EXISTS auth_id;

-- Add new firebase_uid column
ALTER TABLE public.schools ADD COLUMN firebase_uid TEXT UNIQUE;

-- Create an index for fast lookups
CREATE INDEX idx_schools_firebase_uid ON public.schools(firebase_uid);

-- 3. Update RLS (Optional, but since we are using Firebase from Server Actions, we can just disable RLS or allow public access if operations are fully trusted on the server)
-- For simplicity, since the server handles all edits based on the cookie:
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
