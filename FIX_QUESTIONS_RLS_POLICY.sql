-- ================================================
-- FIX: Questions Table RLS Policy
-- ================================================
-- This script fixes the RLS policy error when adding questions from admin panel
-- Error: "new row violates row-level security policy for table "questions""

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON questions;

-- Step 2: Disable RLS temporarily to ensure no conflicts
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Step 3: Enable RLS with new policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- Policy 1: Allow admins/editors to INSERT questions
-- ================================================
CREATE POLICY "Allow admins to insert questions" ON questions
  FOR INSERT
  WITH CHECK (
    -- Check if user is admin or editor
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ================================================
-- Policy 2: Allow anyone to READ active questions
-- ================================================
CREATE POLICY "Allow public read active questions" ON questions
  FOR SELECT
  USING (
    is_active = true
    OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ================================================
-- Policy 3: Allow admins to UPDATE questions
-- ================================================
CREATE POLICY "Allow admins to update questions" ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ================================================
-- Policy 4: Allow admins to DELETE questions
-- ================================================
CREATE POLICY "Allow admins to delete questions" ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- ================================================
-- Fix question_options table RLS as well
-- ================================================
DROP POLICY IF EXISTS "Enable read for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON question_options;

ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage options
CREATE POLICY "Allow admins to manage options" ON question_options
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'superadmin', 'editor')
    )
  );

-- Allow anyone to read active options
CREATE POLICY "Allow public read options" ON question_options
  FOR SELECT
  USING (true);

-- ================================================
-- Verify policies were created
-- ================================================
-- Run this to verify the fix worked:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('questions', 'question_options')
ORDER BY tablename, policyname;
