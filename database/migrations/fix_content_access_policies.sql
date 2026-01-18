-- ============================================
-- Fix User Access Policies
-- Grants SELECT access to authenticated users for content tables
-- ============================================

-- 1. Modules: Allow all authenticated users to view active modules
CREATE POLICY "Authenticated users can view active modules"
ON modules FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. Topics: Allow all authenticated users to view active topics
CREATE POLICY "Authenticated users can view active topics"
ON topics FOR SELECT
TO authenticated
USING (is_active = true);

-- 3. Lessons: Allow viewing if Trial Content OR User Subscribed
CREATE POLICY "Authenticated users can view lessons"
ON lessons FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    is_trial_content = true
    OR EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = auth.uid() AND s.status = 'active'
    )
  )
);

-- 4. Mock Exam Questions (Renamed from questions)
-- These are used for Mock Exams. Access should be allowed if the user is taking an exam.
-- Often these are loaded via RPC or API that bypasses RLS, but if using direct select:
-- We'll allow authenticated users to view active mock exam questions.
-- Ideally this should be restricted to "Active Exam Attempt", but for now enabling read access for authenticated users to unblock functionality.
CREATE POLICY "Authenticated users can view active_mock_exam_questions"
ON mock_exam_questions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view active_mock_exam_question_options"
ON mock_exam_question_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mock_exam_questions q
    WHERE q.id = mock_exam_question_options.question_id
    AND q.is_active = true
  )
);

-- 5. Practice Questions (New table)
CREATE POLICY "Authenticated users can view active_practice_questions"
ON practice_questions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view active_practice_question_options"
ON practice_question_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM practice_questions q
    WHERE q.id = practice_question_options.question_id
    AND q.is_active = true
  )
);

-- 6. Learning Questions (New table, linked to lessons)
CREATE POLICY "Authenticated users can view active_learning_questions"
ON learning_questions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Authenticated users can view active_learning_question_options"
ON learning_question_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM learning_questions q
    WHERE q.id = learning_question_options.question_id
    AND q.is_active = true
  )
);

-- 7. Flashcards
CREATE POLICY "Authenticated users can view active flashcards"
ON flashcards FOR SELECT
TO authenticated
USING (
  is_active = true AND (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = flashcards.lesson_id
      AND (
        l.is_trial_content = true
        OR EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = auth.uid() AND s.status = 'active'
        )
      )
    )
  )
);
