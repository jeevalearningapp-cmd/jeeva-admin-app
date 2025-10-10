-- ============================================
-- Learning Completions Table
-- Tracks user progress through lessons
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create learning_completions table
CREATE TABLE IF NOT EXISTS learning_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_learning_completions_user_id ON learning_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_lesson_id ON learning_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_completions_completed ON learning_completions(is_completed) WHERE is_completed = true;
CREATE INDEX IF NOT EXISTS idx_learning_completions_completed_at ON learning_completions(completed_at);

-- Enable Row Level Security
ALTER TABLE learning_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access
CREATE POLICY "Superadmins can view all learning_completions" 
ON learning_completions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'superadmin' AND is_active = true));

CREATE POLICY "Editors can view learning_completions" 
ON learning_completions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'editor' AND is_active = true));

CREATE POLICY "Moderators can view learning_completions" 
ON learning_completions FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'moderator' AND is_active = true));

-- Optional: Policies for regular users to track their own progress
CREATE POLICY "Users can view their own completions" 
ON learning_completions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own completions" 
ON learning_completions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own completions" 
ON learning_completions FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- Complete! ✅
-- This table will track user lesson completions
-- and power the analytics dashboard
-- ============================================
