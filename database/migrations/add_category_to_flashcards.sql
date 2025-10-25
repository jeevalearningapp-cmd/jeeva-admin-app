-- ============================================
-- Add Category Support to Flashcards
-- Enables topic-level flashcard organization for Learning Module
-- Run this in your Supabase SQL Editor AFTER restructure_for_nmc_modules.sql
-- ============================================

-- Step 1: Add category column to flashcards table
-- This allows flashcards to be associated with Learning Module topics
-- (Numeracy, NMC Code, Mental Capacity Act, Safeguarding, etc.)
ALTER TABLE flashcards
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Step 2: Create index for efficient category-based queries
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- Step 3: Make lesson_id nullable since flashcards can now belong to topics instead
-- This maintains backward compatibility while enabling new topic-level organization
ALTER TABLE flashcards
ALTER COLUMN lesson_id DROP NOT NULL;

-- Add comment to explain the new structure
COMMENT ON COLUMN flashcards.category IS 'Learning Module topic (e.g., Numeracy, NMC Code) for topic-level flashcard organization. Used instead of lesson_id for NMC structure.';
