# Content Management System Architecture

## System Overview

```
/content Route
    ↓
ContentManagementPage (Main Orchestrator)
    ↓
[Module Selector: Learning | Practice | Mock Exam]
    ↓
    ├─→ Learning Module Management
    │   └─→ Topics
    │       ├─→ Core Notes (Rich Text)
    │       ├─→ Flash Content (5 Screens)
    │       └─→ Subtopics
    │           ├─→ Video Lesson (Mandatory)
    │           ├─→ Podcast (Optional)
    │           └─→ MCQs (5-10, Video-Mapped)
    │
    ├─→ Practice Module Management
    │   └─→ Category Selection
    │       └─→ Subdivision Selection
    │           ├─→ Questions (CRUD)
    │           └─→ CSV Bulk Upload
    │
    └─→ Mock Exam Management
        └─→ Part Selection (A or B)
            ├─→ Questions (CRUD)
            └─→ CSV Bulk Upload
```

## Component Hierarchy

### ContentManagementPage
```
ContentManagementPage
├── Module Selector Cards
│   ├── Learning Module Card
│   ├── Practice Module Card
│   └── Mock Exam Card
└── Module Content Area
    ├── <LearningModuleManagementPage />
    ├── <PracticeModuleManagement />
    └── <MockExamManagement />
```

### Learning Module Management
```
LearningModuleManagementPage
├── List View
│   └── LearningModuleTopicList
│       ├── Topic Cards (with validation status)
│       ├── Add Topic Button
│       └── TopicFormModal
├── Topic Detail View
│   ├── Tabs: Core Notes | Flash Content | Subtopics | Validation
│   ├── CoreNotesEditor (Rich Text)
│   ├── FlashContentEditor (5 Screens)
│   ├── SubtopicList
│   └── ContentValidation
└── Subtopic Detail View
    ├── Tabs: Video | Podcast | MCQs
    ├── VideoLessonTab
    ├── PodcastTab
    ├── MCQTab
    └── VideoMappedMCQForm
```

### Practice Module Management
```
PracticeModuleManagement
├── Category Selector (Numeracy | Clinical)
├── Subdivision Selector
└── Content Tabs
    ├── Questions Tab
    │   └── QuestionManager
    └── Bulk Upload Tab
        └── CSVBulkUpload
```

### Mock Exam Management
```
MockExamManagement
├── Part Selector (Part A | Part B)
└── Content Tabs
    ├── Questions Tab
    │   └── QuestionManager
    └── Bulk Upload Tab
        └── CSVBulkUpload
```

## Database Schema

### Learning Module Tables
```
learning_topics
├── id (PK)
├── title
├── description
├── display_order
└── created_at

learning_core_notes
├── id (PK)
├── topic_id (FK → learning_topics)
├── content (Rich Text JSON)
└── updated_at

learning_flash_content
├── id (PK)
├── topic_id (FK → learning_topics)
├── screen_number (1-5)
├── title
├── content
├── image_url
└── display_order

learning_subtopics
├── id (PK)
├── topic_id (FK → learning_topics)
├── title
├── video_url (Mandatory)
├── video_duration
├── podcast_url (Optional)
├── podcast_duration
└── display_order

learning_questions
├── id (PK)
├── subtopic_id (FK → learning_subtopics)
├── video_lesson_id (FK → learning_subtopics)
├── question_text
├── difficulty
├── explanation
├── image_url
└── options (JSON: 4 options, 1 correct)
```

### Practice Module Tables
```
practice_questions
├── id (PK)
├── module_id (FK → Fixed Practice Module)
├── category (Numeracy | Clinical)
├── subdivision
├── question_text
├── difficulty
├── explanation
└── options (JSON)
```

### Mock Exam Tables
```
mock_exam_questions
├── id (PK)
├── module_id (FK → Fixed Mock Exam Module)
├── exam_part (part_a | part_b)
├── question_text
├── difficulty
├── explanation
└── options (JSON)
```

## API Layer

### Learning Module APIs
- `coreNotes.ts` - CRUD for Core Notes
- `flashContent.ts` - CRUD for Flash Content (enforces 5 screens)
- `subtopics.ts` - CRUD for Subtopics (video, podcast)
- `learningQuestions.ts` - CRUD for MCQs (video-mapped)

### Shared APIs
- `questions.ts` - Generic question CRUD (used by Practice & Mock Exam)
- `csvUpload.ts` - Bulk upload handler

## Data Flow

### Creating a Learning Topic
```
User Action: Click "Add Topic"
    ↓
TopicFormModal: Enter title, description, order
    ↓
API: POST /learning_topics
    ↓
Auto-create: Core Notes placeholder
Auto-create: 5 Flash Content placeholders
    ↓
Refresh: Topic list
    ↓
Navigate: Topic detail view
```

### Adding Subtopic Content
```
User Action: Select Subtopic → Video Tab
    ↓
VideoLessonTab: Upload video or enter URL
    ↓
API: PATCH /learning_subtopics/{id}
    ↓
Update: Subtopic record with video_url
    ↓
Validation: Check if video exists (mandatory)
```

### Content Validation Flow
```
ContentValidation Component
    ↓
Check 1: Core Notes exist and not empty
Check 2: Exactly 5 Flash Content screens
Check 3: All subtopics have video (mandatory)
Check 4: All subtopics have 5-10 MCQs
Check 5: All MCQs mapped to video lessons
    ↓
Display: Validation checklist with status
    ↓
Result: Topic ready for activation (or errors shown)
```

## Security (RLS Policies)

### All Tables
- **Superadmin**: Full CRUD access
- **Editor**: Create, Read, Update (no delete)
- **Moderator**: Read-only
- **Users**: Can only access their own progress data

## Routing Structure

```
/content
    ↓
ContentManagementPage
    ↓
    ├─→ selectedModule = 'learning'
    │   └─→ <LearningModuleManagementPage />
    │
    ├─→ selectedModule = 'practice'
    │   └─→ <PracticeModuleManagement />
    │
    └─→ selectedModule = 'mock_exam'
        └─→ <MockExamManagement />
```

## Benefits of This Architecture

1. **Single Entry Point**: One route for all content management
2. **Modular Design**: Each module type is self-contained
3. **Reusable Components**: QuestionManager, CSVBulkUpload shared across modules
4. **Clear Separation**: Learning Module has its own specialized components
5. **Scalable**: Easy to add new module types
6. **Maintainable**: Changes to one module don't affect others
7. **Consistent UX**: Similar patterns across all modules

## Future Enhancements

- [ ] Add content preview mode
- [ ] Add content versioning
- [ ] Add content scheduling (publish dates)
- [ ] Add content analytics (usage stats)
- [ ] Add collaborative editing
- [ ] Add content templates
- [ ] Add AI-assisted content generation
