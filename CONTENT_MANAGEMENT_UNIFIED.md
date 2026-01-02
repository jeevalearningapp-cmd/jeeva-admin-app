
# Unified Content Management System

## Overview

The admin portal now has a **unified Content Management page** that provides access to all three module types:

1. **Learning Module** - New hierarchical structure with Core Notes, Flash Content, and Subtopics
2. **Practice Module** - Topic-wise practice questions organized by category and subdivision
3. **Mock Exam Module** - Full exam simulator with Part A (Numeracy) and Part B (Clinical)

## Architecture

### Main Components

#### ContentManagementPage (`src/pages/ContentManagementPage.tsx`)
- **Purpose**: Main orchestration page with module type selector
- **Features**:
  - Visual module selector cards (Learning, Practice, Mock Exam)
  - Embeds appropriate management component based on selection
  - Consistent UI/UX across all module types

#### LearningModuleManagementPage (`src/pages/LearningModuleManagementPage.tsx`)
- **Purpose**: Manage Learning Module content with new hierarchical structure
- **Structure**:
  - **Main Topics**: Core Notes + Flash Content (5 screens)
  - **Subtopics**: Video Lesson + Podcast (optional) + MCQs (5-10, mapped to video)
- **Features**:
  - Topic list with validation status
  - Rich text editor for Core Notes
  - Flash Content editor (exactly 5 screens)
  - Subtopic management with video, podcast, and MCQ tabs
  - Content validation checklist

#### PracticeModuleManagement (`src/components/content/PracticeModuleManagement.tsx`)
- **Purpose**: Manage Practice Module questions
- **Structure**:
  - Category selection (Numeracy, Clinical Knowledge)
  - Subdivision selection (based on category)
  - Question management and bulk upload
- **Features**:
  - Question CRUD operations
  - CSV bulk upload
  - Category/subdivision filtering

#### MockExamManagement (`src/components/content/MockExamManagement.tsx`)
- **Purpose**: Manage Mock Exam questions
- **Structure**:
  - Part A: Numeracy (15 questions, 30 min)
  - Part B: Clinical (120 questions, 150 min)
- **Features**:
  - Question CRUD operations
  - CSV bulk upload
  - Part-based filtering

## Database Structure

### Learning Module Tables

#### `learning_topics`
- Main topics with title, description, display_order
- Each topic has Core Notes and Flash Content

#### `learning_core_notes`
- Rich text content for each topic
- Supports sections, images, formatting

#### `learning_flash_content`
- Exactly 5 flash screens per topic
- Each screen has title, content, optional image

#### `learning_subtopics`
- Subtopics under each main topic
- Contains video lesson, optional podcast

#### `learning_questions`
- MCQs mapped to video lessons (5-10 per subtopic)
- Includes question text, options, explanation, difficulty

### Practice Module Tables

#### `practice_questions`
- Questions organized by category and subdivision
- Linked to fixed Practice Module ID

### Mock Exam Tables

#### `mock_exam_questions`
- Questions for Part A (Numeracy) and Part B (Clinical)
- Linked to fixed Mock Exam Module ID

## Migration Notes

### What Changed

1. **Old System**: Single ContentManagementPage with tabs for all modules
2. **New System**: Unified ContentManagementPage with module selector + specialized management components

### What Was Preserved

- All Practice Module functionality (category/subdivision selection, question management)
- All Mock Exam functionality (Part A/B selection, question management)
- CSV bulk upload for all module types
- Existing database structure and relationships

### What Was Added

- New Learning Module management with hierarchical structure
- Core Notes editor with rich text support
- Flash Content editor (5 screens)
- Subtopic management (Video, Podcast, MCQs)
- Video-mapped MCQ system
- Content validation checklist

## Usage Guide

### Accessing Content Management

1. Navigate to `/content` route in the admin portal
2. Select the module type you want to manage:
   - **Learning Module**: For educational content with topics and subtopics
   - **Practice Module**: For practice questions by category
   - **Mock Exam**: For full exam simulation questions

### Managing Learning Module

1. **Create Topic**:
   - Click "Add New Topic"
   - Enter title, description, display order
   - Core Notes and Flash Content placeholders are auto-created

2. **Edit Core Notes**:
   - Select topic → Core Notes tab
   - Use rich text editor to add content
   - Organize into sections with titles
   - Add images as needed

3. **Edit Flash Content**:
   - Select topic → Flash Content tab
   - Edit exactly 5 flash screens
   - Add title, content, and optional image per screen

4. **Manage Subtopics**:
   - Select topic → Subtopics tab
   - Add/edit subtopics
   - For each subtopic:
     - **Video**: Upload video or add URL (mandatory)
     - **Podcast**: Upload audio or add URL (optional)
     - **MCQs**: Add 5-10 questions mapped to the video lesson

5. **Validate Content**:
   - Select topic → Validation tab
   - Review checklist:
     - Core Notes exist and not empty
     - Exactly 5 Flash Content screens
     - All subtopics have video
     - All subtopics have 5-10 MCQs
     - All MCQs mapped to video lessons

### Managing Practice Module

1. Select **Practice Module**
2. Choose category (Numeracy or Clinical Knowledge)
3. Choose subdivision
4. Manage questions:
   - Add/edit/delete questions
   - Use bulk upload for CSV import

### Managing Mock Exam

1. Select **Mock Exam**
2. Choose exam part (Part A or Part B)
3. Manage questions:
   - Add/edit/delete questions
   - Use bulk upload for CSV import

## File Structure

```
src/
├── pages/
│   ├── ContentManagementPage.tsx          # Main unified page
│   ├── LearningModuleManagementPage.tsx   # Learning Module management
│   └── ContentManagementPage.OLD.tsx      # Backup of old system
├── components/
│   └── content/
│       ├── PracticeModuleManagement.tsx   # Practice Module component
│       ├── MockExamManagement.tsx         # Mock Exam component
│       ├── LearningModuleTopicList.tsx    # Learning: Topic list
│       ├── TopicFormModal.tsx             # Learning: Topic form
│       ├── CoreNotesEditor.tsx            # Learning: Core Notes editor
│       ├── FlashContentEditor.tsx         # Learning: Flash Content editor
│       ├── SubtopicList.tsx               # Learning: Subtopic list
│       ├── VideoLessonTab.tsx             # Learning: Video management
│       ├── PodcastTab.tsx                 # Learning: Podcast management
│       ├── MCQTab.tsx                     # Learning: MCQ list
│       ├── VideoMappedMCQForm.tsx         # Learning: MCQ form
│       ├── ContentValidation.tsx          # Learning: Validation checklist
│       ├── QuestionManager.tsx            # Shared: Question CRUD
│       └── CSVBulkUpload.tsx              # Shared: CSV upload
└── api/
    ├── coreNotes.ts                       # Core Notes API
    ├── flashContent.ts                    # Flash Content API
    ├── subtopics.ts                       # Subtopics API
    └── learningQuestions.ts               # Learning Questions API
```

## Benefits of Unified System

1. **Single Entry Point**: One page for all content management needs
2. **Consistent UX**: Similar patterns across all module types
3. **Clear Separation**: Each module type has its own specialized component
4. **Maintainability**: Easier to update individual module management without affecting others
5. **Scalability**: Easy to add new module types in the future
6. **Preserved Functionality**: All existing Practice and Mock Exam features remain intact

## Next Steps

1. Test all three module types thoroughly
2. Verify database operations for all modules
3. Test CSV bulk upload for Practice and Mock Exam
4. Validate Learning Module content creation workflow
5. Check RLS policies for all tables
6. Update user documentation if needed
