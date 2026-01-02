-- Fix RLS Policies for Learning Module Tables
-- Tables: topic_core_notes, topic_flash_content, flashcards

DO $$
BEGIN
    -- 1. topic_core_notes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_core_notes') THEN
        ALTER TABLE public.topic_core_notes ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.topic_core_notes;
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.topic_core_notes;
        
        CREATE POLICY "Enable read access for all users" ON public.topic_core_notes FOR SELECT USING (true);
        CREATE POLICY "Enable all access for authenticated users" ON public.topic_core_notes FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- 2. topic_flash_content
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_flash_content') THEN
        ALTER TABLE public.topic_flash_content ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Enable read access for all users" ON public.topic_flash_content;
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.topic_flash_content;

        CREATE POLICY "Enable read access for all users" ON public.topic_flash_content FOR SELECT USING (true);
        CREATE POLICY "Enable all access for authenticated users" ON public.topic_flash_content FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- 3. flashcards (Q&A)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flashcards') THEN
        ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Enable read access for all users" ON public.flashcards;
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.flashcards;

        CREATE POLICY "Enable read access for all users" ON public.flashcards FOR SELECT USING (true);
        CREATE POLICY "Enable all access for authenticated users" ON public.flashcards FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- 4. learning_questions (MCQs) - verifying RLS here too as user just fixed FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_questions') THEN
        ALTER TABLE public.learning_questions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Enable read access for all users" ON public.learning_questions;
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.learning_questions;

        CREATE POLICY "Enable read access for all users" ON public.learning_questions FOR SELECT USING (true);
        CREATE POLICY "Enable all access for authenticated users" ON public.learning_questions FOR ALL USING (auth.role() = 'authenticated');
    END IF;

     -- 5. learning_question_options
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_question_options') THEN
        ALTER TABLE public.learning_question_options ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Enable read access for all users" ON public.learning_question_options;
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.learning_question_options;

        CREATE POLICY "Enable read access for all users" ON public.learning_question_options FOR SELECT USING (true);
        CREATE POLICY "Enable all access for authenticated users" ON public.learning_question_options FOR ALL USING (auth.role() = 'authenticated');
    END IF;

END $$;
