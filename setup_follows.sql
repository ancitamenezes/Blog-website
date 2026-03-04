-- Setup Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id) -- A user can only follow another user once
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
    -- Anyone can read who follows who
    BEGIN
        CREATE POLICY "Follows are viewable by everyone" 
        ON public.follows FOR SELECT 
        USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated users can follow others (insert as follower_id)
    BEGIN
        CREATE POLICY "Users can follow others" 
        ON public.follows FOR INSERT 
        WITH CHECK (auth.uid() = follower_id);
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated users can unfollow others (delete where follower_id)
    BEGIN
        CREATE POLICY "Users can unfollow others" 
        ON public.follows FOR DELETE 
        USING (auth.uid() = follower_id);
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
