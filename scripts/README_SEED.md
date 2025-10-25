# Learning Module Seed Data Instructions

## ⚠️ IMPORTANT: Two-Step Process

You must run **TWO SQL scripts** in this order:

1. **FIRST**: `setup_schema.sql` - Creates database tables
2. **SECOND**: `seed_learning_complete.sql` - Loads the content

Do not skip step 1!

## Overview

The seed data includes:
- **63 lessons** (3 per subtopic: Audio, Video, Text)
- **42 questions** (2 per subtopic, each with 4 multiple-choice options)
- **All 21 subtopics** across 7 Learning Module topics

## What's Included

Each subtopic gets:

### Lessons
1. **Audio Podcast** - Common NMC Code podcast audio for all subtopics
2. **Video Tutorial** - Common video tutorial for all subtopics  
3. **Text Lesson** - NMC Code introduction text content

### Questions
1. Question about key principles (with 4 options)
2. Question about nurse responsibilities (with 4 options)

## How to Run the Seed Scripts

### Option 1: Supabase SQL Editor (Recommended)

#### STEP 1: Create Database Schema

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Create a new query**
   - Click "New Query"

4. **Copy the schema SQL**
   - Open `scripts/setup_schema.sql`
   - Copy the entire contents

5. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

6. **Verify Success**
   - You should see: "Database schema created successfully!"
   - Check the "Table Editor" - you should now see tables: modules, topics, lessons, questions, question_options, flashcards

#### STEP 2: Load Seed Data

7. **Create another new query**
   - Click "New Query" again

8. **Copy the seed SQL**
   - Open `scripts/seed_learning_complete.sql`
   - Copy the entire contents

9. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

10. **Verify Success**
    - You should see success messages
    - Check the "Table Editor" to confirm lessons and questions were created

### Option 2: Using psql Command Line

If you have direct database access:

```bash
# Step 1: Create schema
psql YOUR_DATABASE_CONNECTION_STRING < scripts/setup_schema.sql

# Step 2: Load seed data
psql YOUR_DATABASE_CONNECTION_STRING < scripts/seed_learning_complete.sql
```

## Verify the Seed Data

After running the script:

1. **Go to Admin Portal**
   - Navigate to Content Management
   - Select "Learning Module"

2. **Select a Topic**
   - Choose "The NMC Code"

3. **Select a Subtopic**
   - Choose "1.1 Prioritise People"

4. **Check Content Tabs**
   - **Lessons Tab**: Should show 3 lessons (Audio, Video, Text)
   - **Questions Tab**: Should show 2 questions
   - **Flashcards Tab**: Will be empty (add manually as needed)

## Seed Data Details

### Media URLs

**Audio (Common for all subtopics):**
```
https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3
```

**Video (Common for all subtopics):**
```
https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4
```

### Topics & Subtopics Seeded

✅ **The NMC Code** (4 subtopics)
- 1.1 Prioritise People
- 1.2 Practice Effectively
- 1.3 Preserve Safety
- 1.4 Promote Professionalism

✅ **Mental Capacity Act** (4 subtopics)
- 2.1 Presumption of Capacity
- 2.2 Assessing Capacity
- 2.3 Best Interests Decisions
- 2.4 Advanced Care Planning

✅ **Safeguarding** (3 subtopics)
- 3.1 Recognising Abuse
- 3.2 Reporting Protocols
- 3.3 Child Protection

✅ **Consent & Confidentiality** (3 subtopics)
- 4.1 Valid Consent
- 4.2 GDPR & Confidentiality
- 4.3 Confidentiality vs. Safeguarding

✅ **Equality & Diversity** (3 subtopics)
- 5.1 Equality Act 2010
- 5.2 Cultural Competence
- 5.3 Reasonable Adjustments

✅ **Duty of Candour** (2 subtopics)
- 6.1 Transparency After Errors
- 6.2 NHS Incident Reporting

✅ **Cultural Adaptation** (2 subtopics)
- 7.1 Autonomy vs. Family Decisions
- 7.2 UK Communication Styles

## Customizing Content

After seeding, you can:

1. **Edit Lessons**
   - Update text content with specific subtopic information
   - Replace video URLs with subtopic-specific videos
   - Replace audio URLs with subtopic-specific podcasts

2. **Edit Questions**
   - Modify question text to be more subtopic-specific
   - Add more questions per subtopic
   - Update answer options

3. **Add Flashcards**
   - Use the Flashcards tab to add review cards
   - Aim for 8-12 flashcards per subtopic

## Troubleshooting

### Error: "row-level security policy"
- This means you need to run the SQL in the Supabase SQL Editor (which has admin privileges)
- Do not run the TypeScript seed script directly

### Error: "column does not exist"
- Check that your database schema includes all required columns
- Verify tables: `lessons`, `questions`, `question_options`

### No data appears in Admin Portal
- Refresh the browser
- Check filters (make sure correct topic/subtopic is selected)
- Verify data in Supabase Table Editor

## Re-running the Seed

If you need to re-run the seed script:

```sql
-- First, delete existing seed data
DELETE FROM question_options WHERE question_id IN (
  SELECT id FROM questions WHERE module_type = 'learning'
);
DELETE FROM questions WHERE module_type = 'learning';
DELETE FROM lessons WHERE category LIKE '%.%'; -- Matches subtopic IDs

-- Then run the seed script again
```

## Next Steps

After seeding:

1. Review and customize lesson content for each subtopic
2. Add more questions to reach 10-15 per subtopic
3. Create flashcards (8-12 per subtopic)
4. Test the mobile app learning flow
5. Verify sequential progression logic works correctly

## Support

If you encounter issues:
1. Check the Supabase logs
2. Verify your database schema matches expectations
3. Ensure RLS policies allow admin operations
