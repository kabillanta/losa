-- Alter schools table to add an auth_id linking to Supabase auth.users
ALTER TABLE public.schools 
ADD COLUMN auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_schools_auth_id ON public.schools(auth_id);

-- Update RLS Policies to allow schools to only see/edit their own data
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools can view own data" 
ON public.schools FOR SELECT 
USING (auth_id = auth.uid());

CREATE POLICY "Schools can update own data" 
ON public.schools FOR UPDATE 
USING (auth_id = auth.uid());

CREATE POLICY "Schools can insert own data" 
ON public.schools FOR INSERT 
WITH CHECK (auth_id = auth.uid());

-- Note: You might need to update other tables' RLS (like students) 
-- to check if the student's school_id belongs to the current user.
