-- ============================================
-- Diagnostic Check - Run this to see your data state
-- Copy the output and share it with me
-- ============================================

-- Check Topics
SELECT 
    'TOPICS' as table_name,
    id,
    title,
    module_id
FROM public.topics
ORDER BY title;

-- Check Subtopics Count
SELECT 
    'SUBTOPICS COUNT' as info,
    COUNT(*) as total_subtopics
FROM public.subtopics;

-- Check Subtopics by Topic
SELECT 
    'SUBTOPICS BY TOPIC' as info,
    t.title as topic_title,
    t.id as topic_id,
    COUNT(s.id) as subtopic_count
FROM public.topics t
LEFT JOIN public.subtopics s ON s.topic_id = t.id
GROUP BY t.id, t.title
ORDER BY t.title;

-- Check Lessons
SELECT 
    'LESSONS' as info,
    COUNT(*) as total_lessons,
    COUNT(subtopic_id) as lessons_with_subtopic,
    COUNT(*) - COUNT(subtopic_id) as lessons_without_subtopic
FROM public.lessons;

-- Sample Subtopics
SELECT 
    'SAMPLE SUBTOPICS' as info,
    s.id as subtopic_id,
    s.title as subtopic_title,
    s.topic_id,
    t.title as topic_title,
    s.is_active
FROM public.subtopics s
JOIN public.topics t ON t.id = s.topic_id
LIMIT 10;
