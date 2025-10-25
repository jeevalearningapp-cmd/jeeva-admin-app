import { LEARNING_TOPICS } from '../src/constants/learningStructure';
import * as fs from 'fs';

const PODCAST_URL = 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3';
const VIDEO_URL = 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4';

const TEXT_CONTENT = `# NMC CODE

## **Introduction to the NMC CBT Exam**

Starting a nursing career in the UK requires one essential step: passing the Nursing and Midwifery Council (NMC) Computer-Based Test (CBT).

The CBT is an online exam that checks your core nursing knowledge and clinical reasoning to ensure you can practice safely in UK healthcare. Passing the CBT is mandatory to register with the NMC; without registration you cannot work as a nurse or midwife in the UK.

The NMC CBT is the gateway that confirms aspiring nurses have the core skills and knowledge to deliver safe, effective care.

It protects patients and public trust by ensuring every registrant meets a consistent baseline of competence. The exam tests your ability to apply nursing principles within the UK system, emphasising patient - centred care and professional standards.

## **Understanding the NMC Code**

The NMC Code is the core standard for nursing and midwifery practice in the UK.

It defines the professional and ethical expectations every nurse must meet. The Code rests on four pillars: Prioritise People, Practice Effectively, Preserve Safety, and Promote Professionalism. Together these pillars shape safe, competent, and compassionate care.

## **The Pillar: Prioritise People**

Prioritise People means nurses put patients' needs and well‑being first.

It requires treating each person as an individual, respecting their values, beliefs and preferences. A key task is obtaining valid informed consent — giving clear, relevant information about proposed care or treatment and confirming the patient understands before they agree.

Valid consent must be given voluntarily, without coercion or undue influence, and reflect the patient's genuine choice.

Nurses must assess capacity: can the patient understand the information, retain it long enough to decide, weigh the options, and communicate their decision? When capacity is impaired, nurses advocate for the patient's rights and preferences, ensuring care remains patient - centred and respects autonomy.`;

function escapeSQL(text: string): string {
  return text.replace(/'/g, "''");
}

function generateSQL(): string {
  let sql = `-- Seed Data for Learning Module
-- Run this script in Supabase SQL Editor
-- This creates 3 lessons + 2 questions per subtopic

`;

  let lessonCount = 0;
  let questionCount = 0;

  // Process each topic
  for (const topic of LEARNING_TOPICS) {
    if (topic.subtopics.length === 0) {
      sql += `-- Skipping ${topic.title} (no subtopics)\n\n`;
      continue;
    }

    sql += `-- =============================================\n`;
    sql += `-- ${topic.title}\n`;
    sql += `-- =============================================\n\n`;

    // Process each subtopic
    for (const subtopic of topic.subtopics) {
      sql += `-- Subtopic ${subtopic.id}: ${subtopic.title}\n`;
      
      // Create 3 lessons
      sql += `INSERT INTO lessons (topic_id, title, content, audio_url, video_url, lesson_type, category, duration, is_active, display_order, passing_score_percentage) VALUES\n`;
      sql += `  ('${topic.id}', '${escapeSQL(subtopic.title)} - Audio Podcast', 'Listen to this audio podcast about ${escapeSQL(subtopic.title)}', '${PODCAST_URL}', NULL, 'audio', '${subtopic.id}', 10, true, 1, 80),\n`;
      sql += `  ('${topic.id}', '${escapeSQL(subtopic.title)} - Video Tutorial', 'Watch this video tutorial about ${escapeSQL(subtopic.title)}', NULL, '${VIDEO_URL}', 'video', '${subtopic.id}', 15, true, 2, 80),\n`;
      sql += `  ('${topic.id}', '${escapeSQL(subtopic.title)} - Introduction', '${escapeSQL(TEXT_CONTENT)}', NULL, NULL, 'text', '${subtopic.id}', 8, true, 3, 80);\n\n`;
      
      lessonCount += 3;

      // Create 2 questions
      sql += `-- Questions for ${subtopic.id}\n`;
      sql += `WITH q1 AS (\n`;
      sql += `  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)\n`;
      sql += `  VALUES ('Which of the following best describes the key principle of ${escapeSQL(subtopic.title)}?', 'learning', '${escapeSQL(topic.title)}', '${subtopic.id}', true, 'This question tests your understanding of ${escapeSQL(subtopic.title)} principles as outlined in the NMC Code.')\n`;
      sql += `  RETURNING id\n`;
      sql += `)\n`;
      sql += `INSERT INTO question_options (question_id, option_text, is_correct, display_order)\n`;
      sql += `SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q1\n`;
      sql += `UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q1\n`;
      sql += `UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q1\n`;
      sql += `UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q1;\n\n`;

      sql += `WITH q2 AS (\n`;
      sql += `  INSERT INTO questions (question_text, module_type, category, subdivision, is_active, explanation)\n`;
      sql += `  VALUES ('In the context of ${escapeSQL(subtopic.title)}, what is the nurse''s primary responsibility?', 'learning', '${escapeSQL(topic.title)}', '${subtopic.id}', true, 'This assesses your knowledge of nursing responsibilities related to ${escapeSQL(subtopic.title)}.')\n`;
      sql += `  RETURNING id\n`;
      sql += `)\n`;
      sql += `INSERT INTO question_options (question_id, option_text, is_correct, display_order)\n`;
      sql += `SELECT id, 'Patient-centered care and respect for individual autonomy', true, 1 FROM q2\n`;
      sql += `UNION ALL SELECT id, 'Following hospital protocols without deviation', false, 2 FROM q2\n`;
      sql += `UNION ALL SELECT id, 'Prioritizing efficiency over patient preferences', false, 3 FROM q2\n`;
      sql += `UNION ALL SELECT id, 'Making decisions on behalf of all patients', false, 4 FROM q2;\n\n`;

      questionCount += 2;
    }
  }

  sql += `-- =============================================\n`;
  sql += `-- Summary\n`;
  sql += `-- =============================================\n`;
  sql += `SELECT '${lessonCount} lessons created successfully!' AS status;\n`;
  sql += `SELECT '${questionCount} questions created successfully!' AS status;\n`;

  return sql;
}

// Generate and write the SQL file
const sql = generateSQL();
fs.writeFileSync('scripts/seed_learning_complete.sql', sql);
console.log('✅ SQL seed file generated: scripts/seed_learning_complete.sql');
console.log('📝 Run this file in Supabase SQL Editor to seed all Learning Module content');
