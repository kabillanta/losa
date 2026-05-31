-- Create schools table
CREATE TABLE public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_name TEXT,
    qr_code_id TEXT UNIQUE NOT NULL
);

-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT false
);

-- Allow public access for this event (No Login Required)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public update access to students" ON public.students FOR UPDATE USING (true);

-- Indexes for fast lookups
CREATE INDEX idx_schools_qr_code_id ON public.schools(qr_code_id);
CREATE INDEX idx_students_school_id ON public.students(school_id);
