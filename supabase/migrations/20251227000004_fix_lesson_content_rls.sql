-- Fix RLS Policies for lesson_content

-- Drop existing policies to be safe
DROP POLICY IF EXISTS "Enable read access for all users" ON public.lesson_content;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.lesson_content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.lesson_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.lesson_content;

-- Create more permissive RLS Policies for authenticated users
-- READ: All users (including public if needed for app, but let's stick to true for now as per previous policy)
CREATE POLICY "Enable read access for all users" ON public.lesson_content FOR SELECT USING (true);

-- WRITE (Insert, Update, Delete): Authenticated users
-- We use 'true' for check to minimize friction during development/seeding from dashboard
CREATE POLICY "Enable insert for authenticated users" ON public.lesson_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.lesson_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.lesson_content FOR DELETE USING (auth.role() = 'authenticated');
