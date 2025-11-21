# Quick Fix V2: RLS Policy Error (SIMPLIFIED)

**Previous Error:** "column user_profiles.role does not exist"

**Solution:** Use simplified RLS policies that only check `admin_users` table

---

## How to Fix (2 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click **SQL Editor** (left sidebar)
3. Click **"+ New Query"**
4. Name it: "Fix Questions RLS V2"

### Step 2: Copy & Run This Fixed Script

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Allow admins to insert questions" ON questions;
DROP POLICY IF EXISTS "Allow public read active questions" ON questions;
DROP POLICY IF EXISTS "Allow admins to update questions" ON questions;
DROP POLICY IF EXISTS "Allow admins to delete questions" ON questions;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON questions;

ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- New simplified policies
CREATE POLICY "Allow admins to insert questions" ON questions
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow anyone to read questions" ON questions
  FOR SELECT
  USING (is_active = true OR auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow admins to update questions" ON questions
  FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Allow admins to delete questions" ON questions
  FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Fix question_options
DROP POLICY IF EXISTS "Allow admins to manage options" ON question_options;
DROP POLICY IF EXISTS "Allow public read options" ON question_options;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON question_options;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON question_options;

ALTER TABLE question_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages question options" ON question_options
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can read question options" ON question_options
  FOR SELECT
  USING (true);
```

Click **"Run"** button

---

## Verify It Works

After running:
1. Go back to Admin Panel
2. Try adding a question
3. Should work now! ✅

---

## If Still Getting Error

**Make sure:**
1. Your admin user ID exists in the `admin_users` table
2. You're logged in with that admin account
3. Check with this query:

```sql
-- See all admin users
SELECT id, role FROM admin_users;

-- Check current user ID
SELECT auth.uid();
```

If your ID is NOT in admin_users, contact your admin to add you.

---

## What Changed

✅ Removed the problematic `user_profiles.role` check
✅ Simplified to only check `admin_users` table
✅ Same functionality, simpler schema
