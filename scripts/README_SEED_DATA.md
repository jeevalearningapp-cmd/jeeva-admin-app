# Learning Module Seed Data - Complete Guide

## 📦 What's Included

**✅ CORRECTED SCRIPTS** (Compatible with your actual database schema):

- `seed_learning_fixed.sql` - 63 lessons + 42 questions
- `generate_all_question_options_fixed.sql` - 168 question options (4 per question)

---

## 🎯 Content Coverage

All 21 subtopics using **remapped IDs** (2.1 through 8.2):

### Topic 2: The NMC Code

- 2.1 Prioritise People
- 2.2 Practice Effectively
- 2.3 Preserve Safety
- 2.4 Promote Professionalism

### Topic 3: Mental Capacity Act

- 3.1 Presumption of Capacity
- 3.2 Assessing Capacity
- 3.3 Best Interests Decisions
- 3.4 Advanced Care Planning

### Topic 4: Safeguarding

- 4.1 Recognising Abuse
- 4.2 Reporting Protocols
- 4.3 Child Protection

### Topic 5: Consent & Confidentiality

- 5.1 Valid Consent
- 5.2 GDPR & Confidentiality
- 5.3 Confidentiality vs. Safeguarding

### Topic 6: Equality & Diversity

- 6.1 Equality Act 2010
- 6.2 Cultural Competence
- 6.3 Reasonable Adjustments

### Topic 7: Duty of Candour

- 7.1 Transparency After Errors
- 7.2 NHS Incident Reporting

### Topic 8: Cultural Adaptation

- 8.1 Autonomy vs. Family Decisions
- 8.2 UK Communication Styles

---

## 🚀 Quick Start (2 Steps!)

### Step 1: Seed Lessons & Questions

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open `scripts/seed_learning_fixed.sql`
4. Copy the **entire file**
5. Paste into SQL Editor
6. Click **Run** (or Ctrl/Cmd + Enter)

**Result:**

- ✅ 63 lessons created (3 per subtopic)
- ✅ 42 questions created (2 per subtopic)

### Step 2: Add Question Options

1. Stay in **Supabase SQL Editor**
2. Click **New Query**
3. Open `scripts/generate_all_question_options_fixed.sql`
4. Copy the **entire file**
5. Paste into SQL Editor
6. Click **Run**

**Result:**

- ✅ 168 question options created (4 per question)
- ⚠️ Options are placeholders - customize via admin portal

---

## ✅ Verification

After running both scripts, verify the data:

```sql
-- Check lesson count (should be 63)
SELECT COUNT(*) FROM lessons;

-- Check question count (should be 42)
SELECT COUNT(*) FROM questions;

-- Check option count (should be 168)
SELECT COUNT(*) FROM question_options;

-- View lessons by subtopic
SELECT category, COUNT(*)
FROM lessons
GROUP BY category
ORDER BY category;

-- View questions by subtopic
SELECT subdivision, COUNT(*)
FROM questions
GROUP BY subdivision
ORDER BY subdivision;

-- Check each question has 4 options
SELECT
  q.subdivision,
  COUNT(qo.id) as option_count
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
GROUP BY q.subdivision
ORDER BY q.subdivision;
```

---

## 🎨 Customizing Content

The seed data provides **sample content**. You should customize:

### Via Admin Portal (Recommended):

1. Go to **Content Management** → **Learning Module**
2. Select a topic and subtopic
3. Click on lessons/questions to edit
4. Update question options with real answers

### What to Customize:

- ✏️ **Lesson content** - Make it specific to each subtopic
- ✏️ **Question text** - Create NMC CBT-style questions
- ✏️ **Question options** - Replace placeholders with real answers
- ➕ **Add more content** - Aim for 10-15 questions per subtopic

---

## 🔄 Re-running the Script

⚠️ **Warning:** Running the scripts again will create **duplicate entries**!

### To avoid duplicates:

**Option A: Clear existing data first**

```sql
-- Delete all seeded data
DELETE FROM question_options;
DELETE FROM questions WHERE category IS NOT NULL;
DELETE FROM lessons WHERE category IS NOT NULL;
```

**Option B: Manually check for duplicates**

```sql
-- Check if data already exists
SELECT COUNT(*) FROM lessons WHERE category = '2.1';
```

---

## 📁 File Reference

### Main Scripts (Use These!)

- ✅ `seed_learning_fixed.sql` - Schema-compliant lessons & questions
- ✅ `generate_all_question_options_fixed.sql` - Auto-generate all options

### Legacy Scripts (Don't Use!)

- ❌ `seed_learning_complete.sql` - **OLD** version with wrong schema
- ❌ `generate_all_question_options.sql` - **OLD** version
- ❌ `seed_question_options.sql` - **OLD** template version

---

## 🔧 Technical Details

### Database Schema Used:

**Lessons Table:**

- `topic_id` (UUID, required) - Foreign key to topics
- `lesson_type` ('audio' | 'video' | 'text')
- `audio_url` - For podcast lessons
- `video_url` - For video lessons
- `category` - Stores subtopic ID (e.g., '2.1', '3.2')
- `duration` - In **seconds** (not minutes)

**Questions Table:**

- `category` - Topic title (e.g., 'The NMC Code')
- `subdivision` - Subtopic ID (e.g., '2.1', '3.2')
- `difficulty` - 'easy' | 'medium' | 'hard'
- `lesson_id` - Optional foreign key to lessons

**Question Options Table:**

- `question_id` - Foreign key to questions
- `option_text` - The answer text
- `is_correct` - Boolean (one per question should be true)
- `display_order` - 1, 2, 3, 4

---

## ❓ Troubleshooting

### "Column does not exist" error

- ✅ You're using the **FIXED** scripts (`seed_learning_fixed.sql`)
- ❌ Don't use the old `seed_learning_complete.sql`

### "Topic not found" warning

- The script looks up topics by name (e.g., "NMC Code", "Mental Capacity")
- Make sure your topics table has these topics created
- Check topic names match: `SELECT title FROM topics;`

### No data shows in Admin Portal

- Refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)
- Verify data exists: `SELECT COUNT(*) FROM lessons;`
- Check you selected correct topic/subtopic (2.1-8.2, not 1.x)

### Questions have no options

- Run `generate_all_question_options_fixed.sql`
- Verify: `SELECT COUNT(*) FROM question_options;` (should be 168)

---

## 🎉 Success Checklist

After running both scripts, you should have:

- ✅ 63 lessons across 21 subtopics
- ✅ 42 questions (2 per subtopic)
- ✅ 168 question options (4 per question)
- ✅ Content visible in Admin Portal
- ✅ Ready for customization via UI

---

**Created**: November 2025  
**Version**: 2.0 (Schema-Compliant)  
**Status**: ✅ Production Ready
