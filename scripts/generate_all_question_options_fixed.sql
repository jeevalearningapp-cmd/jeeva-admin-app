-- ================================================================
-- QUESTION OPTIONS GENERATOR - CORRECTED VERSION
-- Auto-generates 4 options for each question (168 total)
-- ================================================================
--
-- Run this AFTER seed_learning_fixed.sql
-- This script creates placeholder options - customize via admin portal
--
-- ================================================================

DO $$
DECLARE
  q_record RECORD;
  q_count INTEGER := 0;
  opt_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting question options generation...';
  RAISE NOTICE '';
  
  -- Loop through all questions and create 4 options each
  FOR q_record IN 
    SELECT id, question_text, subdivision
    FROM questions 
    ORDER BY subdivision
  LOOP
    -- Insert 4 options for each question
    -- Option 1 (marked as correct by default)
    INSERT INTO question_options (id, question_id, option_text, is_correct, display_order)
    VALUES (gen_random_uuid(), q_record.id, 'Correct answer (customize this option via admin portal)', true, 1);
    
    -- Options 2-4 (incorrect)
    INSERT INTO question_options (id, question_id, option_text, is_correct, display_order)
    VALUES 
      (gen_random_uuid(), q_record.id, 'Incorrect option A (customize this option)', false, 2),
      (gen_random_uuid(), q_record.id, 'Incorrect option B (customize this option)', false, 3),
      (gen_random_uuid(), q_record.id, 'Incorrect option C (customize this option)', false, 4);
    
    q_count := q_count + 1;
    opt_count := opt_count + 4;
    
    IF q_count % 10 = 0 THEN
      RAISE NOTICE 'Processed % questions, created % options...', q_count, opt_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ QUESTION OPTIONS COMPLETED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Questions processed: %', q_count;
  RAISE NOTICE 'Options created: %', opt_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  These are placeholder options';
  RAISE NOTICE '👉 Customize them via the Admin Portal:';
  RAISE NOTICE '   Content Management → Learning Module';
  RAISE NOTICE '   Select topic → subtopic → Edit questions';
  RAISE NOTICE '';
  
END $$;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check total options created (should be 168 if you have 42 questions)
SELECT COUNT(*) as total_options FROM question_options;

-- Check options per question (should all be 4)
SELECT 
  q.subdivision,
  q.question_text,
  COUNT(qo.id) as option_count
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
GROUP BY q.id, q.subdivision, q.question_text
ORDER BY q.subdivision;

-- Find questions missing options (should be empty)
SELECT 
  subdivision, 
  question_text,
  'MISSING OPTIONS!' as status
FROM questions q
WHERE NOT EXISTS (
  SELECT 1 FROM question_options WHERE question_id = q.id
)
ORDER BY subdivision;

-- Success message
SELECT 
  '✅ All ' || COUNT(DISTINCT q.id) || ' questions now have options!' as status,
  COUNT(qo.id) || ' total options created' as details
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id;
