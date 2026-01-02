# Kiro IDE Implementation Specification

## 📋 Project: Mobile App Learning Module Migration

### Overview
Migrate Expo/React Native mobile app from current structure to new Learning Module system with separate databases for Practice, Learning, and Mock Exam modules.

---

## 🎯 Goals

1. Implement new hierarchical Learning Module structure
2. Separate question databases by module type
3. Add Core Notes and Flash Content features
4. Implement video-mapped MCQ system
5. Update progress tracking for new structure
6. Zero data loss during migration
7. Maintain backward compatibility

---

## 📚 Documentation Structure

### Primary Documents (Read in Order)

1. **MOBILE_APP_SUMMARY.md** ⭐ START HERE
   - Quick overview and checklist
   - High-level impact analysis
   - Timeline and success criteria

2. **MOBILE_APP_IMPLEMENTATION_GUIDE.md**
   - Detailed implementation guide
   - Impact analysis by section
   - Current vs new structure comparison
   - Folder structure recommendations

3. **MOBILE_APP_TASKS.md**
   - Task-by-task breakdown
   - Code examples for each task
   - API implementations
   - Screen implementations

4. **MOBILE_APP_MIGRATION_PLAN.md**
   - Week-by-week timeline
   - Feature flag implementation
   - Testing strategy
   - Data migration approach

### Supporting Documents

5. **DATABASE_STRUCTURE_SUMMARY.md**
   - Complete database schema
   - Table relationships
   - RLS policies

6. **IMPLEMENTATION_STATUS.md**
   - API status
   - Progress tracking tables
   - What's complete vs pending

7. **CONTENT_MANAGEMENT_UNIFIED.md**
   - Admin portal structure
   - How content is managed

---

## 🗂️ Implementation Tasks

### Phase 1: Setup (Week 1)

#### Task 1.1: Install Dependencies
```bash
npm install react-native-render-html
npm install react-native-progress
npm install @react-native-async-storage/async-storage
expo install expo-av
```

#### Task 1.2: Create Type Definitions
**Files to create**:
- `src/types/learning.ts` - Learning Module types
- `src/types/practice.ts` - Practice Module types
- `src/types/mockExam.ts` - Mock Exam types

**Reference**: MOBILE_APP_TASKS.md → TASK 1

#### Task 1.3: Create API Services
**Files to create**:
- `src/api/learningQuestions.ts`
- `src/api/coreNotes.ts`
- `src/api/flashContent.ts`
- `src/api/subtopics.ts`
- `src/api/practiceQuestions.ts`
- `src/api/mockExamQuestions.ts` (rename from questions.ts)

**Files to update**:
- `src/api/progress.ts` - Add new methods

**Reference**: MOBILE_APP_TASKS.md → TASK 2

#### Task 1.4: Set Up Feature Flags
**Files to create**:
- `src/config/featureFlags.ts`

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Feature Flag Implementation

---

### Phase 2: Core Features (Week 2)

#### Task 2.1: Core Notes Screen
**File to create**: `src/screens/learning/CoreNotesScreen.tsx`

**Requirements**:
- Render HTML content
- Track reading progress
- Mark as completed
- Support images

**Reference**: MOBILE_APP_TASKS.md → TASK 3

#### Task 2.2: Flash Content Screen
**File to create**: `src/screens/learning/FlashContentScreen.tsx`

**Requirements**:
- Display 5 flash screens
- Swipeable navigation
- Progress indicator
- Mark as completed

**Reference**: MOBILE_APP_TASKS.md → TASK 4

#### Task 2.3: Topic Detail Screen
**File to create**: `src/screens/learning/TopicDetailScreen.tsx`

**Requirements**:
- Show Core Notes, Flash Content, Subtopics sections
- Display progress
- Navigate to each section

**Reference**: MOBILE_APP_TASKS.md → TASK 5

#### Task 2.4: Subtopic Screens
**Files to create**:
- `src/screens/learning/SubtopicListScreen.tsx`
- `src/screens/learning/SubtopicDetailScreen.tsx`

**Requirements**:
- List subtopics with status
- Show video/podcast/MCQ tabs
- Lock/unlock logic

**Reference**: MOBILE_APP_TASKS.md → TASK 6, TASK 7

#### Task 2.5: Media Players
**Files to create/update**:
- `src/screens/learning/VideoLessonScreen.tsx` (UPDATE)
- `src/screens/learning/PodcastScreen.tsx` (NEW)

**Requirements**:
- Video playback with progress
- Podcast playback (optional)
- Track watch/listen time

**Reference**: MOBILE_APP_TASKS.md → TASK 8, TASK 9

---

### Phase 3: Assessment & Progress (Week 3)

#### Task 3.1: MCQ Assessment
**File to update**: `src/screens/learning/MCQAssessmentScreen.tsx`

**Requirements**:
- Load video-mapped questions
- One question at a time
- Show feedback and explanation
- Calculate score (80% threshold)
- Update progress

**Reference**: MOBILE_APP_TASKS.md → TASK 10

#### Task 3.2: Progress Utilities
**Files to create**:
- `src/utils/progressCalculator.ts`
- `src/utils/contentValidator.ts`

**Requirements**:
- Calculate topic/subtopic progress
- Validate content access
- Check unlock status

**Reference**: MOBILE_APP_TASKS.md → TASK 14, TASK 15

#### Task 3.3: Practice Module Update
**File to update**: `src/screens/practice/PracticeQuestionScreen.tsx`

**Requirements**:
- Use new practice_questions API
- Update question loading logic

**Reference**: MOBILE_APP_TASKS.md → TASK 11

#### Task 3.4: Mock Exam Update
**File to update**: `src/screens/mockExam/MockExamQuestionScreen.tsx`

**Requirements**:
- Use renamed mock_exam_questions API
- Update question loading logic

**Reference**: MOBILE_APP_TASKS.md → TASK 12

---

### Phase 4: Navigation & Integration (Week 4)

#### Task 4.1: Update Navigation
**File to update**: `src/navigation/LearningNavigator.tsx`

**Requirements**:
- Add new screen routes
- Update navigation types
- Test deep linking

**Reference**: MOBILE_APP_TASKS.md → TASK 13

#### Task 4.2: Integration Testing
**Requirements**:
- Test complete Learning Module flow
- Test Practice Module
- Test Mock Exam Module
- Test progress persistence

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Testing Strategy

---

### Phase 5: Testing & Polish (Week 5)

#### Task 5.1: Unit Tests
**Files to create**:
- API tests for all new services
- Utility tests
- Component tests

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Unit Tests

#### Task 5.2: Integration Tests
**Requirements**:
- End-to-end flow testing
- Progress tracking verification
- Cross-module testing

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Integration Tests

#### Task 5.3: Manual Testing
**Requirements**:
- Complete manual testing checklist
- Test all edge cases
- Performance testing

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Manual Testing Checklist

---

### Phase 6: Rollout (Week 6)

#### Task 6.1: Data Migration
**File to create**: `src/utils/progressMigration.ts`

**Requirements**:
- Migrate existing user progress
- One-time migration on first launch
- Backup old data

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Data Migration

#### Task 6.2: Gradual Rollout
**Requirements**:
- Day 1: 10% users
- Day 2: 25% users
- Day 3: 50% users
- Day 4: 100% users

**Reference**: MOBILE_APP_MIGRATION_PLAN.md → Week 6

#### Task 6.3: Monitoring
**Requirements**:
- Monitor error logs
- Track performance metrics
- Collect user feedback
- Fix issues quickly

---

## 🧪 Testing Requirements

### Must Test Before Rollout

1. **Learning Module**
   - [ ] Core Notes render correctly
   - [ ] Flash Content swipe works
   - [ ] Video playback smooth
   - [ ] Podcast playback works
   - [ ] MCQ assessment flow complete
   - [ ] Score calculation accurate (80% threshold)
   - [ ] Subtopic unlocking works
   - [ ] Progress saves correctly

2. **Practice Module**
   - [ ] Questions load from new API
   - [ ] All CRUD operations work
   - [ ] Progress saves

3. **Mock Exam Module**
   - [ ] Questions load from renamed table
   - [ ] Timer works
   - [ ] Score calculation correct

4. **Progress Tracking**
   - [ ] Progress persists after app restart
   - [ ] Progress syncs across devices
   - [ ] Migration works for existing users

---

## ⚠️ Critical Requirements

### Must Have
1. ✅ Video-mapped MCQs (all questions must have video_lesson_id)
2. ✅ 80% passing threshold (enforced)
3. ✅ Sequential subtopic unlocking
4. ✅ Progress migration for existing users
5. ✅ Feature flags for gradual rollout

### Must Not
1. ❌ Lose any user progress data
2. ❌ Break existing functionality
3. ❌ Deploy without testing
4. ❌ Skip data migration
5. ❌ Remove feature flags too early

---

## 📊 Success Metrics

### Technical Metrics
- API response time < 2 seconds
- App crash rate < 0.1%
- Error rate < 1%
- Progress save success rate > 99%

### User Metrics
- User engagement increased
- Completion rate improved
- Positive feedback > 80%
- Support tickets < 5% of users

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All code reviewed
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] Team trained

### Deployment
- [ ] Feature flags configured
- [ ] Monitoring set up
- [ ] Rollback plan ready
- [ ] Support team briefed

### Post-Deployment
- [ ] Monitor metrics
- [ ] Collect feedback
- [ ] Fix issues quickly
- [ ] Gradual rollout complete
- [ ] Feature flags removed
- [ ] Old code cleaned up

---

## 📞 Resources

### Documentation
- All docs in `jeeva-admin-portal/` folder
- Start with `MOBILE_APP_SUMMARY.md`

### Database
- Schema: `DATABASE_STRUCTURE_SUMMARY.md`
- Migration: `database/migrations/learning_module_restructure.sql`

### APIs
- Status: `IMPLEMENTATION_STATUS.md`
- Endpoints: Already implemented and tested

---

## 🎯 Next Steps for Kiro IDE

1. **Read** MOBILE_APP_SUMMARY.md
2. **Review** all task files
3. **Create** implementation plan
4. **Start** with Phase 1 tasks
5. **Follow** week-by-week timeline
6. **Test** thoroughly
7. **Deploy** gradually

**All documentation is complete and ready for implementation!** 🚀
