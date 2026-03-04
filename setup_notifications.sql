-- ==========================================
-- BLOQ Space - Setup Notifications Table & Triggers
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- The user receiving the notification
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- The user performing the action
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE, -- Optional: The related post
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')), -- The type of notification
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies
-- Users can read their own notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);


-- ==========================================
-- 3. Create Automation Triggers (Functions)
-- ==========================================

-- Function for New Likes
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the author of the post
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    
    -- Insert notification ONLY if the liker is not the author
    IF NEW.user_id != post_author_id THEN
        INSERT INTO public.notifications (user_id, actor_id, post_id, type)
        VALUES (post_author_id, NEW.user_id, NEW.post_id, 'like');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Likes
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
CREATE TRIGGER on_like_created
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();


-- Function for New Comments
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
BEGIN
    -- Get the author of the post
    SELECT user_id INTO post_author_id FROM public.posts WHERE id = NEW.post_id;
    
    -- Insert notification ONLY if the commenter is not the author
    IF NEW.user_id != post_author_id THEN
        INSERT INTO public.notifications (user_id, actor_id, post_id, type)
        VALUES (post_author_id, NEW.user_id, NEW.post_id, 'comment');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Comments
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();


-- Function for New Follows
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification (user_id is the person being followed, actor is the follower)
    INSERT INTO public.notifications (user_id, actor_id, type)
    VALUES (NEW.following_id, NEW.follower_id, 'follow');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Follows
DROP TRIGGER IF EXISTS on_follow_created ON public.follows;
CREATE TRIGGER on_follow_created
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_follow();

-- ==========================================
-- END OF SCRIPT
-- ==========================================
