# Learning Module Seed Data Instructions

## ✨ Super Simple - Just ONE Script!

Run **ONE** SQL script and you're done. No multiple steps, no confusion!

**File**: `scripts/setup_and_seed_complete.sql`

This script automatically:

- ✅ Drops any old conflicting tables
- ✅ Creates all tables fresh with correct columns
- ✅ Loads 63 lessons (audio, video, text)
- ✅ Loads 42 questions with answer options

## 🚀 How to Run (3 Minutes)

### In Supabase SQL Editor:

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Jeeva Learning project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste**
   - Open `scripts/setup_and_seed_complete.sql` in this Replit
   - Copy **ALL** content (it's long - 1300+ lines)
   - Paste into Supabase SQL Editor

4. **Run It**
   - Click "Run" button (or Ctrl+Enter / Cmd+Enter)
   - Wait ~10 seconds for it to complete

5. **Verify Success**
   - You should see:
     - "Database schema created successfully!"
     - "63 lessons created successfully!"
     - "42 questions created successfully!"

6. **Check Your Admin Portal**
   - Go to Content Management
   - Select "Learning Module"
   - Choose "The NMC Code" → "1.1 Prioritise People"
   - You should see 3 lessons and 2 questions! 🎉

## 📊 What Gets Loaded

### All 21 Subtopics Across 7 Topics:

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

### Each Subtopic Gets:

**3 Lessons:**

1. 🎧 Audio Podcast - NMC Code podcast
2. 🎥 Video Tutorial - Video lesson
3. 📄 Text Introduction - NMC Code content

**2 Questions:**

- Each with 4 multiple-choice options
- Includes explanations

### Media URLs Used:

**Audio (all subtopics):**

```
https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3
```

**Video (all subtopics):**

```
https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4
```

## 🔄 Need to Re-Run?

No problem! The script drops old tables first, so you can run it again anytime:

1. Just run `setup_and_seed_complete.sql` again in Supabase SQL Editor
2. It will clean everything and reload fresh

## 🎯 Next Steps After Loading

1. **Test in Admin Portal** - Make sure content appears correctly
2. **Customize Content** - Edit lessons to be more subtopic-specific
3. **Add More Questions** - Aim for 10-15 questions per subtopic
4. **Create Flashcards** - Add 8-12 flashcards per subtopic
5. **Test Mobile App** - Verify the learning flow works end-to-end

## ❓ Troubleshooting

### "column does not exist" error

- Make sure you copied the ENTIRE script (all 1300+ lines)
- The DROP TABLE statements must run first

### "row-level security" error

- You must run this in Supabase SQL Editor (has admin privileges)
- Don't run it via the app or API

### No data appears in Admin Portal

- Refresh your browser
- Check you selected the correct topic/subtopic
- Go to Supabase Table Editor → verify data exists in `lessons` and `questions` tables

### Tables already exist error

- This shouldn't happen - the script drops tables first
- If it does, manually drop tables in Supabase Table Editor, then re-run

## 📝 Files in This Directory

- ✅ **setup_and_seed_complete.sql** - THE ONE YOU NEED (use this!)
- 📖 **README_SEED.md** - This file (instructions)
- 🔧 **generateLearningSQL.ts** - Script generator (don't need to run)
- ~~setup_schema.sql~~ - Old separate file (ignore)
- ~~seed_learning_complete.sql~~ - Old separate file (ignore)

## 🎉 That's It!

One script, one run, done! Your Learning Module is ready with 63 lessons and 42 questions across all subtopics.
