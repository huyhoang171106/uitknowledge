-- UIT Knowledge Supabase Schema
-- Create this in your Supabase SQL Editor

-- 1. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    is_featured BOOLEAN DEFAULT false
);

-- Enable RLS for videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.videos FOR ALL USING (auth.role() = 'authenticated');

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    registration_link TEXT,
    image_class TEXT DEFAULT 'pastel-1',
    category TEXT,
    is_hot BOOLEAN DEFAULT false,
    payment_qr_url TEXT
);

-- Enable RLS for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.courses FOR ALL USING (auth.role() = 'authenticated');

-- 3. MERCH TABLE
CREATE TABLE IF NOT EXISTS public.merch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,
    image_url TEXT,
    payment_qr_url TEXT,
    placeholder_class TEXT DEFAULT 'merch-shirt'
);

-- Enable RLS for merch
ALTER TABLE public.merch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON public.merch FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.merch FOR ALL USING (auth.role() = 'authenticated');

-- 4. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('merch', 'merch', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policies for storage
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id IN ('courses', 'merch'));
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
-- 5. COURSE REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.course_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    student_id_email TEXT NOT NULL,
    has_teams_email TEXT NOT NULL,
    teams_email TEXT NOT NULL,
    courses TEXT[] NOT NULL,
    goal TEXT NOT NULL,
    difficulties TEXT,
    weekend_available TEXT NOT NULL,
    time_slots TEXT[] NOT NULL
);

-- Enable RLS for course_registrations
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert Access" ON public.course_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Access" ON public.course_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON public.course_registrations FOR ALL USING (auth.role() = 'authenticated');

-- 6. VIDEO REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.video_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    has_teams_email TEXT NOT NULL,
    teams_email TEXT NOT NULL,
    courses TEXT[] NOT NULL,
    total_price TEXT
);

-- Enable RLS for video_registrations
ALTER TABLE public.video_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Insert Access" ON public.video_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Access" ON public.video_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Access" ON public.video_registrations FOR ALL USING (auth.role() = 'authenticated');
