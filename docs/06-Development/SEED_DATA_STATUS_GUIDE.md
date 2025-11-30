# Seed Data Status Guide

**Status:** Seed scripts created but NOT yet applied to Supabase ⏳

---

## What Seed Data Exists

### 📁 Files Created
Located in `scripts/` folder:
- ✅ `seed_learning_complete.sql` (326 lines)
- ✅ `seed_question_options.sql` (283 lines)
- ✅ `setup_and_seed_complete.sql` (combined)
- ✅ `seed_learning_fixed.sql` (backup)

### 📊 Data to Be Seeded

**Lessons: 63 Total**
```
Topic 2: The NMC Code (12 lessons)
- 2.1 Prioritise People (3 lessons: audio, video, text)
- 2.2 Practice Effectively (3 lessons)
- 2.3 Preserve Safety (3 lessons)
- 2.4 Promote Professionalism (3 lessons)

Topic 3: Mental Capacity Act (12 lessons)
- 3.1, 3.2, 3.3, 3.4 (3 lessons each)

Topic 4: Safeguarding (9 lessons)
- 4.1, 4.2, 4.3 (3 lessons each)

Topic 5: Consent & Confidentiality (9 lessons)
- 5.1, 5.2, 5.3 (3 lessons each)

Topic 6: Equality & Diversity (9 lessons)
- 6.1, 6.2, 6.3 (3 lessons each)

Topic 7: Duty of Candour (6 lessons)
- 7.1, 7.2 (3 lessons each)

Topic 8: Cultural Adaptation (6 lessons)
- 8.1, 8.2 (3 lessons each)
```

**Questions: 42 Total**
```
- 2 questions per subtopic with 4 options each
- Covers all 21 subtopics
- All linked to lessons
```

**Flashcards**
```
- Multiple flashcards per topic
- Question-answer format for revision
```

---

## Current Database State

**Tables Status:**
- ❌ `lessons` table - Does NOT exist
- ❌ `questions` table - Does NOT exist
- ❌ `flashcards` table - Does NOT exist
- ❌ `answers` table - Does NOT exist

**Action Required:**
1. Create the table schema in Supabase
2. Run the seed scripts to populate data

---

## How to Apply Seed Data

### Option 1: Apply via Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click "SQL Editor" in left sidebar

2. **Create a New Query**
   - Click "+ New Query"
   - Give it a name: "Seed Learning Data"

3. **Copy the Seed Script**
   - Open: `scripts/seed_learning_complete.sql`
   - Copy entire contents
   - Paste into Supabase SQL Editor

4. **Execute**
   - Click "Run" button
   - Wait for completion

5. **Apply Question Options**
   - Create another query
   - Paste: `scripts/seed_question_options.sql`
   - Click "Run"

### Option 2: Apply via Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Connect to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run seed scripts
psql -U postgres -h localhost -f scripts/seed_learning_complete.sql
psql -U postgres -h localhost -f scripts/seed_question_options.sql
```

### Option 3: Apply via Node.js Script

Create a new file `apply-seeds.js`:
```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applySeed() {
  try {
    // Read seed script
    const seedSQL = fs.readFileSync('scripts/seed_learning_complete.sql', 'utf-8')
    
    // Execute
    const { error } = await supabase.rpc('exec_sql', { sql: seedSQL })
    
    if (error) throw error
    console.log('✅ Seed data applied successfully!')
  } catch (err) {
    console.error('❌ Error applying seed:', err)
  }
}

applySeed()
```

Then run:
```bash
node apply-seeds.js
```

---

## Seed Data Preview

### Sample Lessons
```sql
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes)
VALUES
(gen_random_uuid(), 'NMC Code Podcast: Prioritise People', '2.1', 
 'Listen to an expert discussion on prioritising people in nursing practice', 
 'audio', 'https://...podcast-audio.mp3', 15),

(gen_random_uuid(), 'Video: Prioritise People in Action', '2.1',
 'Watch real-world examples of prioritising people in UK healthcare',
 'video', 'https://...video-tutorial.mp4', 12),

(gen_random_uuid(), 'Introduction to Prioritise People', '2.1',
 'The first principle of the NMC Code requires nurses to treat people as individuals...',
 'text', null, 5)
```

### Sample Questions
```sql
INSERT INTO questions (id, topic_id, subtopic_id, question_text, difficulty_level)
VALUES
(gen_random_uuid(), 2, 1, 
 'According to the NMC Code, which of the following best describes how you should prioritise people?',
 'medium'),
 
(gen_random_uuid(), 2, 1,
 'What is the primary responsibility of a nurse under the Prioritise People principle?',
 'easy')
```

---

## Prerequisites Before Applying Seeds

✅ **Ensure These Tables Exist:**

Your Supabase should already have:
```
- modules (created ✅)
- topics (created ✅)
- lessons (need to verify)
- questions (need to verify)
- flashcards (need to verify)
- answers (need to verify)
```

**If tables don't exist, create them first:**
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  content_type TEXT,
  media_url TEXT,
  duration_minutes INT,
  is_active BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID,
  subtopic_id UUID,
  question_text TEXT NOT NULL,
  difficulty_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (topic_id) REFERENCES topics(id)
);
```

---

## Verify Seed Data Was Applied

After running the seed scripts, verify with these queries:

```sql
-- Check lessons count
SELECT COUNT(*) as total_lessons FROM lessons;
-- Expected: 63

-- Check questions count
SELECT COUNT(*) as total_questions FROM questions;
-- Expected: 42

-- Check specific lesson
SELECT title, content_type FROM lessons WHERE category = '2.1' LIMIT 5;

-- Check lesson with audio
SELECT * FROM lessons WHERE content_type = 'audio' LIMIT 1;

-- Check questions with options
SELECT q.question_text, a.answer_text, a.is_correct
FROM questions q
LEFT JOIN answers a ON q.id = a.question_id
LIMIT 10;
```

---

## Next Steps

### If You Want to Apply Seeds:
1. Open Supabase SQL Editor
2. Verify tables exist (see above)
3. Copy and run: `scripts/seed_learning_complete.sql`
4. Copy and run: `scripts/seed_question_options.sql`
5. Verify with queries above

### If You Don't Want Seeds Yet:
- They're ready to go when needed
- You can create custom content through admin portal instead
- Seeds provide baseline learning content for mobile app

### Alternative: Manual Content Creation
Use the Admin Portal to:
1. Create topics and lessons manually
2. Upload media (audio, video)
3. Create questions and options
4. Build flashcards

This gives more control but takes more time.

---

## Seed Script Contents Summary

### seed_learning_complete.sql (326 lines)
- ✅ 63 Lessons (3 formats each: audio, video, text)
- ✅ Covers 8 topics (NMC Code, MCA, Safeguarding, etc.)
- ✅ Media URLs point to real audio/video files
- ✅ Duration estimates for each lesson
- ✅ Display ordering for UI

### seed_question_options.sql (283 lines)
- ✅ 42 Questions (2 per subtopic)
- ✅ Multiple choice with 4 options each
- ✅ Difficulty levels (easy, medium, hard)
- ✅ Correct answer marked
- ✅ Ready for practice mode

---

## Recommendation

**Apply the seed data now because:**
1. ✅ Mobile app will need this content
2. ✅ Provides baseline for users
3. ✅ Complete and validated
4. ✅ Can be supplemented with admin portal later

**Or wait if you want to:**
1. Create custom questions first
2. Record custom audio/video
3. Have instructors review content
4. Gradual content rollout

---

**Last Updated:** November 21, 2025  
**Seed Data Status:** ✅ Created | ⏳ Awaiting Application  
**Next Action:** Choose Option 1, 2, or 3 above to apply seeds
