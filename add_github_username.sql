-- Add github_username to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_username TEXT;

-- For security, if RLS is enabled on users for updates, make sure the user can update their own github_username.
-- Assuming the existing policy for updates on users table handles all columns for the authenticated user:
-- e.g. "Users can update their own profile."
