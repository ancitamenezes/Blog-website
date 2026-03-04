-- Run this in your Supabase SQL Editor to allow users to create posts.

-- 1. Enable RLS on the posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Allow any authenticated user to insert a post
CREATE POLICY "Allow authenticated users to insert posts" 
ON public.posts 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Allow anyone to read posts
CREATE POLICY "Allow public read access on posts" 
ON public.posts 
FOR SELECT 
TO public 
USING (true);

-- 4. Make sure policies exist for users too
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to insert their own profile" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Allow public read access on profiles" 
ON public.users 
FOR SELECT 
TO public 
USING (true);
