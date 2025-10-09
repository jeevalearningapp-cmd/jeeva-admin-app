-- Add First Admin User
-- This script creates the admin_users table if it doesn't exist and adds the first superadmin user
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard → Authentication → Users
-- 2. Find your user and copy the UUID (it looks like: 12345678-1234-1234-1234-123456789abc)
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user ID
-- 4. Run this SQL in Supabase SQL Editor

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role text NOT NULL CHECK (role IN ('superadmin', 'editor', 'moderator')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- ==========================================
-- INSERT YOUR FIRST ADMIN USER
-- ==========================================
-- REPLACE 'YOUR_USER_ID_HERE' WITH YOUR ACTUAL USER ID FROM SUPABASE AUTH
-- Example: INSERT INTO admin_users (id, email, name, role, is_active) 
--          VALUES ('12345678-1234-1234-1234-123456789abc', 'admin@example.com', 'Admin User', 'superadmin', true);

-- UNCOMMENT AND EDIT THE LINE BELOW:
-- INSERT INTO admin_users (id, email, name, role, is_active) 
-- VALUES ('YOUR_USER_ID_HERE', 'your-email@example.com', 'Your Name', 'superadmin', true)
-- ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'superadmin';
