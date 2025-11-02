-- ================================================================
-- COMPLETE QUESTION OPTIONS - ALL 168 OPTIONS
-- Auto-generated for all 42 questions
-- ================================================================
--
-- This script creates 4 multiple-choice options for each question
-- Run this AFTER seed_learning_complete.sql
--
-- Note: These are generic placeholder options. 
-- Customize them via the admin portal for better quality.
-- ================================================================

-- Create a helper function to generate options for questions
DO $$
DECLARE
  q_record RECORD;
  q_id UUID;
BEGIN
  -- Loop through all questions and create 4 generic options
  FOR q_record IN 
    SELECT id, subdivision, question_text 
    FROM questions 
    ORDER BY subdivision
  LOOP
    -- Insert 4 options for each question
    -- Option 1 (marked as correct by default)
    INSERT INTO question_options (id, question_id, option_text, is_correct, display_order)
    VALUES (gen_random_uuid(), q_record.id, 'Correct answer (customize this option)', true, 1);
    
    -- Options 2-4 (incorrect)
    INSERT INTO question_options (id, question_id, option_text, is_correct, display_order)
    VALUES 
      (gen_random_uuid(), q_record.id, 'Incorrect option A (customize this)', false, 2),
      (gen_random_uuid(), q_record.id, 'Incorrect option B (customize this)', false, 3),
      (gen_random_uuid(), q_record.id, 'Incorrect option C (customize this)', false, 4);
    
    RAISE NOTICE 'Created 4 options for question in subtopic %', q_record.subdivision;
  END LOOP;
  
  RAISE NOTICE '✅ All question options created!';
  RAISE NOTICE '⚠️  These are placeholders - customize via admin portal';
END $$;

-- Verification
SELECT COUNT(*) as total_options FROM question_options;

SELECT q.subdivision, COUNT(qo.id) as option_count
FROM questions q
JOIN question_options qo ON q.id = qo.question_id
GROUP BY q.subdivision
ORDER BY q.subdivision;

-- Success message
SELECT '✅ 168 question options created (4 per question)' as status;
SELECT '⚠️ Please customize these options via the admin portal for better quality' as next_step;
