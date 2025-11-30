-- Trial Module Schema - Clean Migration
-- ONLY new tables and columns, NO conflicts with existing RLS
-- Date: November 30, 2025

-- ============================================================================
-- 1. Add columns to existing tables (safe, non-destructive)
-- ============================================================================

ALTER TABLE modules ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS icon VARCHAR(255);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS color VARCHAR(7);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS estimated_duration_hours DECIMAL(5,2);

ALTER TABLE topics ADD COLUMN IF NOT EXISTS is_trial_content BOOLEAN DEFAULT false;

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_trial_content BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS unlock_threshold_percentage INTEGER DEFAULT 80;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS requires_unlocking BOOLEAN DEFAULT true;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_trial_content BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS trial_order INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS acceptable_range DECIMAL(10,2);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_modules_is_trial ON modules(is_trial);
CREATE INDEX IF NOT EXISTS idx_topics_is_trial ON topics(is_trial_content);
CREATE INDEX IF NOT EXISTS idx_lessons_is_trial ON lessons(is_trial_content);
CREATE INDEX IF NOT EXISTS idx_questions_is_trial ON questions(is_trial_content);

-- Insert Trial Module (if not exists)
INSERT INTO modules (name, slug, description, is_trial, "order", is_active)
VALUES (
  'Trial',
  'trial',
  'Free trial with features from all modules',
  true,
  0,
  true
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. NEW TABLE: module_access_rules
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL,
  required_subscription_plan_id UUID,
  requires_payment BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, access_type),
  CHECK (access_type IN ('free', 'trial', 'subscriber'))
);

CREATE INDEX IF NOT EXISTS idx_module_access_rules_module ON module_access_rules(module_id);
CREATE INDEX IF NOT EXISTS idx_module_access_rules_type ON module_access_rules(access_type);

-- ============================================================================
-- 3. NEW TABLE: lesson_content
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  content_url VARCHAR(500),
  content_text TEXT,
  content_data JSONB,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  CHECK (content_type IN ('video', 'audio', 'text', 'flashcard', 'mcq', 'assessment'))
);

CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson ON lesson_content(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_type ON lesson_content(content_type);

-- ============================================================================
-- 4. NEW TABLE: trial_attempt_records
-- ============================================================================

CREATE TABLE IF NOT EXISTS trial_attempt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL,
  section_type VARCHAR(100),
  total_questions INTEGER,
  correct_answers INTEGER,
  score INTEGER,
  percentage_score DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  is_passed BOOLEAN,
  status VARCHAR(50) DEFAULT 'in_progress',
  answers_data JSONB,
  question_details JSONB,
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (content_type IN ('practice', 'learning', 'mock_exam')),
  CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_trial_attempts_user ON trial_attempt_records(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_attempts_module ON trial_attempt_records(module_id);
CREATE INDEX IF NOT EXISTS idx_trial_attempts_content ON trial_attempt_records(content_type);
CREATE INDEX IF NOT EXISTS idx_trial_attempts_created ON trial_attempt_records(created_at);

-- ============================================================================
-- 5. NEW TABLE: trial_learning_progress
-- ============================================================================

CREATE TABLE IF NOT EXISTS trial_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_started BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_unlocked BOOLEAN DEFAULT false,
  assessment_score INTEGER,
  assessment_percentage DECIMAL(5,2),
  assessment_passed BOOLEAN,
  assessment_attempts INTEGER DEFAULT 0,
  content_viewed JSONB,
  estimated_time_spent_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_trial_learning_user ON trial_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_learning_topic ON trial_learning_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_trial_learning_lesson ON trial_learning_progress(lesson_id);

-- ============================================================================
-- 6. NEW TABLE: trial_mock_exams
-- ============================================================================

CREATE TABLE IF NOT EXISTS trial_mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  question_ids UUID[] NOT NULL,
  allow_mark_for_review BOOLEAN DEFAULT true,
  allow_answer_changes BOOLEAN DEFAULT true,
  show_question_navigator BOOLEAN DEFAULT true,
  auto_submit_at_time_limit BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_trial_mock_exams_module ON trial_mock_exams(module_id);

-- ============================================================================
-- 7. NEW TABLE: trial_exam_attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS trial_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES trial_mock_exams(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER,
  incorrect_answers INTEGER,
  score DECIMAL(5,2),
  percentage_score DECIMAL(5,2),
  is_passed BOOLEAN,
  user_answers JSONB,
  marked_for_review JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER,
  topic_scores JSONB,
  status VARCHAR(50) DEFAULT 'completed',
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_trial_exam_attempts_user ON trial_exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_exam_attempts_exam ON trial_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_trial_exam_attempts_passed ON trial_exam_attempts(is_passed);

-- ============================================================================
-- 8. Enable RLS on NEW tables only (not on existing tables)
-- ============================================================================

ALTER TABLE module_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_attempt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_exam_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS Policies for NEW tables only
-- ============================================================================

-- module_access_rules
CREATE POLICY module_access_rules_read ON module_access_rules
FOR SELECT USING (is_active = true);

CREATE POLICY module_access_rules_admin ON module_access_rules
FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- lesson_content
CREATE POLICY lesson_content_read_trial ON lesson_content
FOR SELECT USING (
  EXISTS (SELECT 1 FROM lessons l WHERE l.id = lesson_content.lesson_id AND l.is_trial_content = true)
);

CREATE POLICY lesson_content_admin ON lesson_content
FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- trial_attempt_records
CREATE POLICY trial_attempts_user ON trial_attempt_records
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY trial_attempts_user_insert ON trial_attempt_records
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY trial_attempts_admin ON trial_attempt_records
FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- trial_learning_progress
CREATE POLICY trial_learning_user ON trial_learning_progress
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY trial_learning_user_insert ON trial_learning_progress
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY trial_learning_admin ON trial_learning_progress
FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- trial_mock_exams
CREATE POLICY trial_exams_read ON trial_mock_exams
FOR SELECT USING (is_active = true);

CREATE POLICY trial_exams_admin ON trial_mock_exams
FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- trial_exam_attempts
CREATE POLICY trial_exam_attempts_user ON trial_exam_attempts
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY trial_exam_attempts_user_insert ON trial_exam_attempts
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY trial_exam_attempts_admin ON trial_exam_attempts
FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
