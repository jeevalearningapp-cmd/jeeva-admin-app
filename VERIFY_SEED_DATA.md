# Verify Seed Data in Your Database

If you can see seed data in your Supabase tables, use these queries to check what's loaded:

## Quick Check - Run These in Supabase SQL Editor

### 1. Count All Learning Content
```sql
SELECT 
  (SELECT COUNT(*) FROM lessons) as lessons_count,
  (SELECT COUNT(*) FROM questions) as questions_count,
  (SELECT COUNT(*) FROM flashcards) as flashcards_count,
  (SELECT COUNT(*) FROM modules) as modules_count,
  (SELECT COUNT(*) FROM topics) as topics_count;
```

### 2. Check Lessons by Type
```sql
SELECT 
  content_type,
  COUNT(*) as count
FROM lessons
GROUP BY content_type;
-- Should show: audio, video, text
```

### 3. Check All Lesson Topics
```sql
SELECT 
  category,
  COUNT(*) as lesson_count,
  STRING_AGG(DISTINCT title, ', ') as lesson_titles
FROM lessons
GROUP BY category
ORDER BY category;
```

### 4. Sample Lesson Data
```sql
SELECT 
  title,
  category,
  content_type,
  duration_minutes
FROM lessons
LIMIT 10;
```

### 5. Check Questions with Options
```sql
SELECT 
  q.id,
  q.question_text,
  COUNT(a.id) as option_count,
  SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_answers
FROM questions q
LEFT JOIN answers a ON q.id = a.question_id
GROUP BY q.id, q.question_text
LIMIT 10;
```

### 6. Check Flashcards
```sql
SELECT 
  id,
  question_text,
  answer_text
FROM flashcards
LIMIT 10;
```

### 7. Complete Seed Data Summary
```sql
SELECT 
  'Modules' as entity,
  COUNT(*) as total
FROM modules
UNION ALL
SELECT 'Topics', COUNT(*) FROM topics
UNION ALL
SELECT 'Lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'Questions', COUNT(*) FROM questions
UNION ALL
SELECT 'Answers', COUNT(*) FROM answers
UNION ALL
SELECT 'Flashcards', COUNT(*) FROM flashcards;
```

---

## Expected Results (If Fully Seeded)

```
Modules:     3
Topics:      8
Lessons:     63 (3 formats per subtopic)
Questions:   42 (2 per subtopic)
Answers:     168 (4 options per question)
Flashcards:  Multiple (varies by topic)
```

---

## Run These Queries Now

Copy any of the above queries into your Supabase SQL Editor and click "Run" to see:
- ✅ How many lessons are loaded
- ✅ What types (audio/video/text)
- ✅ How many questions exist
- ✅ Sample data structure

Let me know the numbers you see and I can confirm the seed status!
