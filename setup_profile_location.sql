-- Run this in your Supabase SQL Editor to enable Real-Time City profiles!

-- 1. Add Location String column to the users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location_city TEXT DEFAULT 'Earth';

-- RLS policies were already handled in `setup_radar.sql`, so logged in users
-- should already have UPDATE permissions to their own rows!
