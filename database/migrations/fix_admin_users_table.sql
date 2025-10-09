-- Fix admin_users table to work with the admin portal
-- This removes the NOT NULL constraint from password_hash since we use Supabase Auth instead

-- Step 1: Make password_hash nullable (since we don't use it)
ALTER TABLE admin_users ALTER COLUMN password_hash DROP NOT NULL;

-- Step 2: Now insert your first admin user
-- REPLACE 'YOUR_USER_ID' with your actual UUID from Supabase Auth → Users
-- REPLACE 'your-email@example.com' with your actual email

INSERT INTO admin_users (id, email, role, is_active) 
VALUES ('YOUR_USER_ID', 'your-email@example.com', 'superadmin', true)
ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'superadmin';

-- Note: password_hash will be NULL, which is fine because authentication 
-- is handled by Supabase Auth, not by this column
