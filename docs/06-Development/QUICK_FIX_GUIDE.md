# Quick Fix: RLS Policy Error When Adding Questions

**Error:** "new row violates row-level security policy for table "questions""

**Solution:** Update RLS policies to allow admins to insert questions

---

## How to Fix (3 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"+ New Query"**
4. Name it: "Fix Questions RLS"

### Step 2: Copy & Paste the Fix
Copy the entire contents of `FIX_QUESTIONS_RLS_POLICY.sql` and paste into the SQL Editor

### Step 3: Run the Query
- Click the **"Run"** button
- Wait for completion (should finish in ~2 seconds)
- You should see "Query executed successfully"

---

## What the Fix Does

✅ Drops old restrictive RLS policies
✅ Creates new policies that allow admins to INSERT questions
✅ Allows public to READ active questions
✅ Allows admins to UPDATE and DELETE questions
✅ Fixes question_options table too

---

## Verify It Worked

After running the fix:

1. Go back to your Admin Portal
2. Try adding a question again
3. Should work now! ✅

---

## If Still Getting Error

**Check 1:** Are you logged in as an admin?
- Make sure your user account has role = 'admin' or 'superadmin' in the `user_profiles` table

**Check 2:** Is the admin_users table set up?
- Check if your admin user ID exists in the `admin_users` table

**Check 3:** Run verification query
```sql
-- Check if policies were created
SELECT policyname, tablename
FROM pg_policies
WHERE tablename = 'questions'
ORDER BY tablename, policyname;
-- Should show 4 policies for questions table
```

---

## File Location

`FIX_QUESTIONS_RLS_POLICY.sql` - Ready to use!

Just copy it into your Supabase SQL Editor and run it.
