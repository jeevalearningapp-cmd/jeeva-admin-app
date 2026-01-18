-- ============================================
-- Enhance Trial Module Schema
-- Adds support for:
-- 1. Categorized practice exams (Numeracy vs Clinical)
-- 2. Ordered sequence for trial progression
-- 3. Granular subtopic tracking for learning content
-- ============================================

-- 0. Fix column name inconsistency in trial_mock_exams (name -> title)
-- This ensures compatibility if the table was created with the old schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trial_mock_exams' AND column_name = 'name'
  ) THEN
    ALTER TABLE trial_mock_exams RENAME COLUMN name TO title;
  END IF;

  -- Also fix lesson_content order -> display_order
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lesson_content' AND column_name = 'order'
  ) THEN
    ALTER TABLE lesson_content RENAME COLUMN "order" TO display_order;
  END IF;
END $$;

-- 1. Enhance trial_mock_exams table
ALTER TABLE trial_mock_exams 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) CHECK (category IN ('numeracy', 'clinical')),
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 50, -- Percentage
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT 30;

-- Create index for category queries
CREATE INDEX IF NOT EXISTS idx_trial_mock_exams_category ON trial_mock_exams(category);

-- 2. Enhance trial_learning_progress table
-- Add subtopic_id support referencing topics(id) since subtopics are stored there
ALTER TABLE trial_learning_progress
ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES topics(id) ON DELETE CASCADE;

-- Create index for subtopic queries
CREATE INDEX IF NOT EXISTS idx_trial_learning_subtopic ON trial_learning_progress(subtopic_id);

-- 3. Create a view for Trial Progress Summary (Optional but helpful for Analytics)
CREATE OR REPLACE VIEW trial_progress_summary AS
SELECT 
  u.id as user_id,
  u.email,
  -- Practice Progress
  COUNT(DISTINCT tea.id) as practice_attempts,
  MAX(CASE WHEN tme.category = 'numeracy' THEN tea.score ELSE 0 END) as best_numeracy_score,
  MAX(CASE WHEN tme.category = 'clinical' THEN tea.score ELSE 0 END) as best_clinical_score,
  -- Learning Progress
  COUNT(DISTINCT tlp.lesson_id) as lessons_completed,
  COUNT(DISTINCT tlp.id) FILTER (WHERE tlp.is_completed = true) as completed_items
FROM auth.users u
LEFT JOIN trial_exam_attempts tea ON u.id = tea.user_id
LEFT JOIN trial_mock_exams tme ON tea.exam_id = tme.id
LEFT JOIN trial_learning_progress tlp ON u.id = tlp.user_id
GROUP BY u.id, u.email;

-- Grant access to the view
GRANT SELECT ON trial_progress_summary TO authenticated;
