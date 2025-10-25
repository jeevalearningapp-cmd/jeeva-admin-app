-- Seed Data for Learning Module
-- Run this script in Supabase SQL Editor
-- This creates 3 lessons + 2 questions per subtopic

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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Prioritise People?', 'learning', 'The NMC Code', '1.1', true, 1, 'This question tests your understanding of Prioritise People principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Prioritise People, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Prioritise People.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Practice Effectively?', 'learning', 'The NMC Code', '1.2', true, 1, 'This question tests your understanding of Practice Effectively principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Practice Effectively, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to Practice Effectively.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Preserve Safety?', 'learning', 'The NMC Code', '1.3', true, 1, 'This question tests your understanding of Preserve Safety principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Preserve Safety, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.3', true, 2, 'This assesses your knowledge of nursing responsibilities related to Preserve Safety.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Promote Professionalism?', 'learning', 'The NMC Code', '1.4', true, 1, 'This question tests your understanding of Promote Professionalism principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Promote Professionalism, what is the nurse''s primary responsibility?', 'learning', 'The NMC Code', '1.4', true, 2, 'This assesses your knowledge of nursing responsibilities related to Promote Professionalism.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Presumption of Capacity?', 'learning', 'Mental Capacity Act', '2.1', true, 1, 'This question tests your understanding of Presumption of Capacity principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Presumption of Capacity, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Presumption of Capacity.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Assessing Capacity?', 'learning', 'Mental Capacity Act', '2.2', true, 1, 'This question tests your understanding of Assessing Capacity principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Assessing Capacity, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to Assessing Capacity.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Best Interests Decisions?', 'learning', 'Mental Capacity Act', '2.3', true, 1, 'This question tests your understanding of Best Interests Decisions principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Best Interests Decisions, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.3', true, 2, 'This assesses your knowledge of nursing responsibilities related to Best Interests Decisions.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Advanced Care Planning?', 'learning', 'Mental Capacity Act', '2.4', true, 1, 'This question tests your understanding of Advanced Care Planning principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Advanced Care Planning, what is the nurse''s primary responsibility?', 'learning', 'Mental Capacity Act', '2.4', true, 2, 'This assesses your knowledge of nursing responsibilities related to Advanced Care Planning.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Recognising Abuse?', 'learning', 'Safeguarding', '3.1', true, 1, 'This question tests your understanding of Recognising Abuse principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Recognising Abuse, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Recognising Abuse.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Reporting Protocols?', 'learning', 'Safeguarding', '3.2', true, 1, 'This question tests your understanding of Reporting Protocols principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Reporting Protocols, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to Reporting Protocols.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Child Protection?', 'learning', 'Safeguarding', '3.3', true, 1, 'This question tests your understanding of Child Protection principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Child Protection, what is the nurse''s primary responsibility?', 'learning', 'Safeguarding', '3.3', true, 2, 'This assesses your knowledge of nursing responsibilities related to Child Protection.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Valid Consent?', 'learning', 'Consent & Confidentiality', '4.1', true, 1, 'This question tests your understanding of Valid Consent principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Valid Consent, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Valid Consent.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of GDPR & Confidentiality?', 'learning', 'Consent & Confidentiality', '4.2', true, 1, 'This question tests your understanding of GDPR & Confidentiality principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of GDPR & Confidentiality, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to GDPR & Confidentiality.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Confidentiality vs. Safeguarding?', 'learning', 'Consent & Confidentiality', '4.3', true, 1, 'This question tests your understanding of Confidentiality vs. Safeguarding principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Confidentiality vs. Safeguarding, what is the nurse''s primary responsibility?', 'learning', 'Consent & Confidentiality', '4.3', true, 2, 'This assesses your knowledge of nursing responsibilities related to Confidentiality vs. Safeguarding.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Equality Act 2010?', 'learning', 'Equality & Diversity', '5.1', true, 1, 'This question tests your understanding of Equality Act 2010 principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Equality Act 2010, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Equality Act 2010.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Cultural Competence?', 'learning', 'Equality & Diversity', '5.2', true, 1, 'This question tests your understanding of Cultural Competence principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Cultural Competence, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to Cultural Competence.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Reasonable Adjustments?', 'learning', 'Equality & Diversity', '5.3', true, 1, 'This question tests your understanding of Reasonable Adjustments principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Reasonable Adjustments, what is the nurse''s primary responsibility?', 'learning', 'Equality & Diversity', '5.3', true, 2, 'This assesses your knowledge of nursing responsibilities related to Reasonable Adjustments.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Transparency After Errors?', 'learning', 'Duty of Candour', '6.1', true, 1, 'This question tests your understanding of Transparency After Errors principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Transparency After Errors, what is the nurse''s primary responsibility?', 'learning', 'Duty of Candour', '6.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Transparency After Errors.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of NHS Incident Reporting?', 'learning', 'Duty of Candour', '6.2', true, 1, 'This question tests your understanding of NHS Incident Reporting principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of NHS Incident Reporting, what is the nurse''s primary responsibility?', 'learning', 'Duty of Candour', '6.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to NHS Incident Reporting.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of Autonomy vs. Family Decisions?', 'learning', 'Cultural Adaptation', '7.1', true, 1, 'This question tests your understanding of Autonomy vs. Family Decisions principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of Autonomy vs. Family Decisions, what is the nurse''s primary responsibility?', 'learning', 'Cultural Adaptation', '7.1', true, 2, 'This assesses your knowledge of nursing responsibilities related to Autonomy vs. Family Decisions.')
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
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('Which of the following best describes the key principle of UK Communication Styles?', 'learning', 'Cultural Adaptation', '7.2', true, 1, 'This question tests your understanding of UK Communication Styles principles as outlined in the NMC Code.')
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, display_order)
SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1
UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1
UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1
UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;

WITH q2 AS (
  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, display_order, explanation)
  VALUES ('In the context of UK Communication Styles, what is the nurse''s primary responsibility?', 'learning', 'Cultural Adaptation', '7.2', true, 2, 'This assesses your knowledge of nursing responsibilities related to UK Communication Styles.')
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
