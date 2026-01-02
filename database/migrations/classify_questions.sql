-- ============================================
-- Question Classification Logic
-- This script analyzes questions in mock_exam_questions table
-- and determines if they belong to Practice or Learning modules
-- ============================================

-- Create a temporary function to classify questions
CREATE OR REPLACE FUNCTION classify_question(question_lesson_id UUID)
RETURNS TEXT AS $$
DECLARE
  module_title TEXT;
  lesson_rec RECORD;
  topic_rec RECORD;
BEGIN
  -- If no lesson_id, it's a Mock Exam question
  IF question_lesson_id IS NULL THEN
    RETURN 'mock_exam';
  END IF;
  
  -- Get the lesson
  SELECT * INTO lesson_rec FROM lessons WHERE id = question_lesson_id;
  
  -- If lesson not found, default to mock_exam
  IF NOT FOUND THEN
    RETURN 'mock_exam';
  END IF;
  
  -- Get the topic
  SELECT * INTO topic_rec FROM topics WHERE id = lesson_rec.topic_id;
  
  -- If topic not found, default to mock_exam
  IF NOT FOUND THEN
    RETURN 'mock_exam';
  END IF;
  
  -- Get the module title
  SELECT m.title INTO module_title 
  FROM modules m 
  WHERE m.id = topic_rec.module_id;
  
  -- If module not found, default to mock_exam
  IF module_title IS NULL THEN
    RETURN 'mock_exam';
  END IF;
  
  -- Classify based on module title
  IF module_title = 'Practice Module' OR module_title ILIKE '%practice%' THEN
    RETURN 'practice';
  ELSIF module_title = 'Learning Module' OR module_title ILIKE '%learning%' THEN
    RETURN 'learning';
  ELSE
    RETURN 'mock_exam';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view to analyze question distribution
CREATE OR REPLACE VIEW question_classification_analysis AS
SELECT 
  q.id,
  q.lesson_id,
  classify_question(q.lesson_id) as classification,
  l.title as lesson_title,
  t.title as topic_title,
  m.title as module_title,
  q.question_text,
  q.difficulty,
  q.is_active
FROM mock_exam_questions q
LEFT JOIN lessons l ON q.lesson_id = l.id
LEFT JOIN topics t ON l.topic_id = t.id
LEFT JOIN modules m ON t.module_id = m.id;

-- Query to get classification summary
SELECT 
  classification,
  COUNT(*) as question_count,
  COUNT(DISTINCT lesson_id) as unique_lessons,
  COUNT(CASE WHEN is_active THEN 1 END) as active_questions
FROM question_classification_analysis
GROUP BY classification
ORDER BY classification;

-- Query to get detailed breakdown by module
SELECT 
  module_title,
  topic_title,
  classification,
  COUNT(*) as question_count
FROM question_classification_analysis
WHERE classification != 'mock_exam'
GROUP BY module_title, topic_title, classification
ORDER BY module_title, topic_title;

-- Query to identify questions without lesson associations (Mock Exam candidates)
SELECT 
  id,
  question_text,
  difficulty,
  is_active
FROM mock_exam_questions
WHERE lesson_id IS NULL
ORDER BY created_at DESC;

-- Query to get Practice Module questions
SELECT 
  q.id,
  q.lesson_id,
  l.title as lesson_title,
  t.title as topic_title,
  q.question_text,
  q.difficulty
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%practice%'
ORDER BY t.title, l.title;

-- Query to get Learning Module questions
SELECT 
  q.id,
  q.lesson_id,
  l.title as lesson_title,
  t.title as topic_title,
  q.question_text,
  q.difficulty
FROM mock_exam_questions q
INNER JOIN lessons l ON q.lesson_id = l.id
INNER JOIN topics t ON l.topic_id = t.id
INNER JOIN modules m ON t.module_id = m.id
WHERE m.title ILIKE '%learning%'
ORDER BY t.title, l.title;

-- ============================================
-- Classification Complete!
-- ============================================
-- Use the classify_question() function to determine question type
-- Use the question_classification_analysis view for reporting
-- Run the summary queries to understand distribution
-- ============================================
