# Database Migration Guide for NMC Course Restructuring

## Overview

This migration transforms the Jeeva Learning admin portal from a fully dynamic content management system to a fixed 3-module structure specifically designed for NMC CBT exam preparation.

## Changes Summary

### 1. **Fixed 3 Modules**
- **Practice Module** - Topic-wise practice questions (Numeracy & Clinical Knowledge)
- **Learning Module** - Structured lessons with multimedia content
- **Mock Exams** - Full exam simulator with realistic timing

### 2. **Question Tagging System**
Questions now have additional metadata:
- `module_type`: 'practice', 'learning', or 'mock_exam'
- `category`: Main category (e.g., 'Numeracy', 'Clinical Knowledge')
- `subdivision`: Sub-category (e.g., 'Dosage Calculations', 'Pharmacology')
- `exam_part`: 'part_a' or 'part_b' (for mock exams only)

### 3. **Learning Module Enhancements**
- Lessons can be: video, audio, text, or quiz
- Quiz lessons require 80% passing score to progress
- New `lesson_quiz_results` table tracks student progress

### 4. **Mock Exam Configuration**
- Configurable question counts and time limits
- Part A: 15 questions, 30 minutes, no calculator
- Part B: 120 questions, 150 minutes
- Random question selection from 500+ question pool

## Migration Steps

### Step 1: Run the Main Migration
Execute in Supabase SQL Editor:
```sql
-- File: restructure_for_nmc_modules.sql
```

This will:
- Add new columns to `questions` and `lessons` tables
- Create `mock_exam_config` and `lesson_quiz_results` tables
- Seed the 3 fixed modules
- Create topics for Practice and Learning modules
- Add helper function for random question selection

### Step 2: Update Admin Panel
The admin panel will be updated to:
- Remove module creation/deletion (3 modules are fixed)
- Add question management with filtering by module/category/subdivision
- Support bulk CSV upload for questions
- Manage lesson content (video URLs, audio URLs, text)

### Step 3: Verify Data
Check that modules and topics were created:
```sql
SELECT * FROM modules ORDER BY display_order;
SELECT * FROM topics ORDER BY module_id, display_order;
```

## Question Management

### Practice Module Questions
Tag questions with:
- `module_type`: 'practice'
- `category`: 'Numeracy' or 'Clinical Knowledge'
- `subdivision`: One of the predefined subdivisions

**Numeracy Subdivisions:**
- Dosage Calculations
- Unit Conversions
- IV Flow Rate Calculations
- Fluid Balance

**Clinical Knowledge Subdivisions:**
- Medical-Surgical Nursing
- Pharmacology
- Infection Control
- Wound Care
- Palliative Care

### Learning Module Questions
Tag questions with:
- `module_type`: 'learning'
- `category`: Topic name (e.g., 'The NMC Code')
- Associate with a lesson via `lesson_id`

### Mock Exam Questions
Tag questions with:
- `module_type`: 'mock_exam'
- `exam_part`: 'part_a' (Numeracy) or 'part_b' (Clinical)
- `lesson_id`: NULL (not tied to specific lessons)

## CSV Bulk Upload Format

### Practice/Learning Questions CSV:
```csv
module_type,category,subdivision,question_text,difficulty,explanation,option_1,option_2,option_3,option_4,correct_option
practice,Numeracy,Dosage Calculations,"A patient needs 500mg of medication...",medium,"To calculate...",250mg,500mg,750mg,1000mg,2
```

### Mock Exam Questions CSV:
```csv
module_type,exam_part,question_text,difficulty,explanation,option_1,option_2,option_3,option_4,correct_option
mock_exam,part_a,"Calculate the drip rate...",hard,"First convert...",15 drops/min,20 drops/min,25 drops/min,30 drops/min,3
```

## Data Model Reference

### Practice Module Structure
```
Practice Module (fixed)
├── Numeracy
│   ├── Dosage Calculations (50+ questions)
│   ├── Unit Conversions (50+ questions)
│   ├── IV Flow Rate Calculations (50+ questions)
│   └── Fluid Balance (50+ questions)
└── Clinical Knowledge
    ├── Medical-Surgical Nursing (50+ questions)
    ├── Pharmacology (50+ questions)
    ├── Infection Control (50+ questions)
    ├── Wound Care (50+ questions)
    └── Palliative Care (50+ questions)
```

### Learning Module Structure
```
Learning Module (fixed)
├── Numeracy (video + audio + text + quiz)
├── The NMC Code (video + audio + text + quiz)
├── Mental Capacity Act (video + audio + text + quiz)
├── Safeguarding (video + audio + text + quiz)
├── Consent & Confidentiality (video + audio + text + quiz)
├── Equality & Diversity (video + audio + text + quiz)
├── Duty of Candour (video + audio + text + quiz)
└── Cultural Adaptation (video + audio + text + quiz)
```

### Mock Exam Structure
```
Mock Exams (fixed)
├── Part A: Numeracy (15 random questions, 30 min)
└── Part B: Clinical (120 random questions, 150 min)
```

## Rollback (if needed)

If you need to revert:
```sql
-- Remove new columns
ALTER TABLE questions DROP COLUMN IF EXISTS module_type;
ALTER TABLE questions DROP COLUMN IF EXISTS category;
ALTER TABLE questions DROP COLUMN IF EXISTS subdivision;
ALTER TABLE questions DROP COLUMN IF EXISTS exam_part;
ALTER TABLE lessons DROP COLUMN IF EXISTS lesson_type;
ALTER TABLE lessons DROP COLUMN IF EXISTS passing_score_percentage;

-- Drop new tables
DROP TABLE IF EXISTS lesson_quiz_results;
DROP TABLE IF EXISTS mock_exam_config;

-- Drop function
DROP FUNCTION IF EXISTS get_random_mock_exam_questions;
```

## Support

After migration, update the admin panel UI to:
1. Show module selector (3 fixed options)
2. Show category/subdivision selectors (dynamic based on selected module)
3. Question management interface with filters
4. Bulk CSV upload with templates
5. Lesson content editor (video URL, audio URL, text content)
