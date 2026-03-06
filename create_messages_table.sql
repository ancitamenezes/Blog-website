-- Create messages table for Direct Messaging
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Users can read messages if they are the sender or receiver
CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 2. Users can send messages (insert) where they are the sender
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- 3. Receivers can update the message (to mark it as read)
CREATE POLICY "Users can mark received messages as read"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id);

-- Note: To make real-time updates work, you must also enable Replication for this table in your Supabase Dashboard!
-- Go to Database -> Replication -> Source: supabase_realtime -> Toggle 'messages' ON.
