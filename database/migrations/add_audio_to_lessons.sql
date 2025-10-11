-- ============================================
-- Add Audio Support to Lessons
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add audio_url column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add index for audio_url to improve query performance
CREATE INDEX IF NOT EXISTS idx_lessons_audio_url ON lessons(audio_url) 
WHERE audio_url IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN lessons.audio_url IS 'URL to audio/podcast file (mp3, wav) for the lesson';
