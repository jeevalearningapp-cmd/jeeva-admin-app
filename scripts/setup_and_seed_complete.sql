-- =============================================
-- JEEVA LEARNING PLATFORM - COMPLETE DATABASE SETUP
-- =============================================
-- This script does EVERYTHING in one go:
-- 1. Creates tables if they don't exist
-- 2. Cleans existing seed data (safe - preserves other data)
-- 3. Loads fresh seed data (63 lessons, 42 questions)
--
-- SAFE: Only clears Learning Module content, not user/subscription data
-- =============================================

-- =============================================
-- STEP 1: Create Tables (if they don't exist)
-- =============================================

-- 1. Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  audio_url TEXT,
  lesson_type VARCHAR(50) DEFAULT 'text',
  passing_score_percentage INTEGER DEFAULT 80,
  category VARCHAR(100),
  duration INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  difficulty VARCHAR(50),
  points INTEGER DEFAULT 1,
  explanation TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  module_type VARCHAR(50),
  category VARCHAR(255),
  subdivision VARCHAR(100),
  exam_part VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  category VARCHAR(255),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_questions_filters ON questions(module_type, category, subdivision);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category);

-- =============================================
-- STEP 2: Insert Fixed Module Records
-- =============================================
INSERT INTO modules (id, title, description, is_active, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Practice Module', 'Practice MCQs to test your knowledge', true, 1),
  ('22222222-2222-2222-2222-222222222222', 'Learning Module', 'Comprehensive learning content for NMC CBT preparation', true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Mock Exam', 'Full-length mock exams to prepare for the real test', true, 3)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 3: Insert Learning Module Topics
-- =============================================
INSERT INTO topics (id, module_id, title, description, is_active, display_order) VALUES
  ('22222222-2222-0001-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Numeracy', 'Essential numeracy skills for nursing practice', true, 1),
  ('22222222-2222-0002-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'The NMC Code', 'Professional standards of practice and behaviour', true, 2),
  ('22222222-2222-0003-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'Mental Capacity Act', 'Understanding mental capacity and decision-making', true, 3),
  ('22222222-2222-0004-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Safeguarding', 'Protecting vulnerable individuals from harm', true, 4),
  ('22222222-2222-0005-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Consent & Confidentiality', 'Patient rights and information governance', true, 5),
  ('22222222-2222-0006-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Equality & Diversity', 'Promoting equality in healthcare', true, 6),
  ('22222222-2222-0007-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Duty of Candour', 'Being open and honest when things go wrong', true, 7),
  ('22222222-2222-0008-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'Cultural Adaptation', 'Working effectively in a multicultural healthcare environment', true, 8)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 4: Clean Old Learning Module Seed Data  
-- =============================================
-- SAFE: Only deletes Learning Module content, preserves other data
DELETE FROM question_options WHERE question_id IN (
  SELECT id FROM questions WHERE module_type = 'learning'
);
DELETE FROM questions WHERE module_type = 'learning';
DELETE FROM lessons WHERE category IN ('1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '5.1', '5.2', '5.3', '6.1', '6.2', '7.1', '7.2');

SELECT 'Tables created/verified, old seed data cleared. Ready to load fresh data...' AS status;

-- =============================================
-- STEP 5: Load Fresh Seed Data
-- =============================================

-- Skipping Numeracy (no subtopics)

-- =============================================
-- The NMC Code
-- =============================================

-- Subtopic 1.1: Prioritise People
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0002-0000-000000000002', 'Prioritise People - Audio Podcast', 'Listen to this audio podcast about Prioritise People', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '1.1', 10, true, 1, 80),
  ('22222222-2222-0002-0000-000000000002', 'Prioritise People - Video Tutorial', 'Watch this video tutorial about Prioritise People', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '1.1', 15, true, 2, 80),
  ('22222222-2222-0002-0000-000000000002', 'Prioritise People - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '1.1', 8, true, 3, 80);

-- Questions for 1.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Prioritise People?', 'learning', 'The NMC Code', '1.1', true, 'This question tests your understanding of Prioritise People principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Prioritise People, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.1', true, 'This assesses your knowledge of nursing responsibilities related to Prioritise People.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 1.2: Practice Effectively
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0002-0000-000000000002', 'Practice Effectively - Audio Podcast', 'Listen to this audio podcast about Practice Effectively', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '1.2', 10, true, 1, 80),
  ('22222222-2222-0002-0000-000000000002', 'Practice Effectively - Video Tutorial', 'Watch this video tutorial about Practice Effectively', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '1.2', 15, true, 2, 80),
  ('22222222-2222-0002-0000-000000000002', 'Practice Effectively - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '1.2', 8, true, 3, 80);

-- Questions for 1.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Practice Effectively?', 'learning', 'The NMC Code', '1.2', true, 'This question tests your understanding of Practice Effectively principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Practice Effectively, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.2', true, 'This assesses your knowledge of nursing responsibilities related to Practice Effectively.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 1.3: Preserve Safety
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0002-0000-000000000002', 'Preserve Safety - Audio Podcast', 'Listen to this audio podcast about Preserve Safety', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '1.3', 10, true, 1, 80),
  ('22222222-2222-0002-0000-000000000002', 'Preserve Safety - Video Tutorial', 'Watch this video tutorial about Preserve Safety', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '1.3', 15, true, 2, 80),
  ('22222222-2222-0002-0000-000000000002', 'Preserve Safety - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '1.3', 8, true, 3, 80);

-- Questions for 1.3
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Preserve Safety?', 'learning', 'The NMC Code', '1.3', true, 'This question tests your understanding of Preserve Safety principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Preserve Safety, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.3', true, 'This assesses your knowledge of nursing responsibilities related to Preserve Safety.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 1.4: Promote Professionalism
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0002-0000-000000000002', 'Promote Professionalism - Audio Podcast', 'Listen to this audio podcast about Promote Professionalism', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '1.4', 10, true, 1, 80),
  ('22222222-2222-0002-0000-000000000002', 'Promote Professionalism - Video Tutorial', 'Watch this video tutorial about Promote Professionalism', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '1.4', 15, true, 2, 80),
  ('22222222-2222-0002-0000-000000000002', 'Promote Professionalism - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '1.4', 8, true, 3, 80);

-- Questions for 1.4
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Promote Professionalism?', 'learning', 'The NMC Code', '1.4', true, 'This question tests your understanding of Promote Professionalism principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Promote Professionalism, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.4', true, 'This assesses your knowledge of nursing responsibilities related to Promote Professionalism.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Mental Capacity Act
-- =============================================

-- Subtopic 2.1: Presumption of Capacity
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0003-0000-000000000003', 'Presumption of Capacity - Audio Podcast', 'Listen to this audio podcast about Presumption of Capacity', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '2.1', 10, true, 1, 80),
  ('22222222-2222-0003-0000-000000000003', 'Presumption of Capacity - Video Tutorial', 'Watch this video tutorial about Presumption of Capacity', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '2.1', 15, true, 2, 80),
  ('22222222-2222-0003-0000-000000000003', 'Presumption of Capacity - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '2.1', 8, true, 3, 80);

-- Questions for 2.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Presumption of Capacity?', 'learning', 'Mental Capacity Act', '2.1', true, 'This question tests your understanding of Presumption of Capacity principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Presumption of Capacity, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.1', true, 'This assesses your knowledge of nursing responsibilities related to Presumption of Capacity.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 2.2: Assessing Capacity
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0003-0000-000000000003', 'Assessing Capacity - Audio Podcast', 'Listen to this audio podcast about Assessing Capacity', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '2.2', 10, true, 1, 80),
  ('22222222-2222-0003-0000-000000000003', 'Assessing Capacity - Video Tutorial', 'Watch this video tutorial about Assessing Capacity', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '2.2', 15, true, 2, 80),
  ('22222222-2222-0003-0000-000000000003', 'Assessing Capacity - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '2.2', 8, true, 3, 80);

-- Questions for 2.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Assessing Capacity?', 'learning', 'Mental Capacity Act', '2.2', true, 'This question tests your understanding of Assessing Capacity principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Assessing Capacity, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.2', true, 'This assesses your knowledge of nursing responsibilities related to Assessing Capacity.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 2.3: Best Interests Decisions
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0003-0000-000000000003', 'Best Interests Decisions - Audio Podcast', 'Listen to this audio podcast about Best Interests Decisions', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '2.3', 10, true, 1, 80),
  ('22222222-2222-0003-0000-000000000003', 'Best Interests Decisions - Video Tutorial', 'Watch this video tutorial about Best Interests Decisions', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '2.3', 15, true, 2, 80),
  ('22222222-2222-0003-0000-000000000003', 'Best Interests Decisions - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '2.3', 8, true, 3, 80);

-- Questions for 2.3
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Best Interests Decisions?', 'learning', 'Mental Capacity Act', '2.3', true, 'This question tests your understanding of Best Interests Decisions principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Best Interests Decisions, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.3', true, 'This assesses your knowledge of nursing responsibilities related to Best Interests Decisions.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 2.4: Advanced Care Planning
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0003-0000-000000000003', 'Advanced Care Planning - Audio Podcast', 'Listen to this audio podcast about Advanced Care Planning', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '2.4', 10, true, 1, 80),
  ('22222222-2222-0003-0000-000000000003', 'Advanced Care Planning - Video Tutorial', 'Watch this video tutorial about Advanced Care Planning', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '2.4', 15, true, 2, 80),
  ('22222222-2222-0003-0000-000000000003', 'Advanced Care Planning - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '2.4', 8, true, 3, 80);

-- Questions for 2.4
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Advanced Care Planning?', 'learning', 'Mental Capacity Act', '2.4', true, 'This question tests your understanding of Advanced Care Planning principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Advanced Care Planning, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.4', true, 'This assesses your knowledge of nursing responsibilities related to Advanced Care Planning.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Safeguarding
-- =============================================

-- Subtopic 3.1: Recognising Abuse
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0004-0000-000000000004', 'Recognising Abuse - Audio Podcast', 'Listen to this audio podcast about Recognising Abuse', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '3.1', 10, true, 1, 80),
  ('22222222-2222-0004-0000-000000000004', 'Recognising Abuse - Video Tutorial', 'Watch this video tutorial about Recognising Abuse', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '3.1', 15, true, 2, 80),
  ('22222222-2222-0004-0000-000000000004', 'Recognising Abuse - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '3.1', 8, true, 3, 80);

-- Questions for 3.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Recognising Abuse?', 'learning', 'Safeguarding', '3.1', true, 'This question tests your understanding of Recognising Abuse principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Recognising Abuse, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.1', true, 'This assesses your knowledge of nursing responsibilities related to Recognising Abuse.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 3.2: Reporting Protocols
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0004-0000-000000000004', 'Reporting Protocols - Audio Podcast', 'Listen to this audio podcast about Reporting Protocols', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '3.2', 10, true, 1, 80),
  ('22222222-2222-0004-0000-000000000004', 'Reporting Protocols - Video Tutorial', 'Watch this video tutorial about Reporting Protocols', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '3.2', 15, true, 2, 80),
  ('22222222-2222-0004-0000-000000000004', 'Reporting Protocols - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '3.2', 8, true, 3, 80);

-- Questions for 3.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Reporting Protocols?', 'learning', 'Safeguarding', '3.2', true, 'This question tests your understanding of Reporting Protocols principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Reporting Protocols, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.2', true, 'This assesses your knowledge of nursing responsibilities related to Reporting Protocols.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 3.3: Child Protection
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0004-0000-000000000004', 'Child Protection - Audio Podcast', 'Listen to this audio podcast about Child Protection', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '3.3', 10, true, 1, 80),
  ('22222222-2222-0004-0000-000000000004', 'Child Protection - Video Tutorial', 'Watch this video tutorial about Child Protection', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '3.3', 15, true, 2, 80),
  ('22222222-2222-0004-0000-000000000004', 'Child Protection - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '3.3', 8, true, 3, 80);

-- Questions for 3.3
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Child Protection?', 'learning', 'Safeguarding', '3.3', true, 'This question tests your understanding of Child Protection principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Child Protection, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.3', true, 'This assesses your knowledge of nursing responsibilities related to Child Protection.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Consent & Confidentiality
-- =============================================

-- Subtopic 4.1: Valid Consent
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0005-0000-000000000005', 'Valid Consent - Audio Podcast', 'Listen to this audio podcast about Valid Consent', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '4.1', 10, true, 1, 80),
  ('22222222-2222-0005-0000-000000000005', 'Valid Consent - Video Tutorial', 'Watch this video tutorial about Valid Consent', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '4.1', 15, true, 2, 80),
  ('22222222-2222-0005-0000-000000000005', 'Valid Consent - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '4.1', 8, true, 3, 80);

-- Questions for 4.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Valid Consent?', 'learning', 'Consent & Confidentiality', '4.1', true, 'This question tests your understanding of Valid Consent principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Valid Consent, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.1', true, 'This assesses your knowledge of nursing responsibilities related to Valid Consent.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 4.2: GDPR & Confidentiality
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0005-0000-000000000005', 'GDPR & Confidentiality - Audio Podcast', 'Listen to this audio podcast about GDPR & Confidentiality', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '4.2', 10, true, 1, 80),
  ('22222222-2222-0005-0000-000000000005', 'GDPR & Confidentiality - Video Tutorial', 'Watch this video tutorial about GDPR & Confidentiality', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '4.2', 15, true, 2, 80),
  ('22222222-2222-0005-0000-000000000005', 'GDPR & Confidentiality - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '4.2', 8, true, 3, 80);

-- Questions for 4.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of GDPR & Confidentiality?', 'learning', 'Consent & Confidentiality', '4.2', true, 'This question tests your understanding of GDPR & Confidentiality principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of GDPR & Confidentiality, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.2', true, 'This assesses your knowledge of nursing responsibilities related to GDPR & Confidentiality.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 4.3: Confidentiality vs. Safeguarding
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0005-0000-000000000005', 'Confidentiality vs. Safeguarding - Audio Podcast', 'Listen to this audio podcast about Confidentiality vs. Safeguarding', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '4.3', 10, true, 1, 80),
  ('22222222-2222-0005-0000-000000000005', 'Confidentiality vs. Safeguarding - Video Tutorial', 'Watch this video tutorial about Confidentiality vs. Safeguarding', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '4.3', 15, true, 2, 80),
  ('22222222-2222-0005-0000-000000000005', 'Confidentiality vs. Safeguarding - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '4.3', 8, true, 3, 80);

-- Questions for 4.3
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Confidentiality vs. Safeguarding?', 'learning', 'Consent & Confidentiality', '4.3', true, 'This question tests your understanding of Confidentiality vs. Safeguarding principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Confidentiality vs. Safeguarding, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.3', true, 'This assesses your knowledge of nursing responsibilities related to Confidentiality vs. Safeguarding.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Equality & Diversity
-- =============================================

-- Subtopic 5.1: Equality Act 2010
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0006-0000-000000000006', 'Equality Act 2010 - Audio Podcast', 'Listen to this audio podcast about Equality Act 2010', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '5.1', 10, true, 1, 80),
  ('22222222-2222-0006-0000-000000000006', 'Equality Act 2010 - Video Tutorial', 'Watch this video tutorial about Equality Act 2010', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '5.1', 15, true, 2, 80),
  ('22222222-2222-0006-0000-000000000006', 'Equality Act 2010 - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '5.1', 8, true, 3, 80);

-- Questions for 5.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Equality Act 2010?', 'learning', 'Equality & Diversity', '5.1', true, 'This question tests your understanding of Equality Act 2010 principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Equality Act 2010, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.1', true, 'This assesses your knowledge of nursing responsibilities related to Equality Act 2010.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 5.2: Cultural Competence
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0006-0000-000000000006', 'Cultural Competence - Audio Podcast', 'Listen to this audio podcast about Cultural Competence', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '5.2', 10, true, 1, 80),
  ('22222222-2222-0006-0000-000000000006', 'Cultural Competence - Video Tutorial', 'Watch this video tutorial about Cultural Competence', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '5.2', 15, true, 2, 80),
  ('22222222-2222-0006-0000-000000000006', 'Cultural Competence - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '5.2', 8, true, 3, 80);

-- Questions for 5.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Cultural Competence?', 'learning', 'Equality & Diversity', '5.2', true, 'This question tests your understanding of Cultural Competence principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Cultural Competence, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.2', true, 'This assesses your knowledge of nursing responsibilities related to Cultural Competence.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 5.3: Reasonable Adjustments
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0006-0000-000000000006', 'Reasonable Adjustments - Audio Podcast', 'Listen to this audio podcast about Reasonable Adjustments', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '5.3', 10, true, 1, 80),
  ('22222222-2222-0006-0000-000000000006', 'Reasonable Adjustments - Video Tutorial', 'Watch this video tutorial about Reasonable Adjustments', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '5.3', 15, true, 2, 80),
  ('22222222-2222-0006-0000-000000000006', 'Reasonable Adjustments - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '5.3', 8, true, 3, 80);

-- Questions for 5.3
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Reasonable Adjustments?', 'learning', 'Equality & Diversity', '5.3', true, 'This question tests your understanding of Reasonable Adjustments principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Reasonable Adjustments, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.3', true, 'This assesses your knowledge of nursing responsibilities related to Reasonable Adjustments.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Duty of Candour
-- =============================================

-- Subtopic 6.1: Transparency After Errors
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0007-0000-000000000007', 'Transparency After Errors - Audio Podcast', 'Listen to this audio podcast about Transparency After Errors', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '6.1', 10, true, 1, 80),
  ('22222222-2222-0007-0000-000000000007', 'Transparency After Errors - Video Tutorial', 'Watch this video tutorial about Transparency After Errors', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '6.1', 15, true, 2, 80),
  ('22222222-2222-0007-0000-000000000007', 'Transparency After Errors - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '6.1', 8, true, 3, 80);

-- Questions for 6.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Transparency After Errors?', 'learning', 'Duty of Candour', '6.1', true, 'This question tests your understanding of Transparency After Errors principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Transparency After Errors, what is the nurse''s primary responsibility?', 'learning', 'Duty of Candour', '6.1', true, 'This assesses your knowledge of nursing responsibilities related to Transparency After Errors.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 6.2: NHS Incident Reporting
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0007-0000-000000000007', 'NHS Incident Reporting - Audio Podcast', 'Listen to this audio podcast about NHS Incident Reporting', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '6.2', 10, true, 1, 80),
  ('22222222-2222-0007-0000-000000000007', 'NHS Incident Reporting - Video Tutorial', 'Watch this video tutorial about NHS Incident Reporting', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '6.2', 15, true, 2, 80),
  ('22222222-2222-0007-0000-000000000007', 'NHS Incident Reporting - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '6.2', 8, true, 3, 80);

-- Questions for 6.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of NHS Incident Reporting?', 'learning', 'Duty of Candour', '6.2', true, 'This question tests your understanding of NHS Incident Reporting principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of NHS Incident Reporting, what is the nurse''s primary responsibility?', 'learning', 'Duty of Candour', '6.2', true, 'This assesses your knowledge of nursing responsibilities related to NHS Incident Reporting.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Cultural Adaptation
-- =============================================

-- Subtopic 7.1: Autonomy vs. Family Decisions
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0008-0000-000000000008', 'Autonomy vs. Family Decisions - Audio Podcast', 'Listen to this audio podcast about Autonomy vs. Family Decisions', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '7.1', 10, true, 1, 80),
  ('22222222-2222-0008-0000-000000000008', 'Autonomy vs. Family Decisions - Video Tutorial', 'Watch this video tutorial about Autonomy vs. Family Decisions', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '7.1', 15, true, 2, 80),
  ('22222222-2222-0008-0000-000000000008', 'Autonomy vs. Family Decisions - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '7.1', 8, true, 3, 80);

-- Questions for 7.1
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of Autonomy vs. Family Decisions?', 'learning', 'Cultural Adaptation', '7.1', true, 'This question tests your understanding of Autonomy vs. Family Decisions principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of Autonomy vs. Family Decisions, what is the nurse''s primary responsibility?', 'learning', 'Cultural Adaptation', '7.1', true, 'This assesses your knowledge of nursing responsibilities related to Autonomy vs. Family Decisions.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- Subtopic 7.2: UK Communication Styles
INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES
  ('22222222-2222-0008-0000-000000000008', 'UK Communication Styles - Audio Podcast', 'Listen to this audio podcast about UK Communication Styles', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', NULL, 'audio', '7.2', 10, true, 1, 80),
  ('22222222-2222-0008-0000-000000000008', 'UK Communication Styles - Video Tutorial', 'Watch this video tutorial about UK Communication Styles', NULL, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 'video', '7.2', 15, true, 2, 80),
  ('22222222-2222-0008-0000-000000000008', 'UK Communication Styles - Introduction', '# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients'' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient''s genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient''s rights and preferences, ensuring care remains patient - centred and respects autonomy.', NULL, NULL, 'text', '7.2', 8, true, 3, 80);

-- Questions for 7.2
WITH q1 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('Which of the following best describes the key principle of UK Communication Styles?', 'learning', 'Cultural Adaptation', '7.2', true, 'This question tests your understanding of UK Communication Styles principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)
  VALUES ('In the context of UK Communication Styles, what is the nurse''s primary responsibility?', 'learning', 'Cultural Adaptation', '7.2', true, 'This assesses your knowledge of nursing responsibilities related to UK Communication Styles.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;

-- =============================================
-- Summary
-- =============================================
SELECT '63 lessons created successfully!' AS status;
SELECT '42 questions created successfully!' AS status;
