-- Create mock_exam_attempts table
CREATE TABLE IF NOT EXISTS mock_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    part_a_score INTEGER, -- Number of correct answers in Part A (max 15)
    part_a_result VARCHAR(20), -- 'pass', 'fail'
    part_b_score INTEGER, -- Number of correct answers in Part B (max 60)
    part_b_result VARCHAR(20), -- 'pass', 'fail', 'not_attempted'
    total_score INTEGER, -- Total correct answers
    total_time_taken INTEGER DEFAULT 0, -- In seconds
    status VARCHAR(50) NOT NULL CHECK (status IN ('in_progress_part_a', 'in_progress_part_b', 'completed', 'abandoned')),
    final_result VARCHAR(50), -- 'pass', 'fail_numeracy', 'fail_clinical'
    answers JSONB, -- Store detailed answers: { part_a: [...], part_b: [...] }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mock_exam_attempts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own attempts"
    ON mock_exam_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own attempts"
    ON mock_exam_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own attempts"
    ON mock_exam_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- Create RPC for random questions
-- This function fetches random questions for a specific exam part
CREATE OR REPLACE FUNCTION get_random_mock_questions(
    p_exam_part text,
    p_limit int
)
RETURNS SETOF mock_exam_questions
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT *
    FROM mock_exam_questions
    WHERE exam_part = p_exam_part
      AND is_active = true
    ORDER BY random()
    LIMIT p_limit;
$$;
