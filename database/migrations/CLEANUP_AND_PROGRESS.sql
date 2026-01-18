
-- 1. DROP Unwanted Tables
-- As identified in the Unused Tables Report
DROP TABLE IF EXISTS public.dashboard_hero;
DROP TABLE IF EXISTS public.lesson_quizzes;
DROP TABLE IF EXISTS public.lesson_quiz_results;

-- 2. Add Progress Tracking Fields
-- To track progress at the new Subtopic/Section level

-- Table: trial_learning_progress
ALTER TABLE public.trial_learning_progress
ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE CASCADE;

-- Table: trial_attempt_records
ALTER TABLE public.trial_attempt_records
ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sub_section_id UUID REFERENCES public.sub_sections(id) ON DELETE SET NULL;

-- 3. (Optional) Create a new main table for unified progress if not exists
-- Only create if you don't have a main 'user_progress' table yet.
-- Using 'trial_learning_progress' as the template but for general use?
-- For now, modifying existing is safer as requested.
