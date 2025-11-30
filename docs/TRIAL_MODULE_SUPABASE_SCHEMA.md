# Trial Module - Supabase Database Schema

**Document Version:** 1.0  
**Date:** November 30, 2025  
**Database:** Supabase PostgreSQL  
**Purpose:** Complete table definitions with fields, relations, and RLS policies

---

## 1. Table Definitions

### 1.1 modules (Enhanced)

**Purpose:** Store all learning modules including trial module

```sql
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_trial BOOLEAN DEFAULT false,
  order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  icon VARCHAR(255),
  color VARCHAR(7), -- Hex color
  estimated_duration_hours DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Insert Trial Module
INSERT INTO modules (name, slug, description, is_trial, order, is_active)
VALUES (
  'Trial',
  'trial',
  'Free trial with features from all modules',
  true,
  0,
  true
) ON CONFLICT (slug) DO NOTHING;

CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_is_trial ON modules(is_trial);
```

---

### 1.2 module_access_rules (New)

**Purpose:** Define access control rules per module

```sql
CREATE TABLE IF NOT EXISTS module_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL, -- 'free', 'trial', 'subscriber'
  required_subscription_plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  requires_payment BOOLEAN DEFAULT false,
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(module_id, access_type),
  CHECK (access_type IN ('free', 'trial', 'subscriber'))
);

-- Insert Access Rules
INSERT INTO module_access_rules (module_id, access_type, requires_payment, description)
SELECT id, 'free', false, 'Trial module - free for all users'
FROM modules WHERE slug = 'trial'
ON CONFLICT DO NOTHING;

INSERT INTO module_access_rules (module_id, access_type, requires_payment, description)
SELECT id, 'subscriber', true, 'Requires active subscription'
FROM modules WHERE slug IN ('practice', 'learning', 'mock_exam')
ON CONFLICT DO NOTHING;

CREATE INDEX idx_module_access_rules_module ON module_access_rules(module_id);
CREATE INDEX idx_module_access_rules_type ON module_access_rules(access_type);
```

---

### 1.3 topics (Enhanced)

**Purpose:** Learning topics (can belong to any module)

```sql
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trial flag
  is_trial_content BOOLEAN DEFAULT false,
  
  -- Content
  order INTEGER NOT NULL DEFAULT 0,
  estimated_duration_minutes INTEGER,
  learning_outcomes TEXT[], -- Array of learning outcomes
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  UNIQUE(module_id, slug)
);

CREATE INDEX idx_topics_module ON topics(module_id);
CREATE INDEX idx_topics_is_trial ON topics(is_trial_content);
CREATE INDEX idx_topics_slug ON topics(slug);
```

---

### 1.4 lessons (Subtopics - Enhanced)

**Purpose:** Learning subtopics within a topic

```sql
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trial & Unlock
  is_trial_content BOOLEAN DEFAULT false,
  unlock_threshold_percentage INTEGER DEFAULT 80, -- Trial: 60%, Paid: 80%
  requires_unlocking BOOLEAN DEFAULT true,
  
  -- Content
  order INTEGER NOT NULL DEFAULT 0,
  estimated_duration_minutes INTEGER,
  content_summary TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  UNIQUE(topic_id, slug)
);

CREATE INDEX idx_lessons_topic ON lessons(topic_id);
CREATE INDEX idx_lessons_is_trial ON lessons(is_trial_content);
```

---

### 1.5 lesson_content (New)

**Purpose:** Store different content types per lesson (video, audio, text, flashcards, MCQ)

```sql
CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'text', 'flashcard', 'mcq', 'assessment'
  
  -- Content Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order INTEGER NOT NULL DEFAULT 0,
  
  -- Content Storage
  content_url VARCHAR(500), -- For video/audio URLs
  content_text TEXT, -- For text content
  content_data JSONB, -- For complex structures (flashcards, MCQs)
  
  -- Duration (for video/audio)
  duration_seconds INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CHECK (content_type IN ('video', 'audio', 'text', 'flashcard', 'mcq', 'assessment'))
);

-- Flashcard Example in content_data:
-- {
--   "cards": [
--     {"front": "What is asepsis?", "back": "Absence of disease-causing microorganisms"},
--     {"front": "Define sterilization", "back": "Complete elimination of all microorganisms"}
--   ]
-- }

-- MCQ Example in content_data:
-- {
--   "questions": [
--     {
--       "text": "Which of the following...",
--       "options": ["A", "B", "C", "D"],
--       "correct": "B",
--       "explanation": "..."
--     }
--   ]
-- }

CREATE INDEX idx_lesson_content_lesson ON lesson_content(lesson_id);
CREATE INDEX idx_lesson_content_type ON lesson_content(content_type);
```

---

### 1.6 questions (Enhanced)

**Purpose:** Questions for practice and exams

```sql
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  
  -- Question Type & Category
  question_type VARCHAR(50) NOT NULL, -- 'mcq', 'numerical', 'clinical_scenario'
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  category VARCHAR(100), -- 'Numerical', 'Clinical', 'Patient Safety', etc.
  subcategory VARCHAR(100),
  
  -- Trial Specific
  is_trial_content BOOLEAN DEFAULT false,
  trial_order INTEGER, -- Custom ordering for trial questions
  
  -- Question Content
  question_text TEXT NOT NULL,
  question_context TEXT, -- For scenarios
  
  -- MCQ Specific
  options JSONB, -- Array of option texts
  correct_answer VARCHAR(500), -- Can be "A", "10", "B", etc.
  acceptable_range DECIMAL(10,2), -- For numerical questions
  unit VARCHAR(50), -- For numerical questions (ml, mg, etc.)
  
  -- Metadata
  explanation TEXT,
  hint TEXT,
  topic_reference VARCHAR(255),
  points INTEGER DEFAULT 1,
  time_limit_seconds INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CHECK (question_type IN ('mcq', 'numerical', 'clinical_scenario')),
  CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

CREATE INDEX idx_questions_module ON questions(module_id);
CREATE INDEX idx_questions_lesson ON questions(lesson_id);
CREATE INDEX idx_questions_is_trial ON questions(is_trial_content);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
```

---

### 1.7 trial_attempt_records (New)

**Purpose:** Track user attempts in trial module sections

```sql
CREATE TABLE IF NOT EXISTS trial_attempt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Section Type
  content_type VARCHAR(50) NOT NULL, -- 'practice', 'learning', 'mock_exam'
  section_type VARCHAR(100), -- 'numerical', 'clinical', 'subtopic_1', 'exam'
  
  -- Performance Data
  total_questions INTEGER,
  correct_answers INTEGER,
  score INTEGER,
  percentage_score DECIMAL(5,2),
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Status
  is_passed BOOLEAN,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  
  -- Detailed Answers
  answers_data JSONB, -- {question_id: answer, ...}
  question_details JSONB, -- Cached question details
  
  -- Metadata
  device_type VARCHAR(50),
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (content_type IN ('practice', 'learning', 'mock_exam')),
  CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE INDEX idx_trial_attempts_user ON trial_attempt_records(user_id);
CREATE INDEX idx_trial_attempts_module ON trial_attempt_records(module_id);
CREATE INDEX idx_trial_attempts_content ON trial_attempt_records(content_type);
CREATE INDEX idx_trial_attempts_created ON trial_attempt_records(created_at);
CREATE INDEX idx_trial_attempts_user_module ON trial_attempt_records(user_id, module_id);
```

---

### 1.8 trial_learning_progress (New)

**Purpose:** Track user progress through trial learning modules (subtopic unlocks, assessments)

```sql
CREATE TABLE IF NOT EXISTS trial_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Progress Status
  is_started BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  is_unlocked BOOLEAN DEFAULT false, -- Next subtopic unlock status
  
  -- Assessment Performance
  assessment_score INTEGER, -- Score on subtopic assessment
  assessment_percentage DECIMAL(5,2),
  assessment_passed BOOLEAN,
  assessment_attempts INTEGER DEFAULT 0,
  
  -- Content Viewing
  content_viewed JSONB, -- {content_id: true/false} - which content types viewed
  estimated_time_spent_minutes INTEGER,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_trial_learning_user ON trial_learning_progress(user_id);
CREATE INDEX idx_trial_learning_topic ON trial_learning_progress(topic_id);
CREATE INDEX idx_trial_learning_lesson ON trial_learning_progress(lesson_id);
CREATE INDEX idx_trial_learning_unlocked ON trial_learning_progress(is_unlocked);
```

---

### 1.9 trial_mock_exams (New)

**Purpose:** Specific mock exam instances for trial

```sql
CREATE TABLE IF NOT EXISTS trial_mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Exam Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Exam Configuration
  question_count INTEGER NOT NULL, -- Usually 20 for trial
  time_limit_minutes INTEGER NOT NULL, -- Usually 30 for trial
  passing_score INTEGER NOT NULL, -- Usually 50 for trial
  
  -- Questions
  question_ids UUID[] NOT NULL, -- Array of question IDs
  
  -- Features
  allow_mark_for_review BOOLEAN DEFAULT true,
  allow_answer_changes BOOLEAN DEFAULT true,
  show_question_navigator BOOLEAN DEFAULT true,
  auto_submit_at_time_limit BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_trial_mock_exams_module ON trial_mock_exams(module_id);
```

---

### 1.10 trial_exam_attempts (New)

**Purpose:** User attempts at trial mock exams

```sql
CREATE TABLE IF NOT EXISTS trial_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES trial_mock_exams(id) ON DELETE CASCADE,
  
  -- Performance
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER,
  incorrect_answers INTEGER,
  score DECIMAL(5,2),
  percentage_score DECIMAL(5,2),
  is_passed BOOLEAN,
  
  -- Answers
  user_answers JSONB, -- {question_id: answer, ...}
  marked_for_review JSONB, -- {question_id: true/false}
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER,
  
  -- Topic Breakdown (cached)
  topic_scores JSONB, -- {topic_name: score, percentage, status}
  
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- 'in_progress', 'completed', 'abandoned'
  
  -- Metadata
  device_type VARCHAR(50),
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, exam_id)
);

CREATE INDEX idx_trial_exam_attempts_user ON trial_exam_attempts(user_id);
CREATE INDEX idx_trial_exam_attempts_exam ON trial_exam_attempts(exam_id);
CREATE INDEX idx_trial_exam_attempts_passed ON trial_exam_attempts(is_passed);
```

---

### 1.11 trial_analytics (View)

**Purpose:** Analytics dashboard for trial module

```sql
CREATE OR REPLACE VIEW trial_analytics AS
SELECT 
  COUNT(DISTINCT tar.user_id) as total_trial_users,
  COUNT(DISTINCT tar.id) as total_attempts,
  
  -- By Content Type
  COUNT(DISTINCT CASE WHEN tar.content_type = 'practice' THEN tar.user_id END) as practice_users,
  COUNT(DISTINCT CASE WHEN tar.content_type = 'learning' THEN tar.user_id END) as learning_users,
  COUNT(DISTINCT CASE WHEN tar.content_type = 'mock_exam' THEN tar.user_id END) as exam_users,
  
  -- Completion Rates
  COUNT(CASE WHEN tar.status = 'completed' THEN 1 END)::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100 as completion_rate_percentage,
  
  -- Scores
  AVG(tar.score) as avg_score,
  MAX(tar.score) as max_score,
  MIN(tar.score) as min_score,
  
  -- Timing
  AVG(tar.duration_seconds) / 60 as avg_duration_minutes,
  
  -- Date Range
  DATE(MIN(tar.created_at)) as first_attempt_date,
  DATE(MAX(tar.created_at)) as last_attempt_date,
  
  -- Conversion (to paid)
  COUNT(DISTINCT CASE 
    WHEN s.status = 'active' THEN tar.user_id 
  END) as converted_to_paid,
  
  COUNT(DISTINCT tar.user_id) as trial_to_paid_rate_percent
  
FROM trial_attempt_records tar
LEFT JOIN subscriptions s ON tar.user_id = s.user_id 
  AND s.created_at > tar.completed_at
  AND s.status = 'active'
WHERE tar.created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1 = 1;
```

---

## 2. Relationships & Constraints

### Entity Relationship Diagram

```
modules (1) ──── (many) topics
   │                     │
   │                     └──── (many) lessons
   │                            └──── (many) lesson_content
   │                            └──── (many) trial_learning_progress
   │
   ├──── (many) questions
   │    └──── (many) trial_attempt_records
   │
   ├──── (many) module_access_rules
   │
   ├──── (many) trial_mock_exams
   │    └──── (many) trial_exam_attempts
   │
   └──── (many) trial_attempt_records

user_profiles (1) ──── (many) trial_attempt_records
             │
             ├──── (many) trial_learning_progress
             │
             └──── (many) trial_exam_attempts

subscription_plans (1) ──── (many) module_access_rules
```

---

## 3. RLS (Row Level Security) Policies

### 3.1 modules - Public Read Access

```sql
-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active modules
CREATE POLICY "modules_read_public"
ON modules FOR SELECT
USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "modules_admin_all"
ON modules FOR ALL
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'superadmin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'superadmin');
```

---

### 3.2 module_access_rules - Public Read Access

```sql
ALTER TABLE module_access_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read access rules
CREATE POLICY "access_rules_read_public"
ON module_access_rules FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage
CREATE POLICY "access_rules_admin_all"
ON module_access_rules FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.3 topics - Public Read (Trial Topics Visible to All)

```sql
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read trial topics
CREATE POLICY "topics_read_trial"
ON topics FOR SELECT
USING (is_trial_content = true OR is_active = true);

-- Policy: Users can read topics if they have module access
CREATE POLICY "topics_read_with_access"
ON topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM module_access_rules mar
    WHERE mar.module_id = topics.module_id
    AND mar.access_type = 'free'
  )
  OR
  EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
  )
);

-- Policy: Admins can manage
CREATE POLICY "topics_admin_all"
ON topics FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.4 lessons - Public Read (Trial Lessons)

```sql
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read trial lessons
CREATE POLICY "lessons_read_trial"
ON lessons FOR SELECT
USING (is_trial_content = true);

-- Policy: Subscribed users can read all lessons
CREATE POLICY "lessons_read_subscribed"
ON lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
  )
);

-- Policy: Admins can manage
CREATE POLICY "lessons_admin_all"
ON lessons FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.5 lesson_content - Public Read (Trial Content)

```sql
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read trial lesson content
CREATE POLICY "lesson_content_read_trial"
ON lesson_content FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    WHERE l.id = lesson_content.lesson_id
    AND l.is_trial_content = true
  )
);

-- Policy: Subscribed users can read all content
CREATE POLICY "lesson_content_read_subscribed"
ON lesson_content FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM lessons l
    WHERE l.id = lesson_content.lesson_id
    AND EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid()
      AND s.status = 'active'
    )
  )
);

-- Policy: Admins can manage
CREATE POLICY "lesson_content_admin_all"
ON lesson_content FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.6 questions - Public Read (Trial Questions)

```sql
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read trial questions
CREATE POLICY "questions_read_trial"
ON questions FOR SELECT
USING (is_trial_content = true);

-- Policy: Subscribed users can read all questions
CREATE POLICY "questions_read_subscribed"
ON questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
  )
);

-- Policy: Admins can manage
CREATE POLICY "questions_admin_all"
ON questions FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.7 trial_attempt_records - User & Admin Access

```sql
ALTER TABLE trial_attempt_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/insert their own attempts
CREATE POLICY "trial_attempts_user_own"
ON trial_attempt_records FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "trial_attempts_user_insert"
ON trial_attempt_records FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "trial_attempts_user_update"
ON trial_attempt_records FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can read all
CREATE POLICY "trial_attempts_admin_read"
ON trial_attempt_records FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));

-- Policy: Admins can delete
CREATE POLICY "trial_attempts_admin_delete"
ON trial_attempt_records FOR DELETE
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.8 trial_learning_progress - User & Admin Access

```sql
ALTER TABLE trial_learning_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/write their own progress
CREATE POLICY "trial_learning_user_own"
ON trial_learning_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "trial_learning_user_insert"
ON trial_learning_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "trial_learning_user_update"
ON trial_learning_progress FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can read all
CREATE POLICY "trial_learning_admin_read"
ON trial_learning_progress FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.9 trial_mock_exams - Public Read, Admin Write

```sql
ALTER TABLE trial_mock_exams ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active exams
CREATE POLICY "trial_exams_read_public"
ON trial_mock_exams FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage
CREATE POLICY "trial_exams_admin_all"
ON trial_mock_exams FOR ALL
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

### 3.10 trial_exam_attempts - User & Admin Access

```sql
ALTER TABLE trial_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own attempts
CREATE POLICY "trial_exam_attempts_user_read"
ON trial_exam_attempts FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert their own attempts
CREATE POLICY "trial_exam_attempts_user_insert"
ON trial_exam_attempts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own in-progress attempts
CREATE POLICY "trial_exam_attempts_user_update"
ON trial_exam_attempts FOR UPDATE
USING (user_id = auth.uid() AND status = 'in_progress')
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can read all
CREATE POLICY "trial_exam_attempts_admin_read"
ON trial_exam_attempts FOR SELECT
USING (auth.jwt() ->> 'role' IN ('admin', 'superadmin'));
```

---

## 4. Helper Functions (PL/pgSQL)

### 4.1 Check Module Access

```sql
CREATE OR REPLACE FUNCTION check_module_access(
  p_user_id UUID,
  p_module_id UUID
) RETURNS TABLE(
  can_access BOOLEAN,
  access_type VARCHAR,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH module_info AS (
    SELECT m.id, m.is_trial, mar.access_type
    FROM modules m
    LEFT JOIN module_access_rules mar ON m.id = mar.module_id
    WHERE m.id = p_module_id AND m.is_active = true
  ),
  user_subscription AS (
    SELECT COUNT(*) > 0 as has_active_subscription
    FROM subscriptions
    WHERE user_id = p_user_id AND status = 'active'
  )
  SELECT
    CASE 
      WHEN mi.is_trial THEN true
      WHEN us.has_active_subscription THEN true
      ELSE false
    END as can_access,
    COALESCE(mi.access_type, 'none') as access_type,
    CASE 
      WHEN mi.is_trial THEN 'Trial module - free access'
      WHEN us.has_active_subscription THEN 'Active subscription'
      ELSE 'No access - subscription required'
    END as message
  FROM module_info mi, user_subscription us;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.2 Get Trial Progress

```sql
CREATE OR REPLACE FUNCTION get_trial_progress(
  p_user_id UUID
) RETURNS TABLE(
  practice_score DECIMAL,
  learning_completed BOOLEAN,
  exam_score DECIMAL,
  last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(CASE WHEN tar.content_type = 'practice' THEN tar.percentage_score END)::DECIMAL,
    MAX(CASE WHEN tar.content_type = 'learning' THEN tar.status = 'completed' END)::BOOLEAN,
    MAX(CASE WHEN tar.content_type = 'mock_exam' THEN tar.percentage_score END)::DECIMAL,
    MAX(tar.updated_at)
  FROM trial_attempt_records tar
  WHERE tar.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 Trial to Paid Conversion

```sql
CREATE OR REPLACE FUNCTION track_trial_to_paid_conversion(
  p_user_id UUID,
  p_plan_id UUID
) RETURNS TABLE(
  conversion_recorded BOOLEAN,
  trial_duration_days INTEGER,
  conversions_count INTEGER
) AS $$
DECLARE
  v_first_trial DATE;
  v_conversion_days INTEGER;
BEGIN
  -- Get first trial attempt date
  SELECT DATE(MIN(created_at)) INTO v_first_trial
  FROM trial_attempt_records
  WHERE user_id = p_user_id;
  
  -- Calculate days from trial to conversion
  v_conversion_days := CASE 
    WHEN v_first_trial IS NOT NULL 
    THEN DATE_PART('days', CURRENT_DATE - v_first_trial)::INTEGER
    ELSE NULL
  END;
  
  RETURN QUERY
  SELECT
    true as conversion_recorded,
    v_conversion_days as trial_duration_days,
    (SELECT COUNT(*) FROM subscriptions WHERE user_id = p_user_id)::INTEGER as conversions_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Triggers & Automated Actions

### 5.1 Auto-update trial_learning_progress on Assessment Complete

```sql
CREATE OR REPLACE FUNCTION auto_update_learning_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- If learning assessment is completed with passing score
  IF NEW.content_type = 'learning' 
     AND NEW.status = 'completed' 
     AND NEW.percentage_score >= 60 THEN
    
    UPDATE trial_learning_progress
    SET 
      is_completed = true,
      is_unlocked = true,
      completed_at = NEW.completed_at
    WHERE lesson_id IN (
      SELECT id FROM lessons WHERE id IN (
        SELECT DISTINCT lesson_id FROM trial_attempt_records 
        WHERE user_id = NEW.user_id AND content_type = 'learning'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_learning_progress
AFTER INSERT OR UPDATE ON trial_attempt_records
FOR EACH ROW
EXECUTE FUNCTION auto_update_learning_progress();
```

### 5.2 Auto-update timestamp on modification

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all trial tables
CREATE TRIGGER trg_modules_updated
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_topics_updated
BEFORE UPDATE ON topics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lessons_updated
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ... and so on for other tables
```

---

## 6. Complete Setup Script

```sql
-- Run all table creations, indexes, RLS policies, and functions
-- in order to fully set up the trial module schema

-- 1. Create tables (in dependency order)
-- modules → topics → lessons → lesson_content → questions
-- trial_attempt_records, trial_learning_progress
-- trial_mock_exams → trial_exam_attempts

-- 2. Create indexes

-- 3. Enable RLS on all tables

-- 4. Create RLS policies

-- 5. Create helper functions

-- 6. Create triggers

-- 7. Insert default data (Trial module, access rules)

-- 8. Test data seed (optional for development)
```

---

## 7. Data Validation Queries

### Verify Module Access

```sql
-- Check which users can access which modules
SELECT DISTINCT
  u.id as user_id,
  u.email,
  m.name as module_name,
  CASE 
    WHEN m.is_trial THEN 'Free (Trial)'
    WHEN s.status = 'active' THEN 'Subscribed'
    ELSE 'No Access'
  END as access_status
FROM user_profiles u
CROSS JOIN modules m
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE m.is_active = true
ORDER BY u.id, m.order;
```

### Trial Analytics Detailed

```sql
-- Get detailed trial analytics
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM trial_attempt_records) as total_trial_users,
  (SELECT COUNT(DISTINCT user_id) 
   FROM trial_attempt_records 
   WHERE content_type = 'practice') as practice_section_users,
  (SELECT COUNT(DISTINCT user_id) 
   FROM trial_attempt_records 
   WHERE content_type = 'learning') as learning_section_users,
  (SELECT COUNT(DISTINCT user_id) 
   FROM trial_exam_attempts) as mock_exam_users,
  (SELECT ROUND(AVG(percentage_score), 2) 
   FROM trial_attempt_records 
   WHERE percentage_score IS NOT NULL) as avg_score,
  (SELECT COUNT(*) 
   FROM trial_exam_attempts 
   WHERE is_passed = true) as passed_exams;
```

---

**Document Status:** Complete - Ready for Database Implementation

**Next Steps:**
1. Run all table creation scripts
2. Enable RLS policies
3. Create helper functions
4. Seed trial module and access rules
5. Test data access with different user roles
