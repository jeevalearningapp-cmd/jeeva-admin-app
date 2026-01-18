# Requirements Document

## Introduction

This document outlines the requirements for restructuring the Learning Module content hierarchy and separating question databases by module type (Practice, Learning, Mock Exam). The new structure provides a clearer learning path with topic-level core content and subtopic-level detailed lessons.

## Glossary

- **Main_Topic**: Top-level learning topic (e.g., "Numeracy", "The NMC Code")
- **Subtopic**: Subdivision under a main topic (e.g., "1.1 Dosage Calculations")
- **Core_Notes**: Comprehensive readable lesson covering the entire main topic
- **Flash_Content**: Quick revision screens (5 per topic) for spaced repetition
- **Video_Mapped_MCQ**: Multiple choice question directly linked to a specific video lesson
- **Practice_Module**: Fixed structure module for exam familiarization
- **Learning_Module**: Dynamic structure module for structured learning
- **Mock_Exam_Module**: Full exam simulation module
- **Admin_Portal**: Web interface for content management
- **Mobile_App**: Student-facing application for learning
- **Passing_Threshold**: 80% score required to unlock next subtopic

## Requirements

### Requirement 1: Separate Question Tables by Module Type

**User Story:** As a system architect, I want separate question tables for Practice, Learning, and Mock Exam modules, so that each module can have independent schemas and management rules.

#### Acceptance Criteria

1. THE System SHALL maintain three separate question tables: practice_questions, learning_questions, and mock_exam_questions
2. WHEN querying questions for Practice module, THE System SHALL query only the practice_questions table
3. WHEN querying questions for Learning module, THE System SHALL query only the learning_questions table
4. WHEN querying questions for Mock Exam module, THE System SHALL query only the mock_exam_questions table
5. WHEN an admin creates a question, THE Admin_Portal SHALL save it to the appropriate table based on module selection
6. THE System SHALL maintain separate question_options tables for each module type
7. WHEN migrating existing questions, THE System SHALL distribute them to appropriate tables based on current usage

### Requirement 2: Practice Module Fixed Structure

**User Story:** As a learner, I want to practice questions organized by Numeracy and Clinical Knowledge topics, so that I can familiarize myself with exam scenarios.

#### Acceptance Criteria

1. THE Practice_Module SHALL have exactly 2 main topics: "Numeracy" and "Clinical Knowledge"
2. WHEN displaying Numeracy topic, THE System SHALL show 4 subtopics: "Dosage Calculations", "Unit Conversions", "IV Flow Rate Calculations", "Fluid Balance"
3. WHEN displaying Clinical Knowledge topic, THE System SHALL show 5 subtopics: "Medical-Surgical Nursing", "Pharmacology", "Infection Control", "Wound Care", "Palliative Care"
4. THE Practice_Module SHALL allow free navigation between any topic or subtopic
5. THE Practice_Module SHALL have no passing requirements or progression locks
6. WHEN a learner completes practice questions, THE System SHALL show immediate feedback with explanations
7. THE Practice_Module SHALL allow unlimited retries of any subtopic
8. THE practice_questions table SHALL store category (topic name) and subdivision (subtopic name) fields

### Requirement 3: Learning Module Dynamic Topic Management

**User Story:** As an admin, I want to add and edit learning topics dynamically, so that I can expand the curriculum without code changes.

#### Acceptance Criteria

1. WHEN an admin accesses Learning Module management, THE Admin_Portal SHALL provide an "Add New Topic" button
2. WHEN creating a new topic, THE Admin_Portal SHALL require: topic title, description, and display order
3. WHEN editing an existing topic, THE Admin_Portal SHALL allow modification of title, description, Core_Notes, Flash_Content, and subtopics
4. WHEN deleting a topic, THE System SHALL warn about cascade deletion of all subtopics and content
5. THE Admin_Portal SHALL allow reordering topics via drag-and-drop or order number input
6. WHEN a topic is created, THE System SHALL automatically create placeholders for Core_Notes and Flash_Content
7. THE Admin_Portal SHALL show validation status for each topic (complete/incomplete)

### Requirement 4: Main Topic Level Structure

**User Story:** As a learner, I want to see comprehensive core notes and flash content at the topic level, so that I can understand the full topic before diving into subtopics.

#### Acceptance Criteria

1. WHEN a learner opens a main topic, THE System SHALL display the Core_Notes covering the entire topic
2. WHEN Core_Notes are displayed, THE System SHALL organize content by subtopic sections or pillars
3. WHEN a learner completes Core_Notes, THE System SHALL provide access to 5 Flash_Content screens for revision
4. WHEN displaying a main topic, THE System SHALL list all subtopics clearly with their titles
5. WHEN a learner views the topic overview, THE System SHALL show which subtopics are locked, in-progress, or completed
6. THE Core_Notes SHALL be stored as rich text content with formatting support
7. THE Flash_Content SHALL consist of exactly 5 screens per main topic
8. WHEN an admin creates Core_Notes, THE Admin_Portal SHALL provide a rich text editor with section organization

### Requirement 5: Subtopic Level Content Structure

**User Story:** As a learner, I want each subtopic to have video lessons, optional podcasts, and video-mapped MCQs, so that I can learn through multiple formats and assess my understanding.

#### Acceptance Criteria

1. WHEN a learner opens a subtopic, THE System SHALL display a mandatory video lesson
2. WHERE a podcast is available, THE System SHALL display the optional podcast for that subtopic
3. WHEN a video lesson is displayed, THE System SHALL show associated Video_Mapped_MCQs
4. WHEN a subtopic contains MCQs, THE System SHALL provide between 5 and 10 questions
5. WHEN a learner completes subtopic MCQs, THE System SHALL calculate the score as (correct_answers / total_questions) \* 100
6. IF the learner's score is >= 80%, THEN THE System SHALL mark the subtopic as completed and unlock the next subtopic
7. IF the learner's score is < 80%, THEN THE System SHALL allow unlimited retries until passing
8. WHEN a learner has not completed a subtopic, THE System SHALL keep subsequent subtopics locked within that topic
9. THE video lesson SHALL be marked as mandatory in the database
10. THE podcast SHALL be marked as optional in the database

### Requirement 6: Non-Sequential Topic Access

**User Story:** As a learner, I want to start any main topic regardless of completion status of other topics, so that I can learn topics in my preferred order.

#### Acceptance Criteria

1. WHEN a learner views the Learning Module topic list, THE System SHALL allow access to any main topic
2. WHEN a learner starts a new topic, THE System SHALL not check completion status of other topics
3. WHEN displaying topic list, THE System SHALL show progress percentage for each topic independently
4. THE System SHALL enforce sequential subtopic progression only within each topic
5. WHEN a learner switches between topics, THE System SHALL preserve progress in all topics
6. THE System SHALL allow learners to work on multiple topics simultaneously

### Requirement 7: Video-Mapped MCQ Association

**User Story:** As a content creator, I want to map MCQs directly to video lessons, so that questions are contextually relevant to what students just learned.

#### Acceptance Criteria

1. WHEN an admin creates a Video_Mapped_MCQ, THE System SHALL require association with a specific video lesson
2. WHEN displaying MCQs for a subtopic, THE System SHALL only show questions mapped to that subtopic's video
3. WHEN a video lesson is deleted, THE System SHALL handle associated MCQs according to cascade rules
4. THE System SHALL store the video_lesson_id foreign key for each Video_Mapped_MCQ
5. WHEN querying MCQs for a subtopic, THE System SHALL filter by both subtopic_id and video_lesson_id

### Requirement 8: Admin Portal Content Management

**User Story:** As an admin, I want to manage topic-level and subtopic-level content separately, so that I can organize learning materials efficiently.

#### Acceptance Criteria

1. WHEN an admin selects a main topic, THE Admin_Portal SHALL provide tabs for Core_Notes, Flash_Content, and Subtopics
2. WHEN managing Core_Notes, THE Admin_Portal SHALL provide a rich text editor with section organization
3. WHEN managing Flash_Content, THE Admin_Portal SHALL allow creation of exactly 5 flash screens per topic
4. WHEN managing subtopics, THE Admin_Portal SHALL display a list of all subtopics with their content status
5. WHEN an admin selects a subtopic, THE Admin_Portal SHALL provide tabs for Video, Podcast, and MCQs
6. WHEN adding a video lesson, THE Admin_Portal SHALL mark it as mandatory
7. WHEN adding a podcast, THE Admin_Portal SHALL mark it as optional
8. WHEN adding MCQs to a subtopic, THE Admin_Portal SHALL enforce 5-10 questions per subtopic
9. WHEN creating an MCQ, THE Admin_Portal SHALL require mapping to the subtopic's video lesson
10. THE Admin_Portal SHALL validate that each subtopic has at least one mandatory video before activation
11. WHEN managing Practice Module, THE Admin_Portal SHALL use the fixed topic/subtopic structure
12. WHEN managing Learning Module, THE Admin_Portal SHALL allow dynamic topic creation and editing

### Requirement 9: Database Schema Migration

**User Story:** As a system administrator, I want to migrate existing data to the new structure, so that current content is preserved and properly categorized.

#### Acceptance Criteria

1. WHEN the migration runs, THE System SHALL create three new question tables: practice_questions, learning_questions, mock_exam_questions
2. WHEN migrating existing questions, THE System SHALL classify them based on their current lesson associations and usage
3. WHEN the migration completes, THE System SHALL maintain referential integrity for all foreign keys
4. THE migration SHALL create new tables for topic_core_notes and topic_flash_content
5. THE migration SHALL add video_lesson_id foreign key to learning_questions table for Video_Mapped_MCQs
6. WHEN the migration encounters errors, THE System SHALL rollback all changes and report the error
7. THE migration SHALL preserve all existing question data, options, and explanations
8. THE migration SHALL create separate question_options tables for each module type

### Requirement 10: Flash Content Revision System

**User Story:** As a learner, I want to review flash content for quick revision, so that I can reinforce key concepts efficiently.

#### Acceptance Criteria

1. WHEN a learner accesses flash content, THE System SHALL display 5 screens in sequence
2. WHEN displaying flash screens, THE System SHALL show one screen at a time with navigation controls
3. WHEN a learner completes all 5 flash screens, THE System SHALL mark flash content as reviewed
4. THE flash screens SHALL support text, images, and formatted content
5. WHEN an admin creates flash content, THE System SHALL enforce exactly 5 screens per topic
6. THE flash content SHALL be accessible after completing Core_Notes

### Requirement 11: Progress Tracking and Analytics

**User Story:** As a learner, I want to see my progress through topics and subtopics, so that I can track my learning journey.

#### Acceptance Criteria

1. WHEN a learner views a topic, THE System SHALL display overall progress percentage
2. WHEN calculating topic progress, THE System SHALL consider Core_Notes completion, flash content review, and subtopic completion
3. WHEN a learner views subtopic list, THE System SHALL show completion status for each subtopic
4. THE System SHALL track the date and time of each subtopic completion
5. WHEN a learner completes a subtopic, THE System SHALL record the score achieved
6. THE System SHALL allow learners to view their best score for each subtopic
7. WHEN displaying analytics, THE System SHALL show time spent on each subtopic

### Requirement 12: Content Validation Rules

**User Story:** As a system administrator, I want content validation rules enforced, so that incomplete or invalid content cannot be published.

#### Acceptance Criteria

1. WHEN activating a main topic, THE System SHALL verify Core_Notes exist and are not empty
2. WHEN activating a main topic, THE System SHALL verify exactly 5 Flash_Content screens exist
3. WHEN activating a subtopic, THE System SHALL verify at least one mandatory video lesson exists
4. WHEN activating a subtopic, THE System SHALL verify between 5 and 10 MCQs exist
5. WHEN activating a subtopic, THE System SHALL verify all MCQs are mapped to the video lesson
6. IF validation fails, THEN THE System SHALL prevent activation and display specific error messages
7. THE Admin_Portal SHALL show validation status indicators for each content item
