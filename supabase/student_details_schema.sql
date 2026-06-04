-- Add new fields to students table
ALTER TABLE public.students ADD COLUMN class_details TEXT;
ALTER TABLE public.students ADD COLUMN admission_number TEXT;

-- Create an index to quickly find students by admission number within a school
CREATE INDEX idx_students_admission_number ON public.students(school_id, admission_number);
