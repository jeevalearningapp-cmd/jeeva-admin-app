# 📱 Jeeva Learning Mobile App - Features Specification

## Overview

Jeeva Learning is a mobile application for **Indian nurses** preparing for the **UK NMC CBT (Computer-Based Test) exam**. The app provides comprehensive exam preparation through structured learning, on-demand practice, realistic mock exams, and AI-powered support.

**Target Users:** Indian registered nurses planning to work in the UK  
**Exam Focus:** NMC CBT (Numeracy, Clinical Knowledge, Professional Standards)  
**Platform:** React Native with Expo  
**Backend:** Supabase

---

## 🎯 Core Value Proposition

**Transform Indian nurses to think and practice like UK nurses** through:

- 🏥 UK-specific clinical scenarios and professional standards (NMC Code)
- 📚 Multi-format learning (videos, podcasts, text lessons, flashcards)
- 🎯 Large MCQ database for topic-targeted practice
- 📝 Realistic mock exams mimicking actual Pearson VUE CBT experience
- 🤖 AI-powered chatbot (JeevaBot) for 24/7 doubt clearing
- 📊 Performance analytics and personalized study recommendations

---

## 📚 NMC CBT Exam Syllabus

### Module 1: Numeracy

- Dosage calculations
- Unit conversions (mg to g, mL to L)
- IV flow rate calculations
- Fluid balance
- Body Mass Index (BMI)
- Pediatric dosing

**Exam:** Part A - 15 questions, 22.5 mins, pass: 13/15 (87%)

### Module 2: Clinical Knowledge

- Medical-Surgical Nursing
- Pharmacology (UK BNF)
- Infection Control
- Wound Care
- Palliative Care
- Emergency Care
- Maternal & Child Health

**Exam:** Part B - 60 questions, 90 mins, pass: ~70%

### Module 3: Professional Standards (NMC Code)

- **Prioritise People** - Patient autonomy, consent, confidentiality
- **Practice Effectively** - Evidence-based care, communication, teamwork
- **Preserve Safety** - Risk management, safeguarding, incident reporting
- **Promote Professionalism** - Accountability, integrity, duty of candour
- Mental Capacity Act 2005
- Equality & Diversity
- Cultural Adaptation (India vs UK)

**Exam:** Professional Standards - 50 questions, 75 mins

---

## 🏗️ App Architecture

### 3 Core Modules

```
┌─────────────────────────────────────────────┐
│                                             │
│         Jeeva Learning Mobile App           │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  📚 Learning Module  (Structured Content)   │
│  🎯 Practice Module  (On-Demand MCQs)       │
│  📝 Mock Exam Module (CBT Simulation)       │
│                                             │
│  🤖 AI JeevaBot      (Chatbot Support)      │
│  👤 Profile          (Performance & Settings)│
│  🏠 Dashboard        (Overview & Hero)      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📚 Module 1: Learning Module

### Purpose

**Structured, sequential learning** to build foundational knowledge and master UK nursing protocols.

### Content Types

**1. Text Lessons 📖**

- Comprehensive study materials
- Clinical scenarios with UK context
- NMC Code explanations
- Professional standards guidance

**2. Video Lessons 🎬**

- Scenario-based clinical videos
- Procedural demonstrations
- Expert nurse explanations
- Cultural adaptation tips

**3. Audio Podcasts 🎙️**

- Conversational learning format
- Listen while commuting
- Clinical case discussions
- Expert interviews

**4. Flashcards 🃏**

- Quick concept revision
- Drug interactions
- Protocols and guidelines
- Spaced repetition

**5. Embedded Questions ✍️**

- After each lesson
- Test comprehension
- Immediate feedback

### 80% Mastery Threshold

**Concept:**
Students must answer **80% of questions correctly** after each lesson to prove understanding before progressing.

**Flow:**

```
Read Lesson → Answer Questions → Score < 80% → Review & Retry
                               → Score ≥ 80% → Mark Complete → Next Lesson
```

**Implementation:**

```javascript
async function checkLessonMastery(userId, lessonId, score) {
  const masteryThreshold = 0.8; // 80%

  if (score >= masteryThreshold) {
    // Mark lesson as completed
    await db.insert(learning_completions).values({
      user_id: userId,
      lesson_id: lessonId,
      score: score,
      completed_at: new Date(),
    });

    return { passed: true, message: "Great job! Lesson completed!" };
  } else {
    return {
      passed: false,
      message: `You scored ${score * 100}%. Review the lesson and try again to reach 80%.`,
    };
  }
}
```

### Content Hierarchy

```
Module (e.g., Clinical Knowledge)
  ↓
Topic (e.g., Pharmacology)
  ↓
Lesson (e.g., Anticoagulants)
  ├── Text Content
  ├── Video URL
  ├── Audio/Podcast URL
  ├── Flashcards
  └── Embedded Questions
```

### UI Components

**Module List Screen:**

- Card-based layout
- Progress indicator per module
- Thumbnail images
- "Continue Learning" button

**Topic List Screen:**

- Lessons per topic
- Completion status (✓ completed, 🔒 locked, ▶️ in progress)
- Total lessons and progress bar

**Lesson Player:**

- Multi-tab interface: Text | Video | Audio | Flashcards
- Bookmark lessons
- Audio controls (play, pause, speed)
- Video player with subtitles

**Lesson Quiz:**

- MCQ format
- Progress indicator (Question 3/5)
- Submit and show score
- Retry if < 80%

---

## 🎯 Module 2: Practice Module

### Purpose

**On-demand MCQ practice** on any topic, anytime, to reinforce learning and identify weak areas.

### Features

**1. Topic Selection**

- Students choose which topic to practice
- No sequential restrictions (practice any topic)
- Example topics:
  - Numeracy → IV Calculations
  - Clinical → Pharmacology
  - Professional Standards → Safeguarding

**2. Practice Session**

- 10-20 questions per session (configurable)
- Randomized question selection
- Immediate feedback after each question
- Explanation for correct/incorrect answers

**3. Session Results**

- Score (e.g., 15/20 = 75%)
- Time taken
- Topic-wise breakdown
- Review incorrect answers

**4. Performance Tracking**

```javascript
{
  "topic": "Pharmacology",
  "attempts": 12,
  "averageScore": 78,
  "bestScore": 92,
  "totalQuestions": 240,
  "correctAnswers": 187,
  "accuracy": 78%
}
```

### UI Flow

```
Dashboard → Practice Module → Select Topic → Start Session
                                                ↓
                                          Answer Questions
                                                ↓
                                         View Results → Review Mistakes
```

### Smart Question Selection

**Algorithm:**

1. Fetch questions from selected topic
2. Prioritize questions user answered incorrectly before
3. Mix with new questions
4. Randomize order

```javascript
async function getQuestionsForPractice(userId, topicId, count = 20) {
  // Get previously incorrect questions
  const incorrectQuestions = await getIncorrectQuestions(userId, topicId, 10);

  // Get new questions
  const newQuestions = await getRandomQuestions(topicId, 10);

  // Combine and shuffle
  return shuffle([...incorrectQuestions, ...newQuestions]);
}
```

---

## 📝 Module 3: Mock Exam Module

### Purpose

**Realistic CBT exam simulation** to prepare students for the actual Pearson VUE testing environment.

### Exam Structure

**Part A: Numeracy**

- 15 questions
- 22.5 minutes
- Pass: 13/15 (87%)
- Calculator provided

**Part B: Clinical Knowledge**

- 60 questions
- 90 minutes
- Pass: ~42/60 (70%)
- Covers all clinical topics

**Professional Standards**

- 50 questions
- 75 minutes
- NMC Code scenarios
- Ethical decision-making

### Features

**1. Exam Environment**

- Timer countdown (real-time)
- Question navigator (flag for review)
- Review flagged questions
- Cannot go back after submitting

**2. Results Screen**

- Pass/Fail status
- Score breakdown by section
- Correct vs incorrect
- Time management analysis

**3. Performance Report**

- Compare with previous attempts
- Weak topics identified
- Recommended lessons for remediation
- Score trend graph

**4. Mock Exam History**

- All past attempts
- Date, score, pass/fail
- Best score tracking

### UI Components

**Exam List:**

- Part A, Part B, Professional Standards
- "Start Mock Exam" button
- Warning: "Cannot pause once started"

**Exam Screen:**

- Timer at top
- Question number (e.g., 15/60)
- MCQ options
- "Flag for review" checkbox
- "Submit" button (with confirmation)

**Results Screen:**

```
┌────────────────────────────┐
│   Part B: Clinical Knowledge│
│                            │
│   PASSED ✅                │
│                            │
│   Score: 45/60 (75%)       │
│   Time: 82 mins            │
│   Pass Mark: 42/60 (70%)   │
│                            │
│   ─────────────────────    │
│   Pharmacology: 8/10       │
│   Infection Control: 9/10  │
│   Wound Care: 6/10 ⚠️      │
│                            │
│   [Review Mistakes]        │
│   [Study Weak Topics]      │
└────────────────────────────┘
```

---

## 🤖 AI JeevaBot (Phase 1)

### Purpose

24/7 AI-powered nursing tutor for **clinical doubts, NMC Code guidance, and exam support**.

### Capabilities

**1. Clinical Doubt Clearing 🏥**

- "What's the antidote for warfarin overdose?" → Vitamin K explanation
- "How to manage patient with COPD exacerbation?" → Priority nursing actions
- "Explain Glasgow Coma Scale" → Detailed breakdown

**2. NMC Code Guidance 📋**

- Professional standards explanations
- UK vs India nursing practice differences
- Ethical scenario discussions
- Safeguarding protocols

**3. Study Support 📚**

- Explains complex concepts
- Clarifies pharmacology
- Reviews clinical scenarios
- Simplifies medical terminology

**4. Exam Preparation 🎯**

- Practice question explanations
- "Why is this answer correct?"
- Numeracy problem-solving steps
- CBT exam strategies

### Context-Aware Responses

**JeevaBot knows:**

- Current lesson student is studying
- Weak topics (< 70% accuracy)
- Recent practice performance
- Mock exam scores
- NMC CBT syllabus

**Example:**

```
Student: "I keep failing numeracy"

JeevaBot: "I see you've attempted Part A mock 3 times.
Your weak area is IV flow rate calculations. Let me help:

Formula: (Volume × Drop factor) ÷ Time in minutes

You're making this common mistake: Forgetting to
convert hours to minutes!

Want to practice 5 IV calculation questions right now?"
```

### UI Components

**Chat Interface:**

- Floating "Ask JeevaBot" button (bottom-right)
- Chat screen with bubbles
- Typing indicator
- Conversation history
- New conversation button

**Rate Limiting:**

- 50 messages/day per user
- Message count indicator
- Reset at midnight

---

## 📊 Module 4: Profile & Performance

### Profile Overview

**Personal Information:**

- Full name
- Email, phone
- Country
- Profile photo
- NMC exam attempts

**Subscription Details:**

- Current plan (30/60/90/120 days)
- Days remaining
- Expiry date
- "Upgrade" or "Renew" button

### Performance Dashboard 📈

**Overall Progress:**

```
┌────────────────────────────┐
│  📚 Lessons Completed      │
│     45 / 120 (38%)         │
│                            │
│  🔥 Study Streak           │
│     12 days                │
│                            │
│  ⏱️ Total Study Time       │
│     32 hours               │
│                            │
│  🎯 Exam Readiness         │
│     68% ██████░░░░         │
└────────────────────────────┘
```

**Learning Module Stats:**

- Modules completed
- Topics in progress
- 80% mastery achievements
- Pending lessons

**Practice Module Stats:**

```
┌────────────────────────────┐
│  Total Questions: 487      │
│  Accuracy: 76%             │
│                            │
│  📊 Topic-wise Accuracy:   │
│  Numeracy         ████ 85% │
│  Pharmacology     ███░ 65% │
│  Infection Ctrl   █████92% │
│  Wound Care       ███░ 72% │
│  Safeguarding     ████ 88% │
└────────────────────────────┘
```

**Mock Exam History:**

```
┌────────────────────────────┐
│  Mock Exam Attempts: 5     │
│                            │
│  Part A (Numeracy)         │
│  Best: 14/15 ✅ Latest: 12/15│
│                            │
│  Part B (Clinical)         │
│  Best: 45/60 ✅ Latest: 48/60│
│                            │
│  Professional Standards    │
│  Best: 38/50   Latest: 40/50│
│                            │
│  [View All Attempts]       │
└────────────────────────────┘
```

### Weak Areas Analysis 🚨

```
┌────────────────────────────┐
│  ⚠️  NEEDS ATTENTION        │
│                            │
│  1. Pharmacology (65%)     │
│     → Review "Drug Interactions"│
│     → Practice 20 MCQs     │
│                            │
│  2. Numeracy - IV Rates (58%)│
│     → Watch calculation video│
│     → Daily practice       │
│                            │
│  3. Mental Capacity Act (70%)│
│     → Review NMC Code lesson│
│                            │
│  [Start Improvement Plan]  │
└────────────────────────────┘
```

### AI-Powered Recommendations 🤖

**Weekly Personalized Study Plan**

Generated every week based on:

- Practice session performance
- Mock exam results
- Learning completions
- Days until subscription expires

```
┌────────────────────────────┐
│  🤖 YOUR STUDY PLAN        │
│  (Generated: Oct 18, 2025) │
│                            │
│  🚨 URGENT - Fix First:    │
│  1. Pharmacology (65%)     │
│     • "Drug Interactions" lesson│
│     • 20 practice MCQs daily│
│                            │
│  2. IV Flow Rates (58%)    │
│     • "IV Calculations" lesson│
│     • Use formula flashcards│
│                            │
│  💪 STRONG AREAS:          │
│  ✓ Infection Control (92%) │
│  ✓ Safeguarding (88%)      │
│                            │
│  📅 THIS WEEK:             │
│  Mon-Wed: Pharmacology focus│
│  Thu-Fri: Numeracy practice│
│  Sat: Mock exam attempt    │
│  Sun: Review mistakes      │
│                            │
│  🎯 Exam Readiness: 68%    │
│  You need 2 more weeks!    │
│                            │
│  [Generate New Plan]       │
└────────────────────────────┘
```

**Recommendation Algorithm:**

```javascript
async function generateRecommendations(userId) {
  // Get performance data
  const practiceStats = await getPracticeStats(userId);
  const mockExams = await getMockExamResults(userId);
  const learningProgress = await getLearningProgress(userId);
  const subscription = await getSubscription(userId);

  // Identify weak topics (< 70%)
  const weakTopics = practiceStats.filter((t) => t.accuracy < 0.7);

  // AI prompt
  const prompt = `
You are an NMC CBT exam preparation expert. Generate a personalized 
study plan for this nursing student.

STUDENT DATA:
- Weak topics: ${weakTopics.map((t) => `${t.name} (${t.accuracy}%)`)}
- Mock exam scores: Part A ${mockExams.partA}/15, Part B ${mockExams.partB}/60
- Days remaining: ${subscription.daysRemaining}
- Recent activity: ${learningProgress.recentLessons.length} lessons

Generate:
1. Top 3 priority areas
2. Daily study schedule
3. Specific lessons to review
4. Exam readiness percentage
5. Motivational message
  `;

  const recommendation = await callGeminiAPI(prompt);

  // Save recommendation
  await db.insert(ai_recommendations).values({
    user_id: userId,
    recommendation_data: recommendation,
    created_at: new Date(),
  });

  return recommendation;
}
```

---

## 🏠 Dashboard / Home Screen

### Hero Section 🎨

**Displayed at top of dashboard** - Managed from admin portal.

```
┌────────────────────────────┐
│ [Hero Image Banner]        │
│                            │
│  Master NMC CBT Clinical   │
│  New video lessons added!  │
│                            │
│  [Start Learning →]        │
└────────────────────────────┘
```

**Features:**

- Swipeable carousel if multiple heroes
- CTA button links to content/route
- Image from Supabase storage
- Admin controls from portal

**Data Source:**

- Fetches from `hero_sections` table
- Only `is_active = true` heroes shown
- Ordered by `display_order` (ascending)

### Quick Stats

```
┌─────┬─────┬─────┬─────┐
│ 45  │ 12  │ 76% │ 68% │
│Lessons│Days │Accuracy│Ready│
└─────┴─────┴─────┴─────┘
```

### Module Cards

```
┌────────────────────────────┐
│ 📚 Learning Module         │
│ Continue: Pharmacology     │
│ Progress: 38%              │
│ [Continue →]               │
└────────────────────────────┘

┌────────────────────────────┐
│ 🎯 Practice Module         │
│ Practice any topic         │
│ [Start Practice →]         │
└────────────────────────────┘

┌────────────────────────────┐
│ 📝 Mock Exam               │
│ Test your readiness        │
│ [Take Exam →]              │
└────────────────────────────┘
```

### Recent Activity

- "Completed: Introduction to NMC Code (2 hours ago)"
- "Practice Session: Pharmacology - 15/20 (Yesterday)"
- "Mock Exam: Part A - 12/15 (3 days ago)"

---

## 🔐 Authentication & Onboarding

### Authentication Methods

**1. Email & Password**

- Standard sign up/login
- Email verification
- Password reset

**2. Google Sign-In**

- OAuth 2.0
- One-tap login
- Auto-fill profile data

**3. Apple ID Sign-In**

- Required for iOS App Store
- Secure authentication
- Privacy-focused

### Registration Flow

```
1. Choose Signup Method
   ├── Email/Password
   ├── Continue with Google
   └── Continue with Apple

2. Create Account
   ├── Verify email (if email/password)
   └── OAuth completes automatically

3. Profile Completion (REQUIRED)
   ├── Full Name
   ├── Phone Number + Country Code
   ├── Current Country (for payment gateway)
   ├── Date of Birth
   ├── Gender
   ├── NMC Attempts (0 if first time)
   └── Using coaching? (Yes/No)

4. Set profile_completed = true

5. Redirect to Dashboard
```

**Profile Completion Screen:**

```
┌────────────────────────────┐
│  Complete Your Profile     │
│                            │
│  Full Name                 │
│  [____________]            │
│                            │
│  Phone Number              │
│  [+91] [__________]        │
│                            │
│  Current Country           │
│  [India ▼]                 │
│                            │
│  Have you attempted NMC?   │
│  ○ No  ○ Yes (1x) ○ Yes (2x)│
│                            │
│  [Complete Profile →]      │
└────────────────────────────┘
```

### Login Flow

```
1. User logs in (Email/Google/Apple)

2. Check profile_completed:
   ├── false → Redirect to Profile Completion
   └── true → Redirect to Dashboard

3. Check subscription status:
   ├── No subscription → Trial mode
   ├── Active → Full access
   └── Expired → Show upgrade prompt
```

---

## 🎁 Trial Mode & Content Gating

### Trial Access

**Free Trial Includes:**

- ✅ 1 Learning Module (any one topic, full access)
- ✅ 1 Practice Module (any one topic, unlimited practice)
- ❌ Mock Exams (locked)
- ❌ Full content library (locked)
- 🔒 AI JeevaBot (10 messages/day or locked - TBD)

**Content Gating Logic:**

```javascript
function canAccessContent(subscription, contentType, contentId) {
  // Check active subscription
  if (subscription.status === "active" && subscription.end_date > new Date()) {
    return { access: true, reason: "Full Access" };
  }

  // Trial mode restrictions
  if (subscription.status === "trial") {
    const trialContent = {
      learning_modules: ["module-id-1"], // First learning module
      practice_topics: ["topic-id-1"], // First practice topic
    };

    if (
      contentType === "learning" &&
      trialContent.learning_modules.includes(contentId)
    ) {
      return { access: true, reason: "Trial Access" };
    }

    if (
      contentType === "practice" &&
      trialContent.practice_topics.includes(contentId)
    ) {
      return { access: true, reason: "Trial Access" };
    }

    if (contentType === "mock_exam") {
      return { access: false, reason: "Upgrade to access Mock Exams" };
    }

    return { access: false, reason: "Upgrade for full access" };
  }

  // Expired subscription
  return { access: false, reason: "Your subscription has expired. Renew now!" };
}
```

**UI Indicators:**

```
[LOCKED 🔒] → Shows lock icon on locked content
[TRIAL] → Shows trial badge on free content
[PRO] → Shows premium badge on paid-only content
```

---

## 🎨 UI/UX Design Principles

### Design System

**Colors:**

- Primary: #007aff (iOS Blue)
- Secondary: #34C759 (Success Green)
- Warning: #FF9500 (Orange)
- Error: #FF3B30 (Red)
- Background: #F2F2F7 (Light Gray)
- Text: #000000 (Black) / #8E8E93 (Gray)

**Typography:**

- Headings: SF Pro Display (iOS) / Roboto (Android)
- Body: SF Pro Text / Roboto
- Sizes: 28 (Title), 20 (Heading), 16 (Body), 14 (Caption)

**Components:**

- Cards with shadow
- Rounded corners (8px radius)
- Bottom tab navigation
- Pull-to-refresh
- Skeleton loaders

### Navigation Structure

```
Bottom Tab Navigator:
├── Home (Dashboard)
├── Learning (Module browsing)
├── Practice (Quick practice)
├── Mock (Exam list)
└── Profile (Performance & settings)

Stack Navigators:
├── Auth Stack (Login, Signup, Profile Completion)
├── Learning Stack (Modules → Topics → Lessons → Quiz)
├── Practice Stack (Topic Selection → Session → Results)
├── Mock Exam Stack (Exam List → Exam Screen → Results)
└── Profile Stack (Profile → Settings → Performance Details)
```

---

## 🔔 Notifications & Reminders

### Push Notifications

**Study Reminders:**

- "Time to study! You're on a 12-day streak 🔥"
- "Complete today's lesson to maintain your streak"

**Subscription Alerts:**

- "Your subscription expires in 7 days. Renew now!"
- "Last day of access! Continue your preparation"

**Performance Updates:**

- "You've improved Pharmacology to 78%! 🎉"
- "New AI study plan generated for you"

**Mock Exam Reminders:**

- "Ready for a mock exam? Test your skills today!"

---

## 📊 Analytics & Tracking

### Events to Track

**User Engagement:**

- App opens (daily active users)
- Session duration
- Features used (learning, practice, mock, chat)

**Learning Metrics:**

- Lessons completed
- Topics mastered (80%+)
- Video watch time
- Podcast listen time

**Practice Metrics:**

- Questions attempted
- Accuracy per topic
- Time per question
- Retry rate

**Mock Exam Metrics:**

- Attempts per user
- Pass rate
- Average scores
- Time management

**Subscription Metrics:**

- Trial → Paid conversion rate
- Coupon usage
- Revenue by plan
- Churn rate

---

## 🔒 Security & Privacy

**Data Protection:**

- All API calls authenticated with JWT
- Supabase RLS policies enforce user data isolation
- No API keys in mobile app code
- Secure storage for auth tokens

**Privacy:**

- GDPR compliance
- User data deletion on request
- No third-party data sharing
- Transparent privacy policy

---

## 🧪 Testing Strategy

**Unit Tests:**

- Business logic (mastery check, subscription validation)
- Content gating logic
- Score calculations

**Integration Tests:**

- API calls to Supabase
- Authentication flows
- Payment integration

**E2E Tests:**

- Complete user journeys
- Registration → Profile → Learning → Practice → Mock
- Payment flow (Stripe/Razorpay test mode)

---

## 📚 Related Documentation

- [MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md) - Setup and development
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [AI_PHASE1_CHATBOT.md](./AI_PHASE1_CHATBOT.md) - JeevaBot implementation
- [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) - Payment setup
- [UI_DESIGN_SPECS.md](./UI_DESIGN_SPECS.md) - Design system

---

**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Maintained by:** vollstek@gmail.com
