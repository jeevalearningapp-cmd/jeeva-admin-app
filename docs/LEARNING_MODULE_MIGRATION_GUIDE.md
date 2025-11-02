# Learning Module Structure Migration Guide

## Overview
This guide documents the migration needed for the Learning Module structure update where:
- **Numeracy** topic now has 4 subtopics (previously had none)
- All subtopic IDs have been renumbered to accommodate the change

## Migration Required

### Affected Database Tables
The following tables use subtopic IDs that need to be updated:

1. **lessons**
   - Column: `category` (stores subtopic ID like "1.1", "2.2", etc.)
   
2. **questions**
   - Column: `subdivision` (stores subtopic ID)
   
3. **flashcards**
   - Column: `category` (stores subtopic ID)
   
4. **learning_progress** (if exists)
   - Column: `subtopic_id` (stores subtopic ID)

### Subtopic ID Mapping

| Old ID | Old Topic | New ID | New Topic |
|--------|-----------|--------|-----------|
| N/A (no subtopics) | Numeracy | 1.1 | Numeracy → Dosage Calculations |
| N/A (no subtopics) | Numeracy | 1.2 | Numeracy → Unit Conversions |
| N/A (no subtopics) | Numeracy | 1.3 | Numeracy → IV Flow Rate Calculations |
| N/A (no subtopics) | Numeracy | 1.4 | Numeracy → Fluid Balance |
| 1.1 | The NMC Code → Prioritise People | 2.1 | The NMC Code → Prioritise People |
| 1.2 | The NMC Code → Practice Effectively | 2.2 | The NMC Code → Practice Effectively |
| 1.3 | The NMC Code → Preserve Safety | 2.3 | The NMC Code → Preserve Safety |
| 1.4 | The NMC Code → Promote Professionalism | 2.4 | The NMC Code → Promote Professionalism |
| 2.1 | Mental Capacity Act → Presumption of Capacity | 3.1 | Mental Capacity Act → Presumption of Capacity |
| 2.2 | Mental Capacity Act → Assessing Capacity | 3.2 | Mental Capacity Act → Assessing Capacity |
| 2.3 | Mental Capacity Act → Best Interests Decisions | 3.3 | Mental Capacity Act → Best Interests Decisions |
| 2.4 | Mental Capacity Act → Advanced Care Planning | 3.4 | Mental Capacity Act → Advanced Care Planning |
| 3.1 | Safeguarding → Recognising Abuse | 4.1 | Safeguarding → Recognising Abuse |
| 3.2 | Safeguarding → Reporting Protocols | 4.2 | Safeguarding → Reporting Protocols |
| 3.3 | Safeguarding → Child Protection | 4.3 | Safeguarding → Child Protection |
| 4.1 | Consent & Confidentiality → Valid Consent | 5.1 | Consent & Confidentiality → Valid Consent |
| 4.2 | Consent & Confidentiality → GDPR & Confidentiality | 5.2 | Consent & Confidentiality → GDPR & Confidentiality |
| 4.3 | Consent & Confidentiality → Confidentiality vs. Safeguarding | 5.3 | Consent & Confidentiality → Confidentiality vs. Safeguarding |
| 5.1 | Equality & Diversity → Equality Act 2010 | 6.1 | Equality & Diversity → Equality Act 2010 |
| 5.2 | Equality & Diversity → Cultural Competence | 6.2 | Equality & Diversity → Cultural Competence |
| 5.3 | Equality & Diversity → Reasonable Adjustments | 6.3 | Equality & Diversity → Reasonable Adjustments |
| 6.1 | Duty of Candour → Transparency After Errors | 7.1 | Duty of Candour → Transparency After Errors |
| 6.2 | Duty of Candour → NHS Incident Reporting | 7.2 | Duty of Candour → NHS Incident Reporting |
| 7.1 | Cultural Adaptation → Autonomy vs. Family Decisions | 8.1 | Cultural Adaptation → Autonomy vs. Family Decisions |
| 7.2 | Cultural Adaptation → UK Communication Styles | 8.2 | Cultural Adaptation → UK Communication Styles |

## Migration SQL Scripts

### Step 1: Backup Current Data
```sql
-- Create backup tables before migration
CREATE TABLE lessons_backup AS SELECT * FROM lessons;
CREATE TABLE questions_backup AS SELECT * FROM questions;
CREATE TABLE flashcards_backup AS SELECT * FROM flashcards;
```

### Step 2: Update Lessons Table
```sql
-- Update lessons.category from old IDs to new IDs
-- Reverse order to avoid ID collisions during update

-- Cultural Adaptation (7.x → 8.x)
UPDATE lessons SET category = '8.2' WHERE category = '7.2';
UPDATE lessons SET category = '8.1' WHERE category = '7.1';

-- Duty of Candour (6.x → 7.x)
UPDATE lessons SET category = '7.2' WHERE category = '6.2';
UPDATE lessons SET category = '7.1' WHERE category = '6.1';

-- Equality & Diversity (5.x → 6.x)
UPDATE lessons SET category = '6.3' WHERE category = '5.3';
UPDATE lessons SET category = '6.2' WHERE category = '5.2';
UPDATE lessons SET category = '6.1' WHERE category = '5.1';

-- Consent & Confidentiality (4.x → 5.x)
UPDATE lessons SET category = '5.3' WHERE category = '4.3';
UPDATE lessons SET category = '5.2' WHERE category = '4.2';
UPDATE lessons SET category = '5.1' WHERE category = '4.1';

-- Safeguarding (3.x → 4.x)
UPDATE lessons SET category = '4.3' WHERE category = '3.3';
UPDATE lessons SET category = '4.2' WHERE category = '3.2';
UPDATE lessons SET category = '4.1' WHERE category = '3.1';

-- Mental Capacity Act (2.x → 3.x)
UPDATE lessons SET category = '3.4' WHERE category = '2.4';
UPDATE lessons SET category = '3.3' WHERE category = '2.3';
UPDATE lessons SET category = '3.2' WHERE category = '2.2';
UPDATE lessons SET category = '3.1' WHERE category = '2.1';

-- The NMC Code (1.x → 2.x)
UPDATE lessons SET category = '2.4' WHERE category = '1.4';
UPDATE lessons SET category = '2.3' WHERE category = '1.3';
UPDATE lessons SET category = '2.2' WHERE category = '1.2';
UPDATE lessons SET category = '2.1' WHERE category = '1.1';

-- Numeracy: If lessons exist with topic_id for Numeracy but no category,
-- they need to be assigned to appropriate new subtopics (1.1-1.4)
-- This requires manual review based on lesson content
```

### Step 3: Update Questions Table
```sql
-- Update questions.subdivision from old IDs to new IDs
-- Reverse order to avoid ID collisions

-- Cultural Adaptation (7.x → 8.x)
UPDATE questions SET subdivision = '8.2' WHERE subdivision = '7.2';
UPDATE questions SET subdivision = '8.1' WHERE subdivision = '7.1';

-- Duty of Candour (6.x → 7.x)
UPDATE questions SET subdivision = '7.2' WHERE subdivision = '6.2';
UPDATE questions SET subdivision = '7.1' WHERE subdivision = '6.1';

-- Equality & Diversity (5.x → 6.x)
UPDATE questions SET subdivision = '6.3' WHERE subdivision = '5.3';
UPDATE questions SET subdivision = '6.2' WHERE subdivision = '5.2';
UPDATE questions SET subdivision = '6.1' WHERE subdivision = '5.1';

-- Consent & Confidentiality (4.x → 5.x)
UPDATE questions SET subdivision = '5.3' WHERE subdivision = '4.3';
UPDATE questions SET subdivision = '5.2' WHERE subdivision = '4.2';
UPDATE questions SET subdivision = '5.1' WHERE subdivision = '4.1';

-- Safeguarding (3.x → 4.x)
UPDATE questions SET subdivision = '4.3' WHERE subdivision = '3.3';
UPDATE questions SET subdivision = '4.2' WHERE subdivision = '3.2';
UPDATE questions SET subdivision = '4.1' WHERE subdivision = '3.1';

-- Mental Capacity Act (2.x → 3.x)
UPDATE questions SET subdivision = '3.4' WHERE subdivision = '2.4';
UPDATE questions SET subdivision = '3.3' WHERE subdivision = '2.3';
UPDATE questions SET subdivision = '3.2' WHERE subdivision = '2.2';
UPDATE questions SET subdivision = '3.1' WHERE subdivision = '2.1';

-- The NMC Code (1.x → 2.x)
UPDATE questions SET subdivision = '2.4' WHERE subdivision = '1.4';
UPDATE questions SET subdivision = '2.3' WHERE subdivision = '1.3';
UPDATE questions SET subdivision = '2.2' WHERE subdivision = '1.2';
UPDATE questions SET subdivision = '2.1' WHERE subdivision = '1.1';

-- Numeracy: Questions with category = 'Numeracy' need subdivision assigned
-- This requires manual categorization into 1.1, 1.2, 1.3, or 1.4
```

### Step 4: Update Flashcards Table
```sql
-- Update flashcards.category from old IDs to new IDs
-- Reverse order to avoid ID collisions

-- Cultural Adaptation (7.x → 8.x)
UPDATE flashcards SET category = '8.2' WHERE category = '7.2';
UPDATE flashcards SET category = '8.1' WHERE category = '7.1';

-- Duty of Candour (6.x → 7.x)
UPDATE flashcards SET category = '7.2' WHERE category = '6.2';
UPDATE flashcards SET category = '7.1' WHERE category = '6.1';

-- Equality & Diversity (5.x → 6.x)
UPDATE flashcards SET category = '6.3' WHERE category = '5.3';
UPDATE flashcards SET category = '6.2' WHERE category = '5.2';
UPDATE flashcards SET category = '6.1' WHERE category = '5.1';

-- Consent & Confidentiality (4.x → 5.x)
UPDATE flashcards SET category = '5.3' WHERE category = '4.3';
UPDATE flashcards SET category = '5.2' WHERE category = '4.2';
UPDATE flashcards SET category = '5.1' WHERE category = '4.1';

-- Safeguarding (3.x → 4.x)
UPDATE flashcards SET category = '4.3' WHERE category = '3.3';
UPDATE flashcards SET category = '4.2' WHERE category = '3.2';
UPDATE flashcards SET category = '4.1' WHERE category = '3.1';

-- Mental Capacity Act (2.x → 3.x)
UPDATE flashcards SET category = '3.4' WHERE category = '2.4';
UPDATE flashcards SET category = '3.3' WHERE category = '2.3';
UPDATE flashcards SET category = '3.2' WHERE category = '2.2';
UPDATE flashcards SET category = '3.1' WHERE category = '2.1';

-- The NMC Code (1.x → 2.x)
UPDATE flashcards SET category = '2.4' WHERE category = '1.4';
UPDATE flashcards SET category = '2.3' WHERE category = '1.3';
UPDATE flashcards SET category = '2.2' WHERE category = '1.2';
UPDATE flashcards SET category = '2.1' WHERE category = '1.1';

-- Numeracy: Flashcards with category = 'Numeracy' need new IDs assigned
-- This requires manual categorization into 1.1, 1.2, 1.3, or 1.4
```

### Step 5: Update User Progress Table (if exists)
```sql
-- Update learning_progress.subtopic_id from old IDs to new IDs
-- This table tracks user progress through subtopics

-- Cultural Adaptation (7.x → 8.x)
UPDATE learning_progress SET subtopic_id = '8.2' WHERE subtopic_id = '7.2';
UPDATE learning_progress SET subtopic_id = '8.1' WHERE subtopic_id = '7.1';

-- Duty of Candour (6.x → 7.x)
UPDATE learning_progress SET subtopic_id = '7.2' WHERE subtopic_id = '6.2';
UPDATE learning_progress SET subtopic_id = '7.1' WHERE subtopic_id = '6.1';

-- Equality & Diversity (5.x → 6.x)
UPDATE learning_progress SET subtopic_id = '6.3' WHERE subtopic_id = '5.3';
UPDATE learning_progress SET subtopic_id = '6.2' WHERE subtopic_id = '5.2';
UPDATE learning_progress SET subtopic_id = '6.1' WHERE subtopic_id = '5.1';

-- Consent & Confidentiality (4.x → 5.x)
UPDATE learning_progress SET subtopic_id = '5.3' WHERE subtopic_id = '4.3';
UPDATE learning_progress SET subtopic_id = '5.2' WHERE subtopic_id = '4.2';
UPDATE learning_progress SET subtopic_id = '5.1' WHERE subtopic_id = '4.1';

-- Safeguarding (3.x → 4.x)
UPDATE learning_progress SET subtopic_id = '4.3' WHERE subtopic_id = '3.3';
UPDATE learning_progress SET subtopic_id = '4.2' WHERE subtopic_id = '3.2';
UPDATE learning_progress SET subtopic_id = '4.1' WHERE subtopic_id = '3.1';

-- Mental Capacity Act (2.x → 3.x)
UPDATE learning_progress SET subtopic_id = '3.4' WHERE subtopic_id = '2.4';
UPDATE learning_progress SET subtopic_id = '3.3' WHERE subtopic_id = '2.3';
UPDATE learning_progress SET subtopic_id = '3.2' WHERE subtopic_id = '2.2';
UPDATE learning_progress SET subtopic_id = '3.1' WHERE subtopic_id = '2.1';

-- The NMC Code (1.x → 2.x)
UPDATE learning_progress SET subtopic_id = '2.4' WHERE subtopic_id = '1.4';
UPDATE learning_progress SET subtopic_id = '2.3' WHERE subtopic_id = '1.3';
UPDATE learning_progress SET subtopic_id = '2.2' WHERE subtopic_id = '1.2';
UPDATE learning_progress SET subtopic_id = '2.1' WHERE subtopic_id = '1.1';
```

## Verification Queries

After running the migration, verify the changes:

```sql
-- Check lessons by new subtopic IDs (should show all 8 topics' subtopics)
SELECT category, COUNT(*) as count 
FROM lessons 
WHERE category LIKE '%.%'
GROUP BY category 
ORDER BY category;

-- Check questions by new subtopic IDs (should show all 8 topics' subtopics)
SELECT subdivision, COUNT(*) as count 
FROM questions 
WHERE subdivision LIKE '%.%'
GROUP BY subdivision 
ORDER BY subdivision;

-- Check flashcards by new subtopic IDs (should show all 8 topics' subtopics)
SELECT category, COUNT(*) as count 
FROM flashcards 
WHERE category LIKE '%.%'
GROUP BY category 
ORDER BY category;

-- Verify all subtopic IDs are in valid ranges (should return 0 rows for invalid IDs)
SELECT 'lessons' as table_name, category, COUNT(*) 
FROM lessons 
WHERE category LIKE '%.%' 
  AND category NOT IN (
    '1.1','1.2','1.3','1.4',  -- Numeracy
    '2.1','2.2','2.3','2.4',  -- The NMC Code
    '3.1','3.2','3.3','3.4',  -- Mental Capacity Act
    '4.1','4.2','4.3',        -- Safeguarding
    '5.1','5.2','5.3',        -- Consent & Confidentiality
    '6.1','6.2','6.3',        -- Equality & Diversity
    '7.1','7.2',              -- Duty of Candour
    '8.1','8.2'               -- Cultural Adaptation
  )
GROUP BY category

UNION ALL

SELECT 'questions', subdivision, COUNT(*) 
FROM questions 
WHERE subdivision LIKE '%.%'
  AND subdivision NOT IN (
    '1.1','1.2','1.3','1.4',  -- Numeracy
    '2.1','2.2','2.3','2.4',  -- The NMC Code
    '3.1','3.2','3.3','3.4',  -- Mental Capacity Act
    '4.1','4.2','4.3',        -- Safeguarding
    '5.1','5.2','5.3',        -- Consent & Confidentiality
    '6.1','6.2','6.3',        -- Equality & Diversity
    '7.1','7.2',              -- Duty of Candour
    '8.1','8.2'               -- Cultural Adaptation
  )
GROUP BY subdivision

UNION ALL

SELECT 'flashcards', category, COUNT(*) 
FROM flashcards 
WHERE category LIKE '%.%'
  AND category NOT IN (
    '1.1','1.2','1.3','1.4',  -- Numeracy
    '2.1','2.2','2.3','2.4',  -- The NMC Code
    '3.1','3.2','3.3','3.4',  -- Mental Capacity Act
    '4.1','4.2','4.3',        -- Safeguarding
    '5.1','5.2','5.3',        -- Consent & Confidentiality
    '6.1','6.2','6.3',        -- Equality & Diversity
    '7.1','7.2',              -- Duty of Candour
    '8.1','8.2'               -- Cultural Adaptation
  )
GROUP BY category;

-- Check for Numeracy content that still has no subtopic assignment (should return 0 rows)
SELECT 'lessons' as table_name, topic_id, COUNT(*) 
FROM lessons 
WHERE topic_id = '22222222-2222-0001-0000-000000000001'  -- Numeracy topic UUID
  AND (category IS NULL OR category = '' OR category = 'Numeracy')
GROUP BY topic_id

UNION ALL

SELECT 'questions', NULL as topic_id, COUNT(*) 
FROM questions 
WHERE category = 'Numeracy' 
  AND (subdivision IS NULL OR subdivision = '' OR subdivision = 'Numeracy')

UNION ALL

SELECT 'flashcards', NULL as topic_id, COUNT(*) 
FROM flashcards 
WHERE category = 'Numeracy';
```

## Special Case: Numeracy Content

Since Numeracy previously had no subtopics, existing Numeracy content needs to be manually categorized into the new subtopics:

### Manual Categorization Required:
1. Review all lessons where `topic_id` = Numeracy topic UUID
2. Assign `category` based on lesson content:
   - **1.1** - Dosage Calculations (tablets, liquids, IV medications)
   - **1.2** - Unit Conversions (mg ↔ mcg, kg ↔ lbs, mL ↔ L)
   - **1.3** - IV Flow Rate Calculations (drip rates, infusion times)
   - **1.4** - Fluid Balance (fluid charts, BMI, nutrition)

3. Review all questions where `category` = 'Numeracy'
4. Assign `subdivision` based on question content (same categories as above)

5. Review all flashcards where `category` = 'Numeracy'
6. Assign new `category` value based on flashcard content

## CSV Template Updates

If you use CSV templates for bulk content upload, update them with the new subtopic IDs:

- Old templates referencing `1.1` through `7.2` need to be updated
- Numeracy content needs subtopic IDs (1.1-1.4) instead of direct topic reference

## Communication to Admin Users

**Important:** Inform all content administrators about:
1. The new subtopic IDs
2. The requirement that Numeracy content now needs subtopic assignment
3. Updated CSV templates (if applicable)
4. Any integrations or tools that reference subtopic IDs directly

## Rollback Plan

If migration needs to be rolled back:

```sql
-- Restore from backup tables
DROP TABLE lessons;
CREATE TABLE lessons AS SELECT * FROM lessons_backup;

DROP TABLE questions;
CREATE TABLE questions AS SELECT * FROM questions_backup;

DROP TABLE flashcards;
CREATE TABLE flashcards AS SELECT * FROM flashcards_backup;

-- Drop backup tables after successful rollback verification
DROP TABLE lessons_backup;
DROP TABLE questions_backup;
DROP TABLE flashcards_backup;
```

## Timeline

**Recommended Migration Steps:**
1. ✅ Update code structure (learningStructure.ts)
2. ✅ Update documentation
3. ⚠️ **BEFORE deploying to production:**
   - Run migration scripts on development database
   - Verify all content is properly migrated
   - Test admin panel with new structure
   - Test mobile app with new structure
4. Schedule production migration during low-traffic period
5. Communicate changes to content team
6. Monitor for any issues post-migration

## Notes

- **Critical:** Do not deploy the code changes until the database migration is complete
- All subtopic IDs are now consistently numbered based on their topic position
- The new structure provides better organization for Numeracy content
- User progress tracking will work consistently across all topics
