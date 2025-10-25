-- ============================================
-- Add Subtopic Support to Lessons Table
-- Enables hierarchical topic → subtopic → lesson structure for Learning Module
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Add category column to lessons table
-- This stores the subtopic (e.g., "1.1 Prioritise People", "2.1 Presumption of Capacity")
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Step 2: Create index for efficient category-based queries
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);

-- Step 3: Add comment to explain the structure
COMMENT ON COLUMN lessons.category IS 'Subtopic identifier (e.g., "1.1 Prioritise People", "3.1 Recognising Abuse") for hierarchical organization within Learning Module topics.';

-- ============================================
-- Learning Module Hierarchical Structure
-- ============================================
-- Topic 1: The NMC Code
--   1.1 Prioritise People
--   1.2 Practice Effectively
--   1.3 Preserve Safety
--   1.4 Promote Professionalism
-- Topic 2: Mental Capacity Act
--   2.1 Presumption of Capacity
--   2.2 Assessing Capacity
--   2.3 Best Interests Decisions
--   2.4 Advanced Care Planning
-- Topic 3: Safeguarding
--   3.1 Recognising Abuse
--   3.2 Reporting Protocols
--   3.3 Child Protection
-- Topic 4: Consent & Confidentiality
--   4.1 Valid Consent
--   4.2 GDPR & Confidentiality
--   4.3 Confidentiality vs. Safeguarding
-- Topic 5: Equality & Diversity
--   5.1 Equality Act 2010
--   5.2 Cultural Competence
--   5.3 Reasonable Adjustments
-- Topic 6: Duty of Candour
--   6.1 Transparency After Errors
--   6.2 NHS Incident Reporting
-- Topic 7: Cultural Adaptation
--   7.1 Autonomy vs. Family Decisions
--   7.2 UK Communication Styles
-- ============================================
