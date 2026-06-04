-- Add team_id to event_enrollments to group students
ALTER TABLE public.event_enrollments ADD COLUMN team_id TEXT;

-- Create an index for querying by team_id
CREATE INDEX idx_event_enrollments_team_id ON public.event_enrollments(team_id);
