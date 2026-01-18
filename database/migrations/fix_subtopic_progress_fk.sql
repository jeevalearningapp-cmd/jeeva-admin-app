
-- 1. First, DROP the incorrect constraint so we can fix the data
ALTER TABLE public.subtopic_progress
DROP CONSTRAINT IF EXISTS subtopic_progress_subtopic_id_fkey;

-- 2. Fix existing data: Update subtopic_progress to point to actual Subtopics
-- We map them to the correct subtopic_id from the lessons table.
UPDATE public.subtopic_progress sp
SET subtopic_id = l.subtopic_id
FROM public.lessons l
WHERE sp.subtopic_id = l.id
  AND l.subtopic_id IS NOT NULL;

-- 3. Optional: Delete any remaining orphans
-- DELETE FROM public.subtopic_progress
-- WHERE subtopic_id NOT IN (SELECT id FROM public.subtopics);

-- 4. Add the correct foreign key constraint pointing to subtopics
ALTER TABLE public.subtopic_progress
ADD CONSTRAINT subtopic_progress_subtopic_id_fkey
FOREIGN KEY (subtopic_id)
REFERENCES public.subtopics(id)
ON DELETE CASCADE;
