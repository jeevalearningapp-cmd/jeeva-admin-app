-- Add subtopic_id to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS subtopic_id UUID REFERENCES topics(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lessons_subtopic_id ON lessons(subtopic_id);
