-- ================================================
-- FIX V2: Questions Table RLS Policy
-- Simplified version that works with actual schema
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins to insert questions" ON questions;
DROP POLICY IF EXISTS "Allow public read active questions" ON questions;
DROP POLICY IF EXISTS "Allow admins to update questions" ON questions;
DROP POLICY IF EXISTS "Allow admins to delete questions" ON questions;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON questions;

-- Disable and re-enable RLS
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- SIMPLIFIED POLICIES - Only check admin_users table
-- ================================================

-- Policy 1: Allow admins to INSERT questions
CREATE POLICY "Allow admins to insert questions" ON questions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Policy 2: Allow anyone to READ active questions
CREATE POLICY "Allow anyone to read questions" ON questions
  FOR SELECT
  USING (
    is_active = true 
    OR 
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Policy 3: Allow admins to UPDATE questions
CREATE POLICY "Allow admins to update questions" ON questions
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Policy 4: Allow admins to DELETE questions
CREATE POLICY "Allow admins to delete questions" ON questions
  FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- ================================================
-- Fix question_options table RLS
-- ================================================
DROP POLICY IF EXISTS "Allow admins to manage options" ON question_options;
DROP POLICY IF EXISTS "Allow public read options" ON question_options;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON question_options;

ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage options
CREATE POLICY "Admin manages question options" ON question_options
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- Allow public to read options
CREATE POLICY "Anyone can read question options" ON question_options
  FOR SELECT
  USING (true);

-- ================================================
-- Verify policies were created
-- ================================================
-- This will show you all policies on questions table:
SELECT 
  tablename, 
  policyname, 
  permissive,
  cmd
FROM pg_policies
WHERE tablename IN ('questions', 'question_options')
ORDER BY tablename, policyname;
