-- Add First Admin User
-- This script creates the admin_users table if it doesn't exist and adds the first superadmin user
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → Authentication → Users
-- 2. Find your user and copy the UUID (it looks like: 12345678-1234-1234-1234-123456789abc)
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 4. Replace 'your-email@example.com' with your actual email
-- 5. Run this SQL in Supabase SQL Editor

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('superadmin', 'editor', 'moderator')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only superadmins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only superadmins can update admin users" ON admin_users;

-- Create policies for admin_users table
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Only superadmins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
    )
  );

CREATE POLICY "Only superadmins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true
    )
  );

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- ==========================================
-- INSERT YOUR FIRST ADMIN USER
-- ==========================================
-- REPLACE THE VALUES BELOW WITH YOUR ACTUAL INFORMATION
-- 1. Replace 'YOUR_USER_ID_HERE' with your UUID from Supabase Auth → Users
-- 2. Replace 'your-email@example.com' with your actual email address
-- 3. Uncomment the INSERT statement below and run it

-- UNCOMMENT AND EDIT THE LINE BELOW:
-- INSERT INTO admin_users (id, email, role, is_active) 
-- VALUES ('YOUR_USER_ID_HERE', 'your-email@example.com', 'superadmin', true)
-- ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'superadmin';
