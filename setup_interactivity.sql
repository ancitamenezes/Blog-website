-- Run this in your Supabase SQL Editor to add interactivity tables!

-- 1. Create Likes Table (Using IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id) -- A user can only like a post once
);

-- 2. Create Bookmarks Table (Using IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, post_id) -- A user can only bookmark a post once
);

-- 3. Create Comments Table (Using IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on all explicit tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Likes (Drop existing ones to avoid conflicts or just ignore errors if you run it again)
DO $$ 
BEGIN 
    BEGIN CREATE POLICY "Anyone can read likes" ON public.likes FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- 6. Policies for Bookmarks
DO $$ 
BEGIN 
    BEGIN CREATE POLICY "Users can read own bookmarks" ON public.bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
END $$;

-- 7. Policies for Comments
DO $$ 
BEGIN 
    BEGIN CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
    BEGIN CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
