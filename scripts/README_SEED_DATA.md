# Learning Module Seed Data - Quick Start Guide

## 📦 What's Included

This seed script (`seed_learning_complete.sql`) provides sample content for the Learning Module:

✅ **63 Lessons** (3 per subtopic)
- Audio podcast lessons
- Video tutorial lessons  
- Text introduction lessons

✅ **42 Questions** (2 per subtopic)
- Questions with explanations
- Covers all 21 subtopics

✅ **168 Question Options** - Auto-generated script available

## 🎯 Subtopic Coverage

All 21 subtopics using **updated IDs** (after Numeracy remapping):

- **The NMC Code**: 2.1, 2.2, 2.3, 2.4
- **Mental Capacity Act**: 3.1, 3.2, 3.3, 3.4
- **Safeguarding**: 4.1, 4.2, 4.3
- **Consent & Confidentiality**: 5.1, 5.2, 5.3
- **Equality & Diversity**: 6.1, 6.2, 6.3
- **Duty of Candour**: 7.1, 7.2
- **Cultural Adaptation**: 8.1, 8.2

## 🚀 How to Run

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**

### Step 2: Run the Seed Script

1. Open `scripts/seed_learning_complete.sql`
2. Copy the entire file
3. Paste into Supabase SQL Editor
4. Click **Run** (or Ctrl/Cmd + Enter)

### Step 3: Verify

Run these verification queries:

```sql
-- Check lesson count (should be 63)
SELECT COUNT(*) FROM lessons;

-- Check question count (should be 42)  
SELECT COUNT(*) FROM questions;

-- View lessons by subtopic
SELECT category, COUNT(*) 
FROM lessons 
GROUP BY category 
ORDER BY category;
```

## ⚙️ Adding Question Options (168 Total)

### Quick Method: Auto-Generate All Options

Run this script to create all 168 options automatically:

**File**: `scripts/generate_all_question_options.sql`

```bash
# In Supabase SQL Editor
# 1. Copy generate_all_question_options.sql
# 2. Paste and run
# 3. All 168 options created instantly!
```

This creates placeholder options that you can customize later via the admin portal.

### Alternative: Customize Each Question

If you prefer more control, use:
- **seed_question_options.sql** - Template with realistic examples for first 13 questions
- **Admin Portal** - Add/edit options through the UI

Both approaches work - use what fits your workflow!

## 📝 Customizing Content

The seed data provides generic sample content. You should customize:

1. **Lesson Content** - Make it more specific to each subtopic
2. **Question Text** - Create more NMC CBT-style questions
3. **Add More Questions** - Aim for 10-15 questions per subtopic
4. **Create Flashcards** - Add 8-12 flashcards per subtopic

## 🔄 Re-running the Script

If you need to re-run:

⚠️ **Warning**: This will create duplicate entries! 

To avoid duplicates, either:
1. Delete existing data first:
```sql
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM lessons;
```

2. Or add WHERE conditions to prevent duplicates

## ✅ Next Steps

After running the seed script:

1. ✅ Verify data in Supabase Table Editor
2. ✅ Check content in Admin Portal
3. ⚠️ Add question options (via portal or SQL)
4. ✏️ Customize content for each subtopic
5. 📱 Test in mobile app

## 📚 Files in This Directory

- `seed_learning_complete.sql` - Main seed script (run this!)
- `README_SEED_DATA.md` - This file
- `generateLearningSQL.ts` - Generator script (optional)

## ❓ Troubleshooting

### "Column does not exist" error
- Make sure your database schema matches the expected structure
- Check that `lessons` and `questions` tables exist

### No data shows in Admin Portal
- Refresh your browser
- Verify data exists in Supabase Table Editor
- Check you selected the correct topic/subtopic (use 2.1-8.2, not 1.x)

### Questions show but have no options
- This is normal! Add options via admin portal or SQL (see above)

## 🎉 You're Done!

Once you've run the script and added question options, your Learning Module will have a complete set of sample content across all 21 subtopics!

---
**Created**: November 2025  
**Version**: 1.0 (Post-Numeracy Remapping)
