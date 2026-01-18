-- ============================================
-- Sync Learning Progress
-- Automatically updates subtopic_progress when a lesson is completed
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_learning_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_subtopic_id UUID;
    v_topic_id UUID;
BEGIN
    -- 1. Get subtopic_id and topic_id from the lesson
    SELECT subtopic_id, topic_id INTO v_subtopic_id, v_topic_id
    FROM public.lessons
    WHERE id = NEW.lesson_id;

    -- If no linked subtopic, exit (should not happen with correct data migration)
    IF v_subtopic_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 2. Upsert into subtopic_progress
    INSERT INTO public.subtopic_progress (
        user_id,
        topic_id,
        subtopic_id,
        status,
        score,
        attempts,
        updated_at
    )
    VALUES (
        NEW.user_id,
        v_topic_id,
        v_subtopic_id,
        'completed',
        NULL, -- Score is handled by quiz completion, not lesson completion
        1,
        NOW()
    )
    ON CONFLICT (user_id, subtopic_id) 
    DO UPDATE SET
        status = 'completed',
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS on_learning_completion_insert ON public.learning_completions;
CREATE TRIGGER on_learning_completion_insert
    AFTER INSERT ON public.learning_completions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_learning_completion();
