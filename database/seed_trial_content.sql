-- ============================================
-- Seed Trial Module Content
-- Populates the trial module with:
-- 1. Numeracy Practice Exam
-- 2. Clinical Practice Exam
-- 3. Sample Learning Content
-- ============================================

-- Variables for IDs (using DO block for variable support)
DO $$
DECLARE
  v_trial_module_id UUID;
  v_numeracy_exam_id UUID;
  v_clinical_exam_id UUID;
  v_topic_id UUID;
  v_subtopic_id UUID;
  v_lesson_id UUID;
BEGIN

  -- 1. Get or Create Trial Module
  SELECT id INTO v_trial_module_id FROM modules WHERE slug = 'trial' LIMIT 1;
  
  IF v_trial_module_id IS NULL THEN
    INSERT INTO modules (title, slug, description, is_trial, display_order, is_active)
    VALUES ('Free Trial', 'trial', 'Experience the course with our free trial.', true, 0, true)
    RETURNING id INTO v_trial_module_id;
  END IF;

  -- 2. Create Numeracy Practice Exam (Sequence 1)
  -- Uses random questions from existing pool or placeholders if empty
  INSERT INTO trial_mock_exams (module_id, title, description, category, sequence_order, question_count, time_limit_minutes, passing_score, question_ids, is_active)
  VALUES (
    v_trial_module_id, 
    'Numeracy Practice', 
    'Test your numeracy skills with 20 questions.', 
    'numeracy', 
    1, 
    20, 
    30, 
    80, 
    ARRAY[]::UUID[], -- Will need real question IDs in production, empty for now
    true
  )
  ON CONFLICT DO NOTHING; -- Assuming name or similar constraint, usually simpler to just insert or ignore
  
  -- 3. Create Clinical Practice Exam (Sequence 2)
  INSERT INTO trial_mock_exams (module_id, title, description, category, sequence_order, question_count, time_limit_minutes, passing_score, question_ids, is_active)
  VALUES (
    v_trial_module_id, 
    'Clinical Practice', 
    'Assess your clinical knowledge with 20 questions.', 
    'clinical', 
    2, 
    20, 
    30, 
    80, 
    ARRAY[]::UUID[], 
    true
  )
  ON CONFLICT DO NOTHING;

  -- 4. Create Sample Learning Topic: "Trial Learning Topic"
  INSERT INTO topics (module_id, title, description, is_active, display_order, is_trial_content)
  VALUES (v_trial_module_id, 'Introduction to NMC CBT', 'A glimpse into our comprehensive study materials.', true, 1, true)
  RETURNING id INTO v_topic_id;

  -- Create Sample Subtopic (stored in topics table per schema)
  -- Note: Schema says subtopics are topics but doesn't strictly enforce parent-child in same table via standard FK without custom logic, 
  -- but usually 'parent_id' or similar exists. Checking `learning_module_restructure.sql`, subtopics are just topics referenced as `subtopic_id`.
  -- We'll just create another topic and treat it as a subtopic for now, or if there's a parent_id, use it.
  -- Looking at `create_content_tables.sql`, `topics` has no parent_id. 
  -- But `learning_questions` has `subtopic_id` referencing `topics`. 
  -- So a "Subtopic" is functionally just a Topic used in that context.
  
  INSERT INTO topics (module_id, title, description, is_active, display_order, is_trial_content)
  VALUES (v_trial_module_id, 'Trial Subtopic: Professional Values', 'Key values every nurse should know.', true, 1, true)
  RETURNING id INTO v_subtopic_id;

  -- 5. Create Sample Lesson with Multimedia
  INSERT INTO lessons (topic_id, title, content, is_active, display_order, is_trial_content, content_type)
  VALUES (v_subtopic_id, 'The Code: Professional Standards', 'Reading material about The Code...', true, 1, true, 'text')
  RETURNING id INTO v_lesson_id;

  -- Add Content: Video
  INSERT INTO lesson_content (lesson_id, content_type, title, content_url, display_order)
  VALUES (v_lesson_id, 'video', 'Understanding The Code', 'https://example.com/trial-video.mp4', 1);

  -- Add Content: Podcast
  INSERT INTO lesson_content (lesson_id, content_type, title, content_url, display_order)
  VALUES (v_lesson_id, 'audio', 'Podcast: The 4 Themes', 'https://example.com/trial-podcast.mp3', 2);

   -- Add Content: Flashcard
  INSERT INTO lesson_content (lesson_id, content_type, title, content_data, display_order)
  VALUES (v_lesson_id, 'flashcard', 'Review Flashcards', '[{"front":"What is the first theme?","back":"Prioritise People"}]'::jsonb, 3);
  
END $$;
