-- ============================================
-- Data Migration: Lessons to Subtopics
-- Automatically creates subtopics for existing lessons
-- ============================================

DO $$
DECLARE
    r RECORD;
    new_subtopic_id UUID;
BEGIN
    -- Iterate over lessons that don't have a subtopic_id yet
    FOR r IN SELECT * FROM public.lessons WHERE subtopic_id IS NULL LOOP
        
        -- 1. Create a new Subtopic for this Lesson
        -- We use the lesson's title, topic linkage, and active status
        INSERT INTO public.subtopics (
            topic_id, 
            title, 
            display_order, 
            is_active
        )
        VALUES (
            r.topic_id, 
            r.title, 
            r.display_order, 
            r.is_active
        )
        RETURNING id INTO new_subtopic_id;

        -- 2. Update the Lesson to point to this new Subtopic
        UPDATE public.lessons
        SET subtopic_id = new_subtopic_id
        WHERE id = r.id;

        -- 3. Update Learning Questions (if applicable)
        -- If learning_questions table exists and uses video_lesson_id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_questions') THEN
             UPDATE public.learning_questions
             SET subtopic_id = new_subtopic_id
             WHERE video_lesson_id = r.id;
        END IF;

        RAISE NOTICE 'Migrated Lesson % to new Subtopic %', r.id, new_subtopic_id;
        
    END LOOP;
END $$;
