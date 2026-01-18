-- ============================================
-- Fix Subtopic Database Mapping
-- Creates proper subtopics table and links lessons
-- ============================================

-- 1. Create subtopics table
CREATE TABLE IF NOT EXISTS public.subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subtopics
CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON public.subtopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_display_order ON public.subtopics(display_order);

-- 2. Add subtopic_id to lessons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'subtopic_id'
  ) THEN
    ALTER TABLE public.lessons ADD COLUMN subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_lessons_subtopic_id ON public.lessons(subtopic_id);
  END IF;
END $$;

-- 3. Enable RLS on subtopics
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for subtopics

-- Superadmins
CREATE POLICY "Superadmins can view all subtopics" ON public.subtopics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can insert subtopics" ON public.subtopics FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can update subtopics" ON public.subtopics FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Superadmins can delete subtopics" ON public.subtopics FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

-- Editors
CREATE POLICY "Editors can view subtopics" ON public.subtopics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can insert subtopics" ON public.subtopics FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Editors can update subtopics" ON public.subtopics FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

-- Moderators
CREATE POLICY "Moderators can view subtopics" ON public.subtopics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- Users (Mobile App)
CREATE POLICY "Users can view active subtopics" ON public.subtopics FOR SELECT
USING (is_active = true);

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subtopics_updated_at
    BEFORE UPDATE ON public.subtopics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
