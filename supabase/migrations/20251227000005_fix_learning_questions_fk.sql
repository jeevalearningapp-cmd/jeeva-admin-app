-- Fix Foreign Key Constraint for learning_questions

-- The error "insert or update on table "learning_questions" violates foreign key constraint "learning_questions_subtopic_id_fkey""
-- suggests that the constraint is pointing to a table that doesn't contain the lesson IDs (or is broken).
-- Given that 'subtopics' are actually rows in the 'lessons' table in our current schema,
-- the foreign key should point to 'lessons'.

DO $$
BEGIN
    -- 1. Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'learning_questions_subtopic_id_fkey'
        AND table_name = 'learning_questions'
    ) THEN
        ALTER TABLE public.learning_questions DROP CONSTRAINT learning_questions_subtopic_id_fkey;
    END IF;

    -- 2. Delete orphaned rows that reference non-existent lessons
    -- This is necessary because the presence of invalid IDs (like '22222222-2222-0001-0000-000000000001')
    -- will prevent valid foreign key creation.
    DELETE FROM public.learning_questions
    WHERE subtopic_id NOT IN (SELECT id FROM public.lessons);

    -- 3. Add the correct constraint pointing to lessons(id)
    ALTER TABLE public.learning_questions
    ADD CONSTRAINT learning_questions_subtopic_id_fkey
    FOREIGN KEY (subtopic_id)
    REFERENCES public.lessons(id)
    ON DELETE CASCADE;

END $$;
