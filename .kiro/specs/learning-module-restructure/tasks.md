# Implementation Plan: Learning Module Restructure

## Overview

This implementation plan covers the restructuring of the Learning Module and separation of question databases by module type. The work is organized into phases to minimize risk and allow for incremental testing.

## Tasks

- [ ] 0. Pre-Migration Verification
  - Verify existing database schema and data before creating new tables
  - _Requirements: All requirements (safety check)_

- [ ] 0.1 Run Database Schema Verification Script
  - Execute verify_existing_schema.sql on production database
  - Review results to understand current schema state
  - Document row counts for questions table
  - Check for any existing module_type or category fields
  - Verify foreign key relationships
  - Confirm new tables don't already exist
  - Save verification results for migration planning
  - _Requirements: 9.1-9.8_

- [x] 0.2 Backup Existing Database
  - Create full database backup before any schema changes
  - Export questions and question_options tables to CSV
  - Document backup location and restore procedure
  - Test restore procedure on development database
  - _Requirements: 9.1-9.8_

- [ ] 0.3 Analyze Existing Question Distribution
  - Query questions table to count questions by lesson association
  - Identify questions that belong to Practice Module
  - Identify questions that belong to Learning Module
  - Identify questions without lesson_id (Mock Exam candidates)
  - Create distribution report for migration planning
  - _Requirements: 9.2_

- [x] 1. Database Schema Creation
  - Create new database tables and indexes for separated question storage and new content types
  - _Requirements: 1.1-1.7, 9.1-9.8_

- [x] 1.1 Create Practice Questions Tables
  - Create practice_questions table with category and subdivision fields
  - Create practice_question_options table with foreign key to practice_questions
  - Add indexes for category, subdivision, and is_active fields
  - _Requirements: 1.1, 1.2, 2.8_

- [x] 1.2 Create Learning Questions Tables
  - Create learning_questions table with topic_id, subtopic_id, and video_lesson_id foreign keys
  - Create learning_question_options table with foreign key to learning_questions
  - Add indexes for topic_id, subtopic_id, video_lesson_id, and is_active fields
  - _Requirements: 1.1, 1.3, 7.1-7.5_

- [x] 1.3 Rename Existing Questions Table for Mock Exam
  - Rename questions table to mock_exam_questions
  - Rename question_options table to mock_exam_question_options
  - Update foreign key constraint names
  - Verify all indexes are preserved
  - Update RLS policies to reference new table name
  - _Requirements: 1.1, 1.4_

- [x] 1.4 Create Topic Core Notes Table
  - Create topic_core_notes table with topic_id foreign key and UNIQUE constraint
  - Add content field for HTML storage
  - Add sections JSONB field for structured content
  - Add indexes for topic_id
  - _Requirements: 4.1-4.8, 9.4_

- [x] 1.5 Create Topic Flash Content Table
  - Create topic_flash_content table with topic_id foreign key
  - Add screen_number field with CHECK constraint (1-5)
  - Add UNIQUE constraint on (topic_id, screen_number)
  - Add indexes for topic_id and screen_number
  - _Requirements: 4.3, 4.7, 10.1-10.6_

- [x] 1.6 Create Progress Tracking Tables
  - Create subtopic_progress table with user_id, topic_id, subtopic_id foreign keys
  - Add status, score, best_score, attempts, time_spent_seconds fields
  - Create topic_progress table with user_id, topic_id foreign keys
  - Add core_notes_completed, flash_content_completed, progress_percentage fields
  - Add indexes for user_id, topic_id, subtopic_id, and status
  - _Requirements: 11.1-11.7_

- [x] 1.7 Update Lessons Table Schema
  - Add is_mandatory BOOLEAN field (default true)
  - Add content_type VARCHAR(50) field with CHECK constraint
  - Add podcast_url TEXT field
  - Update existing records to set content_type based on existing data
  - _Requirements: 5.9, 5.10_

- [x] 1.8 Apply Row Level Security Policies
  - Create RLS policies for practice_questions (admin full access, users read active only)
  - Create RLS policies for learning_questions (admin full access, users read active only)
  - Create RLS policies for mock_exam_questions (admin full access, users read active only)
  - Create RLS policies for topic_core_notes (admin full access, users read active only)
  - Create RLS policies for topic_flash_content (admin full access, users read active only)
  - Create RLS policies for progress tables (users can only access their own progress)
  - _Requirements: All requirements (security)_

- [x] 2. Data Migration Script
  - Migrate Practice and Learning questions from mock_exam_questions to new tables
  - _Requirements: 9.1-9.8_

- [x] 2.1 Implement Question Classification Logic
  - Write function to analyze questions in mock_exam_questions table
  - Determine if question belongs to Practice or Learning based on lesson associations
  - Questions without lesson_id remain in mock_exam_questions (for Mock Exam)
  - _Requirements: 9.2_

- [x] 2.2 Implement Practice Questions Migration
  - Extract questions associated with Practice Module lessons from mock_exam_questions
  - Copy to practice_questions table with category and subdivision
  - Copy question options to practice_question_options table
  - Delete migrated questions from mock_exam_questions
  - Verify data integrity after migration
  - _Requirements: 9.2, 9.7_

- [x] 2.3 Implement Learning Questions Migration
  - Extract questions associated with Learning Module lessons from mock_exam_questions
  - Copy to learning_questions table with topic_id, subtopic_id, video_lesson_id
  - Copy question options to learning_question_options table
  - Delete migrated questions from mock_exam_questions
  - Verify data integrity after migration
  - _Requirements: 9.2, 9.7_

- [x] 2.4 Verify Mock Exam Questions Remain
  - Verify questions without lesson associations remain in mock_exam_questions
  - Verify all Mock Exam functionality still works
  - Check foreign key relationships
  - _Requirements: 9.2, 9.7_

- [x] 2.5 Create Migration Rollback Script
  - Implement rollback logic to restore original questions table
  - Copy migrated questions back to original table
  - Rename mock_exam_questions back to questions
  - Test rollback procedure
  - Document rollback steps
  - _Requirements: 9.6_

- [x] 3. Backend API Updates
  - Update API endpoints to query new question tables based on module type
  - _Requirements: 1.1-1.7_

- [x] 3.1 Create Practice Questions API Endpoints
  - GET /api/practice/questions?category=X&subdivision=Y
  - POST /api/practice/questions (admin only)
  - PUT /api/practice/questions/:id (admin only)
  - DELETE /api/practice/questions/:id (admin only)
  - _Requirements: 1.2, 2.1-2.8_

- [x] 3.2 Create Learning Questions API Endpoints
  - GET /api/learning/questions?topicId=X&subtopicId=Y&videoLessonId=Z
  - POST /api/learning/questions (admin only)
  - PUT /api/learning/questions/:id (admin only)
  - DELETE /api/learning/questions/:id (admin only)
  - _Requirements: 1.3, 5.1-5.10, 7.1-7.5_

- [x] 3.3 Create Mock Exam Questions API Endpoints
  - GET /api/mock-exam/questions?difficulty=X
  - POST /api/mock-exam/questions (admin only)
  - PUT /api/mock-exam/questions/:id (admin only)
  - DELETE /api/mock-exam/questions/:id (admin only)
  - _Requirements: 1.4_

- [x] 3.4 Create Topic Core Notes API Endpoints
  - GET /api/topics/:topicId/core-notes
  - POST /api/topics/:topicId/core-notes (admin only)
  - PUT /api/topics/:topicId/core-notes (admin only)
  - _Requirements: 4.1-4.8_

- [x] 3.5 Create Topic Flash Content API Endpoints
  - GET /api/topics/:topicId/flash-content
  - POST /api/topics/:topicId/flash-content (admin only)
  - PUT /api/topics/:topicId/flash-content/:screenNumber (admin only)
  - DELETE /api/topics/:topicId/flash-content/:screenNumber (admin only)
  - _Requirements: 4.3, 4.7, 10.1-10.6_

- [x] 3.6 Create Progress Tracking API Endpoints
  - GET /api/users/:userId/topic-progress
  - GET /api/users/:userId/subtopic-progress?topicId=X
  - POST /api/users/:userId/subtopic-progress (update progress after MCQ completion)
  - GET /api/users/:userId/topics/:topicId/progress (calculate overall topic progress)
  - _Requirements: 11.1-11.7_

- [x] 3.7 Create Topic Management API Endpoints
  - GET /api/learning/topics (list all topics)
  - POST /api/learning/topics (admin only - create new topic)
  - PUT /api/learning/topics/:id (admin only - edit topic)
  - DELETE /api/learning/topics/:id (admin only - delete topic with cascade warning)
  - PUT /api/learning/topics/reorder (admin only - reorder topics)
  - _Requirements: 3.1-3.7_

- [x] 3.8 Create Content Validation API Endpoints
  - GET /api/topics/:topicId/validation-status (check if topic is ready for activation)
  - GET /api/subtopics/:subtopicId/validation-status (check if subtopic is ready for activation)
  - _Requirements: 12.1-12.7_

- [x] 4. Admin Portal - Practice Module Management
  - Build UI for managing Practice Module with fixed structure
  - _Requirements: 2.1-2.8, 8.11_

- [x] 4.1 Create Practice Module Topic Selector
  - Build dropdown/tabs for Numeracy and Clinical Knowledge
  - Display fixed subtopic list based on selected topic
  - Show question count per subtopic
  - _Requirements: 2.1-2.3_

- [x] 4.2 Create Practice Question List Component
  - Display questions filtered by category and subdivision
  - Show question text, difficulty, and active status
  - Add search and filter functionality
  - Add pagination for large question lists
  - _Requirements: 2.4-2.7_

- [x] 4.3 Create Practice Question Form Component
  - Build form for creating/editing practice questions
  - Include fields: question_text, difficulty, explanation, image_url
  - Add option editor (4 options with one correct answer)
  - Validate at least one correct answer
  - _Requirements: 2.4-2.7, 8.11_

- [x] 4.4 Create Practice Question Bulk Import
  - Build CSV upload interface
  - Parse CSV and validate format
  - Map CSV columns to database fields
  - Show preview before import
  - Handle errors and show import results
  - _Requirements: 2.4-2.7_

- [x] 5. Admin Portal - Learning Module Management
  - Build UI for managing Learning Module with dynamic structure
  - _Requirements: 3.1-3.7, 4.1-4.8, 5.1-5.10, 8.1-8.12_

- [x] 5.1 Create Learning Module Topic List Component
  - Display all learning topics with progress indicators
  - Show validation status (complete/incomplete) for each topic
  - Add "Add New Topic" button
  - Add edit/delete/reorder actions
  - Implement drag-and-drop reordering
  - _Requirements: 3.1-3.7, 8.1_

- [x] 5.2 Create Topic Creation/Edit Modal
  - Build form for topic title, description, display_order
  - Auto-create placeholders for Core Notes and Flash Content on creation
  - Show validation errors
  - _Requirements: 3.2-3.4, 3.6_

- [x] 5.3 Create Topic Core Notes Editor
  - Integrate rich text editor (e.g., TipTap, Quill)
  - Support section organization with titles
  - Add image upload functionality
  - Auto-save drafts
  - Show character/word count
  - _Requirements: 4.1-4.2, 4.6, 4.8, 8.2_

- [x] 5.4 Create Topic Flash Content Editor
  - Build interface for managing 5 flash screens
  - Show screen number (1-5) with navigation
  - Add title and content fields per screen
  - Support image upload per screen
  - Enforce exactly 5 screens
  - _Requirements: 4.3, 4.7, 8.3, 10.5_

- [x] 5.5 Create Subtopic List Component
  - Display all subtopics for selected topic
  - Show content status (video, podcast, MCQs)
  - Show validation status per subtopic
  - Add create/edit/delete actions
  - _Requirements: 4.4-4.5, 8.4_

- [x] 5.6 Create Subtopic Editor - Video Lesson Tab
  - Build video upload interface
  - Support video URL input (for external hosting)
  - Mark as mandatory
  - Show video preview
  - Add duration field
  - _Requirements: 5.1, 5.9, 8.5-8.6_

- [x] 5.7 Create Subtopic Editor - Podcast Tab
  - Build audio upload interface
  - Support podcast URL input (for external hosting)
  - Mark as optional
  - Show audio player preview
  - Add duration field
  - _Requirements: 5.2, 5.10, 8.7_

- [x] 5.8 Create Subtopic Editor - MCQ Tab
  - Display list of video-mapped MCQs (5-10)
  - Show question count and validation status
  - Add create/edit/delete MCQ actions
  - Enforce 5-10 question limit
  - _Requirements: 5.3-5.8, 7.1-7.5, 8.8-8.9_

- [x] 5.9 Create Video-Mapped MCQ Form
  - Build form for creating/editing learning questions
  - Auto-populate video_lesson_id from current subtopic
  - Include fields: question_text, difficulty, explanation, image_url
  - Add option editor (4 options with one correct answer)
  - Validate mapping to video lesson
  - _Requirements: 7.1-7.5, 8.9_

- [x] 5.10 Create Content Validation Component
  - Show validation checklist for topic activation
  - Check: Core Notes exist and not empty
  - Check: Exactly 5 Flash Content screens
  - Check: All subtopics have mandatory video
  - Check: All subtopics have 5-10 MCQs
  - Check: All MCQs mapped to video lessons
  - Display specific error messages for failures
  - _Requirements: 12.1-12.7, 8.10_

- [ ] 6. Mobile App - Learning Module UI **(MOBILE APP PROJECT - NOT ADMIN PORTAL)**
  - Build mobile interface for new Learning Module structure
  - _Requirements: 4.1-4.8, 5.1-5.10, 6.1-6.6, 10.1-10.6, 11.1-11.7_
  - _Note: This task is for the mobile application, not the admin portal_

- [ ] 6.1 Create Topic List Screen
  - Display all learning topics with progress percentage
  - Show topic thumbnail and description
  - Allow access to any topic (non-sequential)
  - Show locked/in-progress/completed status per topic
  - _Requirements: 6.1-6.6_

- [ ] 6.2 Create Main Topic Screen
  - Display topic title and overall progress
  - Show "Core Notes" section with "Read Now" button
  - Show "Flash Content" section with "Review" button
  - Display subtopic list with status indicators (✓ completed, → current, 🔒 locked)
  - Show progress percentage per subtopic
  - _Requirements: 4.1-4.8, 6.4_

- [ ] 6.3 Create Core Notes Reader
  - Display rich text content with formatting
  - Support section navigation
  - Show images inline
  - Add "Mark as Complete" button
  - Track reading progress
  - _Requirements: 4.1-4.2, 4.6_

- [ ] 6.4 Create Flash Content Viewer
  - Display 5 flash screens in sequence
  - Show screen number (1/5, 2/5, etc.)
  - Add next/previous navigation
  - Support images per screen
  - Add "Mark as Complete" button after viewing all 5
  - _Requirements: 4.3, 10.1-10.6_

- [ ] 6.5 Create Subtopic Screen
  - Display subtopic title and description
  - Show video lesson section with play button and duration
  - Show podcast section (if available) with play button and duration
  - Show assessment section with question count and passing score
  - Disable assessment until video is watched
  - _Requirements: 5.1-5.10_

- [ ] 6.6 Create Video Player Component
  - Integrate video player (e.g., react-native-video)
  - Support both local and remote videos
  - Track watch progress
  - Mark video as watched when completed
  - Show playback controls
  - _Requirements: 5.1, 5.9_

- [ ] 6.7 Create Podcast Player Component
  - Integrate audio player
  - Support both local and remote audio
  - Track listen progress
  - Show playback controls (play/pause, seek, speed)
  - _Requirements: 5.2, 5.10_

- [ ] 6.8 Create Subtopic MCQ Assessment Screen
  - Display questions one at a time
  - Show question number (1/7, 2/7, etc.)
  - Display 4 options per question
  - Lock answer after selection
  - Show correct/incorrect immediately
  - Display explanation after answer
  - Add "Next Question" button
  - _Requirements: 5.3-5.8_

- [ ] 6.9 Create Assessment Results Screen
  - Display final score (percentage and fraction)
  - Show pass/fail status (80% threshold)
  - If passed: Show "Next Subtopic" button and unlock next subtopic
  - If failed: Show "Try Again" button
  - Display time taken
  - Show question-by-question breakdown
  - _Requirements: 5.5-5.7, 11.4-11.6_

- [ ] 6.10 Implement Subtopic Progression Logic
  - Check if previous subtopic is completed before allowing access
  - Unlock next subtopic when current subtopic passed with >= 80%
  - Update subtopic_progress table on completion
  - Update topic_progress table when all subtopics completed
  - Track attempts, best score, and time spent
  - _Requirements: 5.6-5.8, 6.4-6.5, 11.1-11.7_

- [ ] 7. Mobile App - Practice Module UI **(MOBILE APP PROJECT - NOT ADMIN PORTAL)**
  - Build mobile interface for Practice Module
  - _Requirements: 2.1-2.8_
  - _Note: This task is for the mobile application, not the admin portal_

- [ ] 7.1 Create Practice Topic List Screen
  - Display Numeracy and Clinical Knowledge topics
  - Show subtopic list per topic
  - Display question count per subtopic
  - Allow free navigation (no locks)
  - _Requirements: 2.1-2.4_

- [ ] 7.2 Create Practice Question Screen
  - Display questions one at a time
  - Show question number and total
  - Display 4 options per question
  - Show correct/incorrect immediately after selection
  - Display explanation
  - Add "Next Question" button
  - Allow skipping questions
  - _Requirements: 2.5-2.7_

- [ ] 7.3 Create Practice Results Screen
  - Display total questions attempted
  - Show correct/incorrect counts
  - Display score percentage
  - Show topic-wise breakdown
  - Add "Practice Again" button
  - _Requirements: 2.6-2.7_

- [ ] 8. Testing and Validation
  - Test all functionality and validate data integrity
  - _Requirements: All requirements_

- [ ] 8.1 Test Database Migration
  - Run migration script on test database
  - Verify all questions migrated correctly
  - Check foreign key relationships
  - Validate data integrity
  - Test rollback procedure
  - _Requirements: 9.1-9.8_

- [ ] 8.2 Test Admin Portal - Practice Module
  - Test topic/subtopic selection
  - Test question CRUD operations
  - Test bulk import
  - Test validation rules
  - _Requirements: 2.1-2.8, 8.11_

- [ ] 8.3 Test Admin Portal - Learning Module
  - Test topic creation/editing/deletion
  - Test Core Notes editor
  - Test Flash Content editor (5 screens)
  - Test subtopic management
  - Test video/podcast upload
  - Test video-mapped MCQ creation
  - Test content validation
  - _Requirements: 3.1-3.7, 4.1-4.8, 5.1-5.10, 8.1-8.12, 12.1-12.7_

- [ ] 8.4 Test Mobile App - Learning Module
  - Test topic list and navigation
  - Test Core Notes reader
  - Test Flash Content viewer
  - Test subtopic screen
  - Test video/podcast players
  - Test MCQ assessment flow
  - Test subtopic progression (80% threshold)
  - Test progress tracking
  - _Requirements: 4.1-4.8, 5.1-5.10, 6.1-6.6, 10.1-10.6, 11.1-11.7_

- [ ] 8.5 Test Mobile App - Practice Module
  - Test topic list
  - Test question flow
  - Test immediate feedback
  - Test results screen
  - _Requirements: 2.1-2.8_

- [ ] 8.6 Test API Endpoints
  - Test all GET endpoints with various filters
  - Test POST/PUT/DELETE endpoints (admin only)
  - Test authorization and RLS policies
  - Test error handling
  - _Requirements: 1.1-1.7_

- [ ] 8.7 Performance Testing
  - Test query performance with large datasets
  - Test pagination
  - Test caching
  - Optimize slow queries
  - _Requirements: All requirements (performance)_

- [ ] 9. Documentation and Deployment
  - Document new structure and deploy to production
  - _Requirements: All requirements_

- [ ] 9.1 Update API Documentation
  - Document all new API endpoints
  - Include request/response examples
  - Document authentication requirements
  - _Requirements: All requirements_

- [ ] 9.2 Update Admin User Guide
  - Document Practice Module management
  - Document Learning Module management
  - Include screenshots and workflows
  - Document content validation rules
  - _Requirements: 2.1-2.8, 3.1-3.7, 4.1-4.8, 5.1-5.10, 8.1-8.12, 12.1-12.7_

- [ ] 9.3 Update Mobile App User Guide
  - Document new Learning Module structure
  - Explain subtopic progression
  - Document Practice Module usage
  - _Requirements: 2.1-2.8, 4.1-4.8, 5.1-5.10, 6.1-6.6_

- [ ] 9.4 Deploy Database Changes
  - Run migration script on production
  - Verify data integrity
  - Monitor for errors
  - Keep rollback script ready
  - _Requirements: 9.1-9.8_

- [ ] 9.5 Deploy Backend API Updates
  - Deploy new API endpoints
  - Enable feature flags
  - Monitor API performance
  - _Requirements: 1.1-1.7_

- [ ] 9.6 Deploy Admin Portal Updates
  - Deploy new admin components
  - Enable feature flags
  - Train admins on new interface
  - _Requirements: 2.1-2.8, 3.1-3.7, 4.1-4.8, 5.1-5.10, 8.1-8.12_

- [ ] 9.7 Deploy Mobile App Updates
  - Deploy new mobile components
  - Enable feature flags
  - Gradual rollout to users
  - Monitor user feedback
  - _Requirements: 2.1-2.8, 4.1-4.8, 5.1-5.10, 6.1-6.6_

- [ ] 9.8 Post-Deployment Monitoring
  - Monitor database performance
  - Monitor API response times
  - Monitor user engagement metrics
  - Collect user feedback
  - Address any issues
  - _Requirements: All requirements_

- [ ] 10. Cleanup and Optimization
  - Remove old code and optimize performance
  - _Requirements: All requirements_

- [ ] 10.1 Archive Old Code References
  - Remove references to old "questions" table name in documentation
  - Update any remaining code comments
  - Archive migration scripts
  - _Requirements: 9.1-9.8_

- [ ] 10.2 Remove Feature Flags
  - Remove feature flags after successful rollout
  - Clean up conditional code
  - _Requirements: All requirements_

- [ ] 10.3 Optimize Database Queries
  - Analyze slow queries
  - Add missing indexes
  - Optimize JOIN queries
  - _Requirements: All requirements (performance)_

- [ ] 10.4 Update Caching Strategy
  - Implement caching for static content
  - Optimize cache invalidation
  - Monitor cache hit rates
  - _Requirements: All requirements (performance)_

## Notes

- This is a large restructuring project that will take multiple sprints
- Database migration should be done during low-traffic hours
- Feature flags should be used for gradual rollout
- Regular backups should be taken before each deployment phase
- Rollback procedures should be tested and documented
- User feedback should be collected throughout the rollout
