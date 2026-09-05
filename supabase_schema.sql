-- ====================================================================
-- Viemo Video Hosting - Supabase Schema
-- ====================================================================

-- 1. Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    url TEXT NOT NULL,
    thumbnail TEXT DEFAULT '',
    duration REAL DEFAULT 0,
    quality_options JSONB DEFAULT '["1080p", "720p", "480p", "360p"]'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies:
-- Allow anyone to view videos
DROP POLICY IF EXISTS "Public can view all videos" ON public.videos;
CREATE POLICY "Public can view all videos" ON public.videos
    FOR SELECT USING (true);

-- Allow authenticated users and anonymous uploads
DROP POLICY IF EXISTS "Anyone can insert videos" ON public.videos;
CREATE POLICY "Anyone can insert videos" ON public.videos
    FOR INSERT WITH CHECK (true);

-- Allow video creator to update
DROP POLICY IF EXISTS "Users can update own videos" ON public.videos;
CREATE POLICY "Users can update own videos" ON public.videos
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow video creator to delete
DROP POLICY IF EXISTS "Users can delete own videos" ON public.videos;
CREATE POLICY "Users can delete own videos" ON public.videos
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Increment view count helper function
CREATE OR REPLACE FUNCTION increment_video_views(video_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.videos
    SET views = COALESCE(views, 0) + 1
    WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Setup Storage Bucket 'videos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public can view videos bucket" ON storage.objects;
CREATE POLICY "Public can view videos bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public can upload to videos bucket" ON storage.objects;
CREATE POLICY "Public can upload to videos bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'videos');

DROP POLICY IF EXISTS "Public can update objects in videos bucket" ON storage.objects;
CREATE POLICY "Public can update objects in videos bucket" ON storage.objects
    FOR UPDATE USING (bucket_id = 'videos');
