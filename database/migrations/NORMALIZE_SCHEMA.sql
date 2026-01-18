
-- 0. Cleanup Legacy/Conflicting Tables
DROP TABLE IF EXISTS public.subtopics CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.sub_sections CASCADE;

-- 1. Create subtopics table (Level 3 for Learning)
CREATE TABLE IF NOT EXISTS public.subtopics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create sections table (Level 2 for Practice/Mock)
-- Example: 'Numeracy', 'Clinical'
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create sub_sections table (Level 3 for Practice/Mock)
-- Example: 'Dosage Calculations'
CREATE TABLE IF NOT EXISTS public.sub_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add Link Columns to Content Tables
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES public.subtopics(id);

ALTER TABLE public.practice_questions 
ADD COLUMN IF NOT EXISTS sub_section_id UUID REFERENCES public.sub_sections(id);

ALTER TABLE public.mock_exam_questions
ADD COLUMN IF NOT EXISTS sub_section_id UUID REFERENCES public.sub_sections(id);

-- 5. Enable RLS (Security Best Practice)
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_sections ENABLE ROW LEVEL SECURITY;

-- 6. Create Basic Policies (Public Read)
CREATE POLICY "Public Read Subtopics" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Public Read Sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Public Read SubSections" ON public.sub_sections FOR SELECT USING (true);
