-- Create event_enrollments table to track which student is in which event
CREATE TABLE public.event_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_slug TEXT NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_slug, student_id) -- A student can only be enrolled in a specific event once
);

-- RLS Policies
ALTER TABLE public.event_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to enrollments" ON public.event_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow public insert to enrollments" ON public.event_enrollments FOR INSERT WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX idx_enrollments_event_slug ON public.event_enrollments(event_slug);
CREATE INDEX idx_enrollments_student_id ON public.event_enrollments(student_id);
