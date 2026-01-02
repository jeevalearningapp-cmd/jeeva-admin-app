# Mobile App Migration Plan

## 🎯 Migration Strategy

### Approach: Feature Flag + Gradual Rollout

Use feature flags to enable the new system gradually while keeping the old system as fallback.

---

## 📋 Implementation Phases

### Phase 1: Preparation & Setup

**Objectives**:
- Set up development environment
- Install dependencies
- Configure feature flags

**Tasks**:
- ✅ Review database migration (already done)
- ✅ Review admin portal changes (already done)
- 📝 Set up feature flags in mobile app
- 📝 Create development branch
- 📝 Install new dependencies

**Deliverables**:
- Feature flag system configured
- All dependencies installed
- Development environment ready

---

### Phase 2: API Layer

**Objectives**:
- Create all API services
- Implement TypeScript types
- Write unit tests

**Tasks**:
- 📝 Create TypeScript types (learning.ts, practice.ts, mockExam.ts)
- 📝 Create API services (learningQuestions, coreNotes, flashContent, subtopics)
- 📝 Update progress API
- 📝 Write API unit tests
- 📝 Test API endpoints

**Deliverables**:
- All API services implemented
- Unit tests passing
- API endpoints tested and documented

---

### Phase 3: Core Features Implementation

**Objectives**:
- Implement all new screens
- Update existing screens
- Test navigation

**Tasks**:
- 📝 Implement CoreNotesScreen
- 📝 Implement FlashContentScreen
- 📝 Implement TopicDetailScreen
- 📝 Implement SubtopicListScreen
- 📝 Implement SubtopicDetailScreen
- 📝 Update VideoLessonScreen
- 📝 Implement PodcastScreen
- 📝 Test HTML rendering
- 📝 Test media playback
- 📝 Test navigation flow

**Deliverables**:
- All core screens implemented
- Navigation working correctly
- Media playback functional

---

### Phase 4: Assessment & Progress

**Objectives**:
- Update MCQ assessment
- Implement progress tracking
- Update Practice and Mock Exam modules

**Tasks**:
- 📝 Update MCQAssessmentScreen for video-mapped questions
- 📝 Implement new scoring logic (80% threshold)
- 📝 Implement progress calculation utilities
- 📝 Update progress components
- 📝 Test subtopic unlocking logic
- 📝 Test topic progress calculation
- 📝 Update Practice module to use practice_questions table
- 📝 Update Mock Exam to use mock_exam_questions table
- 📝 Test both modules

**Deliverables**:
- MCQ assessment working with new logic
- Progress tracking accurate
- Practice and Mock Exam updated

---

### Phase 5: Navigation & Integration

**Objectives**:
- Complete navigation setup
- Integration testing
- Bug fixes

**Tasks**:
- 📝 Update LearningNavigator with new screens
- 📝 Update deep linking
- 📝 Test navigation flows
- 📝 Test back button behavior
- 📝 End-to-end testing of Learning Module
- 📝 Test Practice Module
- 📝 Test Mock Exam Module
- 📝 Test progress persistence
- 📝 Fix identified issues
- 📝 Performance optimization

**Deliverables**:
- Navigation complete
- All modules integrated
- Integration tests passing

---

### Phase 6: Testing & Polish

**Objectives**:
- Comprehensive testing
- Bug fixes
- Performance optimization

**Tasks**:
- 📝 Internal testing with team
- 📝 Beta testing with select users
- 📝 Collect feedback
- 📝 Fix reported bugs
- 📝 UI/UX improvements
- 📝 Performance optimization
- 📝 Accessibility improvements
- 📝 Code review
- 📝 Security review
- 📝 Documentation update

**Deliverables**:
- All bugs fixed
- Performance optimized
- Ready for production

---

### Phase 7: Rollout & Monitoring

**Objectives**:
- Gradual rollout to users
- Monitor metrics
- Cleanup

**Tasks**:
- 📝 Enable feature flag for initial users (10%)
- 📝 Monitor error logs and performance metrics
- 📝 Collect user feedback
- 📝 Gradually expand to more users (25%, 50%, 100%)
- 📝 Monitor metrics at each stage
- 📝 Fix any issues
- 📝 Remove feature flags after stable
- 📝 Remove old code
- 📝 Update documentation

**Deliverables**:
- Successful rollout to all users
- Stable system
- Documentation updated
- Old code removed

---

## 🚩 Feature Flag Implementation

### Setup Feature Flags

**File**: `src/config/featureFlags.ts` (NEW)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FEATURE_FLAGS = {
  NEW_LEARNING_MODULE: 'new_learning_module',
  NEW_PRACTICE_API: 'new_practice_api',
  NEW_MOCK_EXAM_API: 'new_mock_exam_api',
};

export const featureFlags = {
  async isEnabled(flag: string): Promise<boolean> {
    try {
      // Check remote config first (e.g., Firebase Remote Config)
      const remoteValue = await this.getRemoteFlag(flag);
      if (remoteValue !== null) return remoteValue;

      // Fallback to local storage
      const localValue = await AsyncStorage.getItem(`feature_${flag}`);
      return localValue === 'true';
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false; // Default to disabled
    }
  },

  async enable(flag: string): Promise<void> {
    await AsyncStorage.setItem(`feature_${flag}`, 'true');
  },

  async disable(flag: string): Promise<void> {
    await AsyncStorage.setItem(`feature_${flag}`, 'false');
  },

  async getRemoteFlag(flag: string): Promise<boolean | null> {
    // Implement remote config check here
    // e.g., Firebase Remote Config, LaunchDarkly, etc.
    return null;
  },
};
```

### Usage in Components

```typescript
import { featureFlags, FEATURE_FLAGS } from '@/config/featureFlags';

// In TopicListScreen
const [useNewModule, setUseNewModule] = useState(false);

useEffect(() => {
  featureFlags.isEnabled(FEATURE_FLAGS.NEW_LEARNING_MODULE).then(setUseNewModule);
}, []);

if (useNewModule) {
  // Use new Learning Module structure
  return <NewTopicList />;
} else {
  // Use old structure
  return <OldTopicList />;
}
```

---

## 🧪 Testing Strategy

### Unit Tests

**Test Files to Create**:

1. **API Tests**
   - `src/api/__tests__/learningQuestions.test.ts`
   - `src/api/__tests__/coreNotes.test.ts`
   - `src/api/__tests__/flashContent.test.ts`
   - `src/api/__tests__/subtopics.test.ts`
   - `src/api/__tests__/progress.test.ts`

2. **Utility Tests**
   - `src/utils/__tests__/progressCalculator.test.ts`
   - `src/utils/__tests__/contentValidator.test.ts`

3. **Component Tests**
   - `src/screens/__tests__/CoreNotesScreen.test.tsx`
   - `src/screens/__tests__/FlashContentScreen.test.tsx`
   - `src/screens/__tests__/MCQAssessmentScreen.test.tsx`

**Example Test**:
```typescript
// src/api/__tests__/learningQuestions.test.ts
import { learningQuestionsAPI } from '../learningQuestions';

describe('learningQuestionsAPI', () => {
  it('should fetch questions by subtopic ID', async () => {
    const questions = await learningQuestionsAPI.getBySubtopicId('test-id');
    expect(questions).toBeInstanceOf(Array);
    expect(questions[0]).toHaveProperty('videoLessonId');
  });

  it('should validate correct answer', async () => {
    const result = await learningQuestionsAPI.submitAnswer('q-id', 'opt-id');
    expect(result).toHaveProperty('isCorrect');
    expect(result).toHaveProperty('explanation');
  });
});
```

---

### Integration Tests

**Test Scenarios**:

1. **Learning Module Flow**
   ```
   User opens topic
   → Reads core notes
   → Views flash content
   → Opens subtopic
   → Watches video
   → Takes MCQ assessment
   → Passes with 80%+
   → Subtopic marked complete
   → Next subtopic unlocked
   ```

2. **Progress Tracking**
   ```
   User completes subtopic
   → Progress saved to database
   → Topic progress updated
   → UI reflects new progress
   → Progress persists after app restart
   ```

3. **Practice Module**
   ```
   User selects category
   → Selects subdivision
   → Questions loaded from practice_questions table
   → User answers questions
   → Score calculated
   → Progress saved
   ```

4. **Mock Exam Module**
   ```
   User starts mock exam
   → Questions loaded from mock_exam_questions table
   → Timer starts
   → User completes exam
   → Score calculated
   → Results saved
   ```

---

### Manual Testing Checklist

#### Learning Module
- [ ] Topic list displays correctly
- [ ] Topic detail shows all sections
- [ ] Core notes render HTML properly
- [ ] Core notes can be marked complete
- [ ] Flash content shows 5 screens
- [ ] Flash content swipe works
- [ ] Flash content can be marked complete
- [ ] Subtopic list shows all subtopics
- [ ] Locked subtopics are disabled
- [ ] Subtopic detail shows video/podcast/MCQ tabs
- [ ] Video plays correctly
- [ ] Video progress is tracked
- [ ] Podcast plays correctly (if available)
- [ ] MCQ assessment loads questions
- [ ] MCQ shows correct/incorrect feedback
- [ ] MCQ shows explanation
- [ ] MCQ calculates score correctly
- [ ] MCQ requires 80% to pass
- [ ] Subtopic marked complete after passing
- [ ] Next subtopic unlocks after completion
- [ ] Topic progress updates correctly

#### Practice Module
- [ ] Practice topics load from new API
- [ ] Questions load from practice_questions table
- [ ] Questions display correctly
- [ ] Answers can be submitted
- [ ] Score is calculated
- [ ] Progress is saved

#### Mock Exam Module
- [ ] Mock exam loads from new API
- [ ] Questions load from mock_exam_questions table
- [ ] Timer works correctly
- [ ] Questions display correctly
- [ ] Exam can be completed
- [ ] Score is calculated
- [ ] Results are saved

#### Progress Tracking
- [ ] Progress saves correctly
- [ ] Progress loads on app restart
- [ ] Progress displays in UI
- [ ] Progress syncs across devices

#### Edge Cases
- [ ] No internet connection handling
- [ ] Empty content handling
- [ ] Missing video/podcast handling
- [ ] Failed API calls handling
- [ ] Concurrent progress updates
- [ ] App backgrounding during video
- [ ] App backgrounding during assessment

---

## 🔄 Data Migration for Existing Users

### User Progress Migration

**Challenge**: Existing users have progress in old structure, need to migrate to new structure.

**Solution**: Run migration script on first app launch with new version.

**File**: `src/utils/progressMigration.ts` (NEW)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const MIGRATION_KEY = 'progress_migration_v1_completed';

export const progressMigration = {
  async needsMigration(): Promise<boolean> {
    const completed = await AsyncStorage.getItem(MIGRATION_KEY);
    return completed !== 'true';
  },

  async migrateUserProgress(userId: string): Promise<void> {
    try {
      console.log('Starting progress migration for user:', userId);

      // Get old progress data
      const { data: oldProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (!oldProgress || oldProgress.length === 0) {
        console.log('No old progress to migrate');
        await this.markMigrationComplete();
        return;
      }

      // Migrate to new structure
      for (const progress of oldProgress) {
        // Determine if this is a topic or subtopic
        if (progress.lesson_id) {
          // This is a subtopic (lesson) progress
          await this.migrateSubtopicProgress(userId, progress);
        } else if (progress.topic_id) {
          // This is a topic progress
          await this.migrateTopicProgress(userId, progress);
        }
      }

      await this.markMigrationComplete();
      console.log('Progress migration completed');
    } catch (error) {
      console.error('Progress migration failed:', error);
      throw error;
    }
  },

  async migrateSubtopicProgress(userId: string, oldProgress: any): Promise<void> {
    // Map old progress to new subtopic_progress structure
    const newProgress = {
      user_id: userId,
      topic_id: oldProgress.topic_id,
      subtopic_id: oldProgress.lesson_id,
      status: oldProgress.completed ? 'completed' : 'in_progress',
      score: oldProgress.score,
      best_score: oldProgress.best_score || oldProgress.score,
      attempts: oldProgress.attempts || 1,
      time_spent_seconds: oldProgress.time_spent || 0,
      completed_at: oldProgress.completed_at,
    };

    await supabase
      .from('subtopic_progress')
      .upsert(newProgress, { onConflict: 'user_id,subtopic_id' });
  },

  async migrateTopicProgress(userId: string, oldProgress: any): Promise<void> {
    // Map old progress to new topic_progress structure
    const newProgress = {
      user_id: userId,
      topic_id: oldProgress.topic_id,
      core_notes_completed: oldProgress.core_notes_read || false,
      flash_content_completed: oldProgress.flash_cards_viewed || false,
      progress_percentage: oldProgress.progress_percentage || 0,
      completed_at: oldProgress.completed_at,
    };

    await supabase
      .from('topic_progress')
      .upsert(newProgress, { onConflict: 'user_id,topic_id' });
  },

  async markMigrationComplete(): Promise<void> {
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
  },
};
```

**Usage in App.tsx**:
```typescript
import { progressMigration } from '@/utils/progressMigration';

useEffect(() => {
  async function checkMigration() {
    if (await progressMigration.needsMigration()) {
      const userId = await getCurrentUserId();
      await progressMigration.migrateUserProgress(userId);
    }
  }
  checkMigration();
}, []);
```

---

## 📊 Gradual Rollout Strategy

### Rollout Stages

1. **Stage 1: Internal Testing (10% of users)**
   - Enable for development team
   - Enable for QA team
   - Enable for select beta testers
   - Monitor closely for issues

2. **Stage 2: Expand (25% of users)**
   - Enable for more users
   - Monitor error rates
   - Collect feedback
   - Fix any issues

3. **Stage 3: Majority (50% of users)**
   - Enable for half of user base
   - Verify stability
   - Monitor performance
   - Ensure no major issues

4. **Stage 4: Full Rollout (100% of users)**
   - Enable for all users
   - Continue monitoring
   - Be ready to rollback if needed

### Monitoring Metrics

**Technical Metrics**:
- API response times
- Error rates
- Crash rates
- Progress save success rate

**User Metrics**:
- User engagement
- Completion rates
- Time spent per module
- User feedback/ratings

### Rollback Plan

If issues are detected:
1. Disable feature flags immediately
2. Users revert to old system
3. Fix issues in development
4. Re-test thoroughly
5. Resume rollout

---

## ✅ Success Criteria

### Technical
- ✅ All new APIs working
- ✅ All screens rendering correctly
- ✅ Progress tracking accurate
- ✅ No data loss during migration
- ✅ Performance acceptable (< 2s load times)
- ✅ Error rate < 1%
- ✅ Crash rate < 0.1%

### User Experience
- ✅ Intuitive navigation
- ✅ Clear progress indicators
- ✅ Smooth video/audio playback
- ✅ Helpful error messages
- ✅ Offline support (cached content)

### Business
- ✅ Zero downtime deployment
- ✅ Positive user feedback > 80%
- ✅ Increased engagement metrics
- ✅ Support tickets < 5% of users

---

## 🎯 Ready to Implement

All documentation is complete. Follow the phases in order, test thoroughly at each stage, and use feature flags for safe rollout.
