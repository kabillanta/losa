-- Run this in your Supabase SQL Editor to temporarily allow inserts for seeding.
-- You can remove these policies after seeding.

CREATE POLICY "Allow public insert to schools" ON public.schools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to students" ON public.students FOR INSERT WITH CHECK (true);
