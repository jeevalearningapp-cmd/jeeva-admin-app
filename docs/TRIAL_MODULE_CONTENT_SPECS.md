# Trial Module - Content Specifications & Database Schema

**Document Version:** 1.0  
**Date:** November 30, 2025  
**Purpose:** Detailed content structure and database implementation for Trial Module

---

## 1. Trial Module Content Summary

```
Trial Module Overview:
├── Practice Section (6 questions)
│   ├── Numerical (3) - Dosage, rate, fluid calculations
│   └── Clinical (3) - Scenario-based assessments
│
├── Learning Section (1 Topic, 2 Subtopics)
│   ├── Topic: Patient Safety & Infection Control
│   ├── Subtopic 1 (Unlock at 60%)
│   │   ├── Video (2-5 min)
│   │   ├── Audio (transcript)
│   │   ├── Text (key points)
│   │   └── Flashcards (3-5 cards)
│   └── Subtopic 2 (Unlock at 60%)
│       ├── Text (comprehensive)
│       ├── MCQ (3 questions)
│       ├── Audio (lesson version)
│       └── Video (supplementary)
│
└── Mock Exam Section (20 questions, 30 min)
    ├── Mixed question types (MCQ + clinical scenarios)
    ├── Full results with breakdown
    ├── Topic performance analysis
    ├── Performance suggestions
    └── Upgrade CTA

Total Time: ~45-50 minutes
```

---

## 2. Practice Section - Detailed Specifications

### 2.1 Numerical Questions (3 questions)

#### Question 1: Dosage Calculation
```json
{
  "id": "trial_num_001",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "numerical",
  "difficulty": "easy",
  "category": "Numerical",
  "subcategory": "Dosage Calculations",
  "question_text": "A patient requires 500mg of paracetamol. The available strength is 250mg/5ml. How many millilitres should be administered?",
  "correct_answer": "10",
  "acceptable_range": "10.0 ± 0.1",
  "unit": "ml",
  "explanation": "Formula: (Required dose / Available strength) × Volume\n(500 / 250) × 5 = 2 × 5 = 10ml\n\nKey Concept: Always check the strength of the medication before calculating.",
  "hint": "Divide required dose by available strength, then multiply by volume.",
  "topic_reference": "Medication Administration",
  "points": 1,
  "time_limit_seconds": null
}
```

#### Question 2: Rate Calculation
```json
{
  "id": "trial_num_002",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "numerical",
  "difficulty": "easy",
  "category": "Numerical",
  "subcategory": "Rate Calculations",
  "question_text": "A patient needs an infusion of 1000ml IV fluid over 8 hours. Calculate the infusion rate in ml/hour.",
  "correct_answer": "125",
  "acceptable_range": "125 ± 1",
  "unit": "ml/hour",
  "explanation": "Formula: Total Volume / Total Time\n1000ml / 8 hours = 125ml/hour\n\nKey Concept: Always ensure units match before dividing.",
  "hint": "Divide total volume by total time in hours.",
  "topic_reference": "IV Administration",
  "points": 1,
  "time_limit_seconds": null
}
```

#### Question 3: Fluid Balance
```json
{
  "id": "trial_num_003",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "numerical",
  "difficulty": "medium",
  "category": "Numerical",
  "subcategory": "Fluid Balance",
  "question_text": "A patient's fluid intake is 2500ml and output is 1800ml. Calculate the fluid balance.",
  "correct_answer": "+700",
  "acceptable_range": "700 ± 10",
  "unit": "ml",
  "explanation": "Fluid Balance = Intake - Output\n2500ml - 1800ml = +700ml positive balance\n\nKey Concept: Positive balance means fluid retained in body. Monitor for signs of fluid overload.",
  "hint": "Subtract output from intake. Use + or - to show positive/negative balance.",
  "topic_reference": "Fluid Management",
  "points": 1,
  "time_limit_seconds": null
}
```

---

### 2.2 Clinical Questions (3 questions)

#### Question 1: Patient Assessment
```json
{
  "id": "trial_clin_001",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "mcq",
  "difficulty": "easy",
  "category": "Clinical",
  "subcategory": "Patient Assessment",
  "question_text": "A 65-year-old patient admitted with chest pain and shortness of breath. Which vital sign would you monitor as a priority?",
  "options": [
    "Temperature only",
    "Blood pressure, heart rate, respiratory rate, oxygen saturation",
    "Weight and height",
    "Mental status only"
  ],
  "correct_answer": "B",
  "explanation": "Cardiovascular and respiratory parameters are critical in chest pain assessment.\n\nWhy: BP, HR, RR, O2 sat are essential for detecting deterioration in acute conditions.\nWhy not A: Temperature alone is insufficient.\nWhy not C: Anthropometric measures are less relevant to acute presentation.\nWhy not D: While mental status matters, vital signs are priority.",
  "topic_reference": "Clinical Assessment",
  "points": 1
}
```

#### Question 2: Patient Safety
```json
{
  "id": "trial_clin_002",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "mcq",
  "difficulty": "easy",
  "category": "Clinical",
  "subcategory": "Patient Safety",
  "question_text": "A patient is confused and at risk of falling. What is your first action?",
  "options": [
    "Administer sedation",
    "Apply physical restraints",
    "Implement fall prevention measures: bed rails, call bell within reach, frequent checks",
    "Inform the family only"
  ],
  "correct_answer": "C",
  "explanation": "Patient safety is paramount. Non-restrictive measures prevent falls and maintain dignity.\n\nWhy: Environmental modifications and frequent monitoring reduce fall risk.\nWhy not A: Sedation increases confusion and fall risk.\nWhy not B: Restraints are last resort and increase agitation.\nWhy not D: Family involvement helps but doesn't address immediate safety.",
  "topic_reference": "Patient Safety & Infection Control",
  "points": 1
}
```

#### Question 3: Clinical Reasoning
```json
{
  "id": "trial_clin_003",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_type": "mcq",
  "difficulty": "medium",
  "category": "Clinical",
  "subcategory": "Clinical Reasoning",
  "question_text": "Post-operative patient shows signs of wound infection: redness, warmth, purulent discharge. What is the priority nursing action?",
  "options": [
    "Apply a dressing and observe",
    "Inform doctor immediately, obtain wound swab for culture, ensure sterile technique during dressing change",
    "Increase fluid intake",
    "Wait 24 hours to see if it resolves"
  ],
  "correct_answer": "B",
  "explanation": "Early intervention prevents sepsis. Prompt medical evaluation and specimen collection are critical.\n\nWhy: Immediate notification, culture swab, and sterile technique address infection prevention.\nWhy not A: Observation without intervention allows infection to progress.\nWhy not C: While hydration helps immunity, it doesn't address infection.\nWhy not D: Delay increases risk of complications.",
  "topic_reference": "Infection Control & Prevention",
  "points": 1
}
```

---

## 3. Learning Section - Detailed Specifications

### 3.1 Learning Topic

```json
{
  "id": "trial_learning_topic_001",
  "name": "Patient Safety & Infection Control",
  "slug": "patient-safety-infection-control",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "description": "Introduction to fundamental principles of patient safety and infection prevention and control",
  "order": 1,
  "estimated_duration_minutes": 20,
  "learning_outcomes": [
    "Understand principles of patient safety",
    "Apply infection control measures",
    "Identify common healthcare-associated infections",
    "Implement standard precautions"
  ]
}
```

### 3.2 Subtopic 1: Patient Safety Principles

```json
{
  "id": "trial_learning_subtopic_001",
  "topic_id": "trial_learning_topic_001",
  "name": "Patient Safety Fundamentals",
  "slug": "patient-safety-fundamentals",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "order": 1,
  "unlock_threshold_percentage": 60,
  "estimated_duration_minutes": 10,
  
  "content_modules": [
    {
      "type": "video",
      "title": "Introduction to Patient Safety",
      "duration_seconds": 300,
      "video_url": "[URL to hosted video]",
      "transcript": "Patient safety is the foundation of nursing care. Every interaction must prioritize the patient's wellbeing...",
      "learning_objectives": [
        "Define patient safety",
        "Identify common safety risks",
        "Understand NMC standards"
      ]
    },
    {
      "type": "text",
      "title": "Key Principles & Concepts",
      "content": "# Patient Safety Principles\n\n## Definition\nPatient safety means preventing harm to patients...\n\n## Key Principles\n1. Risk Assessment\n2. Fall Prevention\n3. Medication Safety\n4. Pressure Ulcer Prevention\n5. Infection Control\n\n## NMC Standards\nRegistered nurses must act in ways that...",
      "word_count": 800
    },
    {
      "type": "audio",
      "title": "Patient Safety Audio Lesson",
      "duration_seconds": 300,
      "audio_url": "[URL to hosted audio]",
      "transcript": "[Full audio transcript provided for accessibility]"
    },
    {
      "type": "flashcard_set",
      "title": "Patient Safety Vocabulary",
      "cards": [
        {
          "front": "What does SBAR stand for?",
          "back": "Situation, Background, Assessment, Recommendation - structured communication tool"
        },
        {
          "front": "Define iatrogenic harm",
          "back": "Harm caused unintentionally by medical treatment"
        },
        {
          "front": "What is informed consent?",
          "back": "Patient's voluntary agreement to treatment after understanding risks and benefits"
        },
        {
          "front": "What is confidentiality?",
          "back": "Obligation to protect patient information from unauthorized disclosure"
        },
        {
          "front": "Define accountability",
          "back": "Responsibility for one's actions and decisions in patient care"
        }
      ]
    },
    {
      "type": "assessment",
      "title": "Subtopic 1 Knowledge Check",
      "questions": [
        {
          "id": "trial_learning_assess_001",
          "question_text": "Which of the following is a primary responsibility in patient safety?",
          "options": [
            "Reporting all incidents and near-misses",
            "Keeping incidents confidential",
            "Deciding when to report incidents",
            "Documenting only serious incidents"
          ],
          "correct_answer": "A",
          "explanation": "All incidents, regardless of severity, must be reported to prevent recurrence and identify patterns."
        },
        {
          "id": "trial_learning_assess_002",
          "question_text": "What is the first step in fall prevention?",
          "options": [
            "Physical restraints",
            "Risk assessment",
            "Sedation",
            "Bed rest"
          ],
          "correct_answer": "B",
          "explanation": "Risk assessment identifies individuals at risk and guides prevention strategies."
        },
        {
          "id": "trial_learning_assess_003",
          "question_text": "A patient refuses treatment. As a nurse, you should:",
          "options": [
            "Respect autonomy and document refusal",
            "Proceed with treatment anyway",
            "Contact family before respecting wishes",
            "Delay decision until doctor arrives"
          ],
          "correct_answer": "A",
          "explanation": "Respecting patient autonomy and informed consent is fundamental to ethical care."
        }
      ],
      "passing_score": 60
    }
  ]
}
```

### 3.3 Subtopic 2: Infection Control Measures

```json
{
  "id": "trial_learning_subtopic_002",
  "topic_id": "trial_learning_topic_001",
  "name": "Infection Prevention & Control",
  "slug": "infection-prevention-control",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "order": 2,
  "unlock_threshold_percentage": 60,
  "estimated_duration_minutes": 10,
  "requires_unlocking": true,
  "unlock_requirement": "Complete Subtopic 1 with ≥60%",
  
  "content_modules": [
    {
      "type": "text",
      "title": "Standard Precautions & Infection Control",
      "content": "# Infection Prevention & Control\n\n## Standard Precautions\nApply to all patients, all settings:\n- Hand hygiene\n- Personal Protective Equipment (PPE)\n- Safe injection practices\n- Respiratory hygiene\n- Handling of body fluids\n\n## Healthcare-Associated Infections (HAIs)\nCommon HAIs:\n- Urinary tract infections (UTIs)\n- Surgical site infections\n- Pneumonia\n- Blood stream infections\n\n## Aseptic Technique\nKey principles:\n1. Hand washing before and after patient contact\n2. Use of sterile equipment\n3. Maintenance of sterile field\n4. Proper disposal of contaminated materials",
      "word_count": 600
    },
    {
      "type": "video",
      "title": "Practical Hand Hygiene & PPE",
      "duration_seconds": 240,
      "video_url": "[URL to practical demonstration video]",
      "description": "Step-by-step demonstration of proper hand washing and PPE application"
    },
    {
      "type": "audio",
      "title": "Infection Control Audio Guide",
      "duration_seconds": 240,
      "audio_url": "[URL to audio guide]"
    },
    {
      "type": "flashcard_set",
      "title": "Infection Control Key Terms",
      "cards": [
        {
          "front": "What is asepsis?",
          "back": "Absence of disease-causing microorganisms; maintaining a sterile environment"
        },
        {
          "front": "Define sterilization",
          "back": "Complete elimination of all microorganisms including spores"
        },
        {
          "front": "What is an aseptic technique?",
          "back": "Procedures performed to minimize contamination by microorganisms"
        },
        {
          "front": "Define infection",
          "back": "Invasion and multiplication of pathogenic microorganisms in body tissues"
        },
        {
          "front": "What does 'cross-infection' mean?",
          "back": "Transmission of infection from one patient to another through contaminated materials or staff"
        }
      ]
    },
    {
      "type": "assessment",
      "title": "Subtopic 2 Knowledge Check",
      "questions": [
        {
          "id": "trial_learning_assess_004",
          "question_text": "When should hand hygiene be performed?",
          "options": [
            "Only before patient contact",
            "Before and after patient contact, before clean procedures, after contact with bodily fluids",
            "At the beginning and end of shift only",
            "When hands visibly look dirty"
          ],
          "correct_answer": "B"
        },
        {
          "id": "trial_learning_assess_005",
          "question_text": "What is the purpose of standard precautions?",
          "options": [
            "Prevent all infections completely",
            "Apply only to patients with known infections",
            "Apply to all patients to prevent transmission of infection",
            "Reduce hospital costs"
          ],
          "correct_answer": "C"
        },
        {
          "id": "trial_learning_assess_006",
          "question_text": "Which is NOT a standard precaution?",
          "options": [
            "Hand hygiene",
            "Use of PPE",
            "Vaccination with measles vaccine",
            "Safe handling of sharps"
          ],
          "correct_answer": "C",
          "explanation": "While vaccination is important, it's not classified as a standard precaution. Standard precautions include specific practices applied to all patients."
        }
      ],
      "passing_score": 60
    }
  ]
}
```

---

## 4. Mock Exam Section - Detailed Specifications

### 4.1 Trial Mock Exam Structure

```json
{
  "id": "trial_mock_exam_001",
  "name": "Trial Mock Exam - NMC CBT Style",
  "module_id": "trial_module_id",
  "is_trial_content": true,
  "question_count": 20,
  "time_limit_minutes": 30,
  "passing_score": 50,
  "question_pool": [
    // 20 questions across different topics
    // Mix of: 15 MCQs + 5 clinical scenarios
    // Difficulty: 60% Easy, 40% Medium
  ],
  "features": {
    "allow_mark_for_review": true,
    "allow_answer_changes": true,
    "show_question_navigator": true,
    "auto_submit_at_time_limit": true,
    "show_timer": true,
    "show_results_immediately": true
  }
}
```

### 4.2 Trial Mock Exam Questions (Sample - 5 of 20)

```json
{
  "exam_questions": [
    {
      "position": 1,
      "id": "trial_exam_001",
      "question_type": "mcq",
      "difficulty": "easy",
      "topic": "Patient Safety",
      "question_text": "Which action demonstrates respect for patient autonomy?",
      "options": [
        "Making decisions for confused patients",
        "Respecting patient refusal of treatment after explanation",
        "Performing procedures without consent",
        "Deciding what information patients should know"
      ],
      "correct_answer": "B",
      "explanation": "Patient autonomy requires respecting informed choices, even if we disagree.",
      "points": 1
    },
    {
      "position": 2,
      "id": "trial_exam_002",
      "question_type": "mcq",
      "difficulty": "easy",
      "topic": "Medication",
      "question_text": "Before administering medication, you must verify:",
      "options": [
        "Patient name only",
        "Correct patient, drug, dose, route, time",
        "Time and route only",
        "Drug name only"
      ],
      "correct_answer": "B",
      "explanation": "The 5 rights of medication administration prevent errors.",
      "points": 1
    },
    {
      "position": 3,
      "id": "trial_exam_003",
      "question_type": "clinical_scenario",
      "difficulty": "medium",
      "topic": "Infection Control",
      "scenario": "You enter a patient's room who has suspected C. difficile infection. What is your immediate action?",
      "question_text": "What is your immediate action?",
      "options": [
        "Put on gloves and proceed with care",
        "Use alcohol-based hand sanitizer",
        "Put on gloves, gown, and perform hand hygiene with soap and water",
        "Ask patient about symptoms first"
      ],
      "correct_answer": "C",
      "explanation": "C. difficile requires contact precautions (gloves and gown) and soap/water for hand hygiene.",
      "points": 1
    },
    {
      "position": 4,
      "id": "trial_exam_004",
      "question_type": "mcq",
      "difficulty": "easy",
      "topic": "Communication",
      "question_text": "When documenting patient care, what must be included?",
      "options": [
        "Your personal opinions",
        "Objective observations, actions taken, patient response",
        "Only positive findings",
        "What you think happened"
      ],
      "correct_answer": "B",
      "explanation": "Documentation must be factual, objective, and timely.",
      "points": 1
    },
    {
      "position": 5,
      "id": "trial_exam_005",
      "question_type": "clinical_scenario",
      "difficulty": "medium",
      "topic": "Vital Signs",
      "scenario": "Patient's BP is 180/110, HR 102, RR 24, temp 38.5°C. You recognize:",
      "question_text": "What do these findings suggest?",
      "options": [
        "All readings are normal",
        "Patient is calm and stable",
        "Patient requires immediate assessment and medical notification",
        "Results are within acceptable range for elderly patients"
      ],
      "correct_answer": "C",
      "explanation": "These indicate acute illness requiring urgent intervention.",
      "points": 1
    }
    // ... 15 more questions following same pattern
  ]
}
```

### 4.3 Trial Mock Exam Results Screen

```json
{
  "trial_exam_results": {
    "exam_id": "trial_mock_exam_001",
    "user_id": "[user_id]",
    "start_time": "2025-11-30T10:00:00Z",
    "end_time": "2025-11-30T10:30:00Z",
    "duration_minutes": 30,
    
    "overall_results": {
      "total_questions": 20,
      "correct_answers": 14,
      "incorrect_answers": 6,
      "score": 70,
      "percentage": 70,
      "status": "PASSED",
      "message": "Congratulations! You passed the trial exam with 70%"
    },
    
    "topic_breakdown": {
      "patient_safety": {
        "questions": 4,
        "correct": 4,
        "percentage": 100,
        "status": "Excellent"
      },
      "medication": {
        "questions": 4,
        "correct": 3,
        "percentage": 75,
        "status": "Good"
      },
      "infection_control": {
        "questions": 4,
        "correct": 3,
        "percentage": 75,
        "status": "Good"
      },
      "communication": {
        "questions": 4,
        "correct": 2,
        "percentage": 50,
        "status": "Needs Improvement"
      },
      "vital_signs": {
        "questions": 4,
        "correct": 2,
        "percentage": 50,
        "status": "Needs Improvement"
      }
    },
    
    "detailed_review": [
      {
        "question_position": 1,
        "question_text": "Which action demonstrates respect for patient autonomy?",
        "your_answer": "B",
        "correct_answer": "B",
        "result": "CORRECT",
        "topic": "Patient Safety",
        "difficulty": "easy",
        "explanation": "Patient autonomy requires respecting informed choices."
      }
      // ... more detailed reviews
    ],
    
    "performance_suggestions": {
      "overall": "Good performance! Your score of 70% is above average (avg: 62%)",
      "strengths": [
        "Excellent understanding of Patient Safety (100%)",
        "Good grasp of Medication administration (75%)"
      ],
      "improvements": [
        "Communication skills need focus (50%)",
        "Vital Signs assessment needs review (50%)",
        "Recommend: Re-study Communication lesson and practice more vital sign interpretation"
      ],
      "recommended_focus_areas": [
        "Therapeutic communication techniques",
        "Normal vital sign ranges for different age groups",
        "Recognizing abnormal vital signs"
      ]
    },
    
    "recommended_next_steps": [
      {
        "action": "Review Communication Lesson",
        "description": "Focus on therapeutic communication and non-verbal communication"
      },
      {
        "action": "Practice More Vital Signs Questions",
        "description": "10+ additional practice questions on vital sign interpretation"
      },
      {
        "action": "Unlock Full Practice Module",
        "description": "Get unlimited practice questions for all topics"
      },
      {
        "action": "Upgrade to Full Access",
        "description": "Access unlimited mock exams, learning content, and analytics",
        "cta_button": "Upgrade Now - £25"
      }
    ]
  }
}
```

---

## 5. Database Schema Implementation

### 5.1 Trial Module Entity Tables

```sql
-- Trial Module
INSERT INTO modules (
  id, name, slug, description, is_trial, order, is_active, created_at, updated_at
) VALUES (
  'trial-module-uuid', 
  'Trial', 
  'trial', 
  'Free trial with features from all modules', 
  true, 
  0, 
  true,
  NOW(),
  NOW()
);

-- Trial Module Access Rule
INSERT INTO module_access_rules (
  id, module_id, access_type, requires_payment, description, created_at, updated_at
) VALUES (
  'trial-rule-uuid',
  'trial-module-uuid',
  'free',
  false,
  'Trial module - free for all users',
  NOW(),
  NOW()
);

-- Paid Modules Access Rules
INSERT INTO module_access_rules (module_id, access_type, requires_payment, description)
SELECT id, 'subscriber', true, 'Requires active subscription'
FROM modules WHERE slug IN ('practice', 'learning', 'mock_exam');
```

### 5.2 Trial Content Tables

```sql
-- Trial Topics
INSERT INTO topics (
  id, module_id, name, slug, description, is_trial_content, order, created_at, updated_at
) VALUES (
  'trial-topic-001-uuid',
  'trial-module-uuid',
  'Patient Safety & Infection Control',
  'patient-safety-infection-control',
  'Introduction to fundamental principles of patient safety and infection prevention',
  true,
  1,
  NOW(),
  NOW()
);

-- Trial Subtopics
INSERT INTO lessons (
  id, topic_id, name, slug, is_trial_content, unlock_threshold_percentage, estimated_duration_minutes, order
) VALUES 
(
  'trial-subtopic-001-uuid',
  'trial-topic-001-uuid',
  'Patient Safety Fundamentals',
  'patient-safety-fundamentals',
  true,
  60,
  10,
  1
),
(
  'trial-subtopic-002-uuid',
  'trial-topic-001-uuid',
  'Infection Prevention & Control',
  'infection-prevention-control',
  true,
  60,
  10,
  2
);

-- Trial Questions
INSERT INTO questions (
  id, module_id, lesson_id, question_type, difficulty, category, question_text, correct_answer,
  explanation, is_trial_content, points, created_at, updated_at
) VALUES
(
  'trial_num_001_uuid',
  'trial-module-uuid',
  NULL,
  'numerical',
  'easy',
  'Numerical',
  'A patient requires 500mg of paracetamol. The available strength is 250mg/5ml...',
  '10',
  'Formula: (Required dose / Available strength) × Volume...',
  true,
  1,
  NOW(),
  NOW()
)
-- ... more trial questions
;
```

### 5.3 Trial Progress Tracking Tables

```sql
-- Trial Attempt Records
CREATE TABLE IF NOT EXISTS trial_attempt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  content_type VARCHAR NOT NULL, -- 'practice', 'learning', 'mock_exam'
  section_type VARCHAR, -- 'numerical', 'clinical', 'topic_1', 'exam'
  score INTEGER,
  total_questions INTEGER,
  answers_data JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  is_passed BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trial Analytics View
CREATE OR REPLACE VIEW trial_analytics AS
SELECT 
  COUNT(DISTINCT user_id) as total_trial_users,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN content_type = 'practice' THEN 1 END) as practice_attempts,
  COUNT(CASE WHEN content_type = 'learning' THEN 1 END) as learning_attempts,
  COUNT(CASE WHEN content_type = 'mock_exam' THEN 1 END) as exam_attempts,
  AVG(score) as avg_score,
  COUNT(CASE WHEN is_passed = true THEN 1 END) as completed_attempts,
  ROUND(COUNT(CASE WHEN is_passed = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_rate,
  AVG(duration_seconds) / 60 as avg_duration_minutes
FROM trial_attempt_records
WHERE created_at >= NOW() - INTERVAL '30 days';
```

---

## 6. Implementation Checklist

### Phase 1: Database Setup
- [ ] Create Trial Module record
- [ ] Create module_access_rules for all modules
- [ ] Create trial topics and lessons
- [ ] Create trial questions (6 practice + 20 exam)
- [ ] Create trial_attempt_records table
- [ ] Create trial analytics view
- [ ] Add is_trial_content column to questions table
- [ ] Verify RLS policies

### Phase 2: Backend Implementation
- [ ] Implement module access checking
- [ ] Create trial-specific endpoints
- [ ] Implement practice section API
- [ ] Implement learning section API
- [ ] Implement mock exam API
- [ ] Implement results calculation
- [ ] Implement suggestions generation
- [ ] Create trial analytics endpoint

### Phase 3: Admin Portal
- [ ] Trial content management UI
- [ ] Trial question uploader
- [ ] Trial content preview
- [ ] Trial analytics dashboard

### Phase 4: Mobile App
- [ ] Trial module display
- [ ] Practice section UI (numerical + clinical)
- [ ] Learning section UI (with unlock logic)
- [ ] Mock exam taker UI
- [ ] Results screen with breakdown
- [ ] Suggestions display
- [ ] Upgrade CTA integration

---

## 7. Configuration Constants

```typescript
export const TRIAL_CONTENT_CONFIG = {
  // Practice Section
  PRACTICE_NUMERICAL_COUNT: 3,
  PRACTICE_CLINICAL_COUNT: 3,
  PRACTICE_TIME_LIMIT: null,
  
  // Learning Section
  LEARNING_TOPIC_COUNT: 1,
  LEARNING_SUBTOPIC_COUNT: 2,
  LEARNING_UNLOCK_THRESHOLD: 60,
  LEARNING_TIME_ESTIMATE: 20,
  
  // Mock Exam Section
  MOCK_EXAM_QUESTION_COUNT: 20,
  MOCK_EXAM_TIME_LIMIT_MIN: 30,
  MOCK_EXAM_PASSING_SCORE: 50,
  
  // Content Types (Learning)
  LEARNING_CONTENT_TYPES: ['video', 'audio', 'text', 'flashcard', 'mcq'],
}
```

---

**Document Status:** Complete - Ready for Development  
**Next Phase:** Populate database with actual trial content and implement backend APIs
