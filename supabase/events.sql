-- Create events table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    rubric JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Create scores table
CREATE TABLE public.scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    judge_name TEXT NOT NULL,
    rubric_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, school_id, judge_name) -- A judge can only score a school once per event
);

-- RLS Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to events" ON public.events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read access to scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert to scores" ON public.scores FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_scores_event_id ON public.scores(event_id);
CREATE INDEX idx_scores_school_id ON public.scores(school_id);
