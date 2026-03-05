-- Run this in your Supabase SQL Editor to enable Real-Time Developer Radar mapping!

-- 1. Add Location and Visibility Columns to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_lat FLOAT,
ADD COLUMN IF NOT EXISTS last_lng FLOAT,
ADD COLUMN IF NOT EXISTS is_visible_on_map BOOLEAN DEFAULT true;

-- 2. Add Tech Stack Array if it doesn't already exist for profile data
-- (Assuming your users table might not have this specific format yet)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';

-- 3. Enhance RLS Policies for Map Data
-- Anyone can see users who have opted into being visible on the map
DO $$ 
BEGIN 
    BEGIN CREATE POLICY "Anyone can view visible map users" ON public.users FOR SELECT TO public USING (is_visible_on_map = true); EXCEPTION WHEN duplicate_object THEN null; END;
    
    -- Users can update their own location and visibility
    BEGIN CREATE POLICY "Users can update their own map presence" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- Note: To make the Activity Feed 100% real-time (commits/hackathons), we would
-- need to create entirely new tables for `radar_events` or `collaboration_requests`.
-- For now, getting the User markers real-time is the priority!
