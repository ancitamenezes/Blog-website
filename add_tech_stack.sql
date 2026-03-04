-- Run this in your Supabase SQL Editor to add the tech_stack column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';
