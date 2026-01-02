# Database Separation - Visual Diagram

## Three Completely Separate Database Systems

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JEEVA ADMIN PORTAL                              │
│                      Content Management System                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
        │   LEARNING    │  │   PRACTICE    │  │   MOCK EXAM   │
        │    MODULE     │  │    MODULE     │  │    MODULE     │
        └───────────────┘  └───────────────┘  └───────────────┘
                │               │               │
                │               │               │
                ▼               ▼               ▼
```

---

## 1. Learning Module Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING MODULE TABLES                       │
└─────────────────────────────────────────────────────────────────┘

topics (Main Topics)
  │
  ├─→ topic_core_notes (1:1)
  │   ├─ id
  │   ├─ topic_id (FK → topics)
  │   ├─ content (Rich Text HTML)
  │   ├─ sections (JSONB)
  │   └─ is_active
  │
  ├─→ topic_flash_content (1:5)
  │   ├─ id
  │   ├─ topic_id (FK → topics)
  │   ├─ screen_number (1-5) ← UNIQUE per topic
  │   ├─ title
  │   ├─ content (Rich Text HTML)
  │   └─ image_url
  │
  └─→ topics (Subtopics)
      │
      ├─→ lessons (Video + Podcast)
      │   ├─ id
      │   ├─ topic_id (FK → topics)
      │   ├─ video_url (MANDATORY)
      │   ├─ podcast_url (OPTIONAL)
      │   ├─ content_type ('video', 'audio', 'text')
      │   └─ is_mandatory
      │
      └─→ learning_questions (5-10 per subtopic)
          ├─ id
          ├─ topic_id (FK → topics)
          ├─ subtopic_id (FK → topics)
          ├─ video_lesson_id (FK → lessons) ← VIDEO MAPPING
          ├─ question_text
          ├─ difficulty
          ├─ explanation
          └─ image_url
          │
          └─→ learning_question_options (4 per question)
              ├─ id
              ├─ question_id (FK → learning_questions)
              ├─ option_text
              ├─ is_correct (1 true, 3 false)
              └─ display_order

┌─────────────────────────────────────────────────────────────────┐
│  UNIQUE FEATURES:                                               │
│  • Video-mapped MCQs (video_lesson_id required)                 │
│  • Core Notes with rich text sections                           │
│  • Exactly 5 flash content screens per topic                    │
│  • Hierarchical: Topic → Subtopic → Content                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Practice Module Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRACTICE MODULE TABLES                       │
└─────────────────────────────────────────────────────────────────┘

practice_questions
  ├─ id
  ├─ category ('Numeracy' | 'Clinical Knowledge')
  ├─ subdivision (e.g., 'Dosage Calculations')
  ├─ question_text
  ├─ question_type
  ├─ difficulty
  ├─ explanation
  └─ image_url
  │
  └─→ practice_question_options (4 per question)
      ├─ id
      ├─ question_id (FK → practice_questions)
      ├─ option_text
      ├─ is_correct
      └─ display_order

┌─────────────────────────────────────────────────────────────────┐
│  UNIQUE FEATURES:                                               │
│  • Organized by category and subdivision                        │
│  • No video mapping required                                    │
│  • Unlimited questions per subdivision                          │
│  • Simple flat structure                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Mock Exam Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOCK EXAM MODULE TABLES                      │
└─────────────────────────────────────────────────────────────────┘

mock_exam_questions
  ├─ id
  ├─ exam_part ('part_a' | 'part_b')
  │   • Part A: Numeracy (15 questions, 30 min)
  │   • Part B: Clinical (120 questions, 150 min)
  ├─ question_text
  ├─ question_type
  ├─ difficulty
  ├─ explanation
  └─ image_url
  │
  └─→ mock_exam_question_options (4 per question)
      ├─ id
      ├─ question_id (FK → mock_exam_questions)
      ├─ option_text
      ├─ is_correct
      └─ display_order

┌─────────────────────────────────────────────────────────────────┐
│  UNIQUE FEATURES:                                               │
│  • Organized by exam part (A or B)                              │
│  • No video mapping required                                    │
│  • Fixed question counts (15 for A, 120 for B)                  │
│  • Simulates real NMC CBT exam                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Separation Summary

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DATABASE TABLE SEPARATION                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Learning Module:                                                    │
│  ✓ learning_questions                                                │
│  ✓ learning_question_options                                         │
│  ✓ topic_core_notes                                                  │
│  ✓ topic_flash_content                                               │
│                                                                      │
│  Practice Module:                                                    │
│  ✓ practice_questions                                                │
│  ✓ practice_question_options                                         │
│                                                                      │
│  Mock Exam Module:                                                   │
│  ✓ mock_exam_questions                                               │
│  ✓ mock_exam_question_options                                        │
│                                                                      │
│  ❌ NO SHARED TABLES                                                 │
│  ❌ NO DATA MIXING                                                   │
│  ✅ COMPLETE SEPARATION                                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────────────┐
│                    RLS POLICIES (ALL MODULES)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Superadmin:                                                    │
│  ✅ SELECT   (view all)                                         │
│  ✅ INSERT   (create)                                           │
│  ✅ UPDATE   (edit)                                             │
│  ✅ DELETE   (remove)                                           │
│                                                                 │
│  Editor:                                                        │
│  ✅ SELECT   (view all)                                         │
│  ✅ INSERT   (create)                                           │
│  ✅ UPDATE   (edit)                                             │
│  ❌ DELETE   (cannot remove)                                    │
│                                                                 │
│  Moderator:                                                     │
│  ✅ SELECT   (view all)                                         │
│  ❌ INSERT   (cannot create)                                    │
│  ❌ UPDATE   (cannot edit)                                      │
│  ❌ DELETE   (cannot remove)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Comparison

### Learning Module Data Flow
```
Admin creates Topic
    ↓
Auto-create Core Notes placeholder
Auto-create 5 Flash Content placeholders
    ↓
Admin adds Subtopic
    ↓
Admin uploads Video (mandatory)
Admin uploads Podcast (optional)
    ↓
Admin creates 5-10 MCQs
Each MCQ linked to video_lesson_id
    ↓
Validation checks all requirements
    ↓
Topic ready for students
```

### Practice Module Data Flow
```
Admin selects Category
    ↓
Admin selects Subdivision
    ↓
Admin creates Question
    ↓
Admin adds 4 options (1 correct)
    ↓
Question saved to practice_questions
    ↓
Available for practice immediately
```

### Mock Exam Data Flow
```
Admin selects Exam Part (A or B)
    ↓
Admin creates Question
    ↓
Admin adds 4 options (1 correct)
    ↓
Question saved to mock_exam_questions
    ↓
Available for mock exams immediately
```

---

## Key Differences Table

| Aspect | Learning | Practice | Mock Exam |
|--------|----------|----------|-----------|
| **Question Table** | `learning_questions` | `practice_questions` | `mock_exam_questions` |
| **Options Table** | `learning_question_options` | `practice_question_options` | `mock_exam_question_options` |
| **Organization** | Topic → Subtopic | Category → Subdivision | Exam Part A/B |
| **Video Required** | ✅ Yes (mapped) | ❌ No | ❌ No |
| **Content Types** | Notes + Flash + MCQs | MCQs only | MCQs only |
| **Question Limit** | 5-10 per subtopic | Unlimited | 15 (A), 120 (B) |
| **Additional Tables** | `topic_core_notes`, `topic_flash_content` | None | None |
| **Validation** | Complex (5 checks) | Simple | Simple |

---

## Benefits of Separation

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHY SEPARATE TABLES?                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Data Integrity                                              │
│     Each module has its own constraints and validations         │
│                                                                 │
│  ✅ Performance                                                 │
│     Smaller tables, faster queries, targeted indexes            │
│                                                                 │
│  ✅ Flexibility                                                 │
│     Each module can evolve independently                        │
│                                                                 │
│  ✅ Clarity                                                     │
│     Clear separation of concerns, easier to understand          │
│                                                                 │
│  ✅ Maintenance                                                 │
│     Changes to one module don't affect others                   │
│                                                                 │
│  ✅ Security                                                    │
│     Separate RLS policies per module type                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Status

```
✅ Database migration completed
✅ All tables created with proper schema
✅ All foreign keys and relationships configured
✅ All indexes created for performance
✅ All RLS policies applied for security
✅ All constraints and validations in place
✅ Old tables renamed (questions → mock_exam_questions)
✅ Lessons table updated with new fields

🎯 Result: Three completely separate, secure, and optimized database systems
```
