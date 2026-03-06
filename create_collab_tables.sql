-- 1. Create Collaboration Rooms Table
CREATE TABLE IF NOT EXISTS collab_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Collaboration Roles Table (What the room needs, e.g., "Frontend", "UI")
CREATE TABLE IF NOT EXISTS collab_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collab_rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- The user who fills the role (null if open)
    is_filled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Collaboration Requests Table (Users asking to join a role)
CREATE TABLE IF NOT EXISTS collab_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collab_rooms(id) ON DELETE CASCADE,
    role_id UUID REFERENCES collab_roles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, user_id) -- A user can only request a specific role once
);

-- 4. Create Collaboration Tasks Table (The Kanban/To-Do board)
CREATE TABLE IF NOT EXISTS collab_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collab_rooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Collaboration Messages Table (The Room Chat)
CREATE TABLE IF NOT EXISTS collab_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES collab_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE collab_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_messages ENABLE ROW LEVEL SECURITY;

-- Base Policies (For simplicity, allowing authenticated users general access while building. In production, these should be locked down to room members/admins).
CREATE POLICY "Anyone can read rooms" ON collab_rooms FOR SELECT USING (true);
CREATE POLICY "Users can create rooms" ON collab_rooms FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Admins can update rooms" ON collab_rooms FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can read roles" ON collab_roles FOR SELECT USING (true);
CREATE POLICY "Admins can insert roles" ON collab_roles FOR INSERT WITH CHECK ( EXISTS (SELECT 1 FROM collab_rooms WHERE id = room_id AND admin_id = auth.uid()) );
CREATE POLICY "Admins can update roles" ON collab_roles FOR UPDATE USING ( EXISTS (SELECT 1 FROM collab_rooms WHERE id = room_id AND admin_id = auth.uid()) );

CREATE POLICY "Users can see requests for their rooms, or their own requests" ON collab_requests FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM collab_rooms WHERE id = room_id AND admin_id = auth.uid()));
CREATE POLICY "Users can submit requests" ON collab_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requests" ON collab_requests FOR UPDATE USING ( EXISTS (SELECT 1 FROM collab_rooms WHERE id = room_id AND admin_id = auth.uid()) );

CREATE POLICY "Room members can read tasks" ON collab_tasks FOR SELECT USING (true);
CREATE POLICY "Room members can insert tasks" ON collab_tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Room members can update tasks" ON collab_tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Room members can delete tasks" ON collab_tasks FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Room members can read messages" ON collab_messages FOR SELECT USING (true);
CREATE POLICY "Room members can send messages" ON collab_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Don't forget to turn on Realtime for `collab_tasks` and `collab_messages` in Supabase dashboard!
