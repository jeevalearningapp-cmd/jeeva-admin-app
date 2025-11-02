-- ================================================================
-- JEEVA LEARNING - CORRECTED SEED DATA
-- Matches actual database schema (lessons + questions)
-- ================================================================
-- 
-- This script populates:
-- - 63 Lessons (3 per subtopic: audio, video, text)
-- - 42 Questions (2 per subtopic)
--
-- Run this in Supabase SQL Editor
-- ================================================================

DO $$
DECLARE
  -- Topic IDs (will be fetched dynamically)
  topic_nmc_code UUID;
  topic_mental_capacity UUID;
  topic_safeguarding UUID;
  topic_consent UUID;
  topic_equality UUID;
  topic_candour UUID;
  topic_cultural UUID;
  topic_numeracy UUID;
  
BEGIN
  -- ================================================================
  -- STEP 1: GET TOPIC IDs FROM DATABASE
  -- ================================================================
  RAISE NOTICE 'Looking up topic IDs...';
  
  -- Get topic IDs by matching titles
  SELECT id INTO topic_nmc_code FROM topics WHERE title ILIKE '%NMC Code%' LIMIT 1;
  SELECT id INTO topic_mental_capacity FROM topics WHERE title ILIKE '%Mental Capacity%' LIMIT 1;
  SELECT id INTO topic_safeguarding FROM topics WHERE title ILIKE '%Safeguarding%' LIMIT 1;
  SELECT id INTO topic_consent FROM topics WHERE title ILIKE '%Consent%' OR title ILIKE '%Confidentiality%' LIMIT 1;
  SELECT id INTO topic_equality FROM topics WHERE title ILIKE '%Equality%' OR title ILIKE '%Diversity%' LIMIT 1;
  SELECT id INTO topic_candour FROM topics WHERE title ILIKE '%Candour%' LIMIT 1;
  SELECT id INTO topic_cultural FROM topics WHERE title ILIKE '%Cultural%' LIMIT 1;
  SELECT id INTO topic_numeracy FROM topics WHERE title ILIKE '%Numeracy%' LIMIT 1;
  
  -- Verify we found the topics
  IF topic_nmc_code IS NULL THEN
    RAISE NOTICE 'WARNING: NMC Code topic not found - will skip those lessons';
  END IF;
  
  -- ================================================================
  -- STEP 2: INSERT LESSONS (63 Total)
  -- ================================================================
  RAISE NOTICE 'Inserting 63 lessons...';
  
  -- Topic: The NMC Code (assuming topic exists)
  IF topic_nmc_code IS NOT NULL THEN
    -- Subtopic 2.1: Prioritise People
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_nmc_code, 'NMC Code Podcast: Prioritise People', 'Listen to an expert discussion on prioritising people in nursing practice', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '2.1', 900, true, 1),
    (gen_random_uuid(), topic_nmc_code, 'Video: Prioritise People in Action', 'Watch real-world examples of prioritising people in UK healthcare', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '2.1', 720, true, 2),
    (gen_random_uuid(), topic_nmc_code, 'Introduction to Prioritise People', 'The first principle of the NMC Code requires nurses to treat people as individuals and uphold their dignity. This means respecting their rights, choices, and preferences while providing compassionate care.', 'text', null, null, '2.1', 300, true, 3);

    -- Subtopic 2.2: Practice Effectively
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_nmc_code, 'NMC Code Podcast: Practice Effectively', 'Learn about effective practice standards in UK nursing', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '2.2', 900, true, 4),
    (gen_random_uuid(), topic_nmc_code, 'Video: Effective Practice Examples', 'See how nurses practice effectively in various clinical settings', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '2.2', 720, true, 5),
    (gen_random_uuid(), topic_nmc_code, 'Introduction to Practice Effectively', 'Effective practice requires keeping skills and knowledge up to date, maintaining accurate records, and working within your competence. This principle ensures safe, evidence-based care delivery.', 'text', null, null, '2.2', 300, true, 6);

    -- Subtopic 2.3: Preserve Safety
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_nmc_code, 'NMC Code Podcast: Preserve Safety', 'Understanding safety preservation in nursing practice', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '2.3', 900, true, 7),
    (gen_random_uuid(), topic_nmc_code, 'Video: Preserving Patient Safety', 'Learn how to identify and manage safety risks in healthcare', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '2.3', 720, true, 8),
    (gen_random_uuid(), topic_nmc_code, 'Introduction to Preserve Safety', 'Preserving safety involves recognizing and responding to risks, raising concerns, and working to improve safety. Nurses must challenge poor practice and report incidents to protect public health.', 'text', null, null, '2.3', 300, true, 9);

    -- Subtopic 2.4: Promote Professionalism
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_nmc_code, 'NMC Code Podcast: Promote Professionalism', 'Exploring professional standards and trust in nursing', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '2.4', 900, true, 10),
    (gen_random_uuid(), topic_nmc_code, 'Video: Professional Behaviour in Practice', 'Examples of promoting professionalism in daily nursing work', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '2.4', 720, true, 11),
    (gen_random_uuid(), topic_nmc_code, 'Introduction to Promote Professionalism', 'Professionalism means upholding the reputation of nursing, acting with integrity, and being a role model. Nurses must maintain professional boundaries and work cooperatively with colleagues.', 'text', null, null, '2.4', 300, true, 12);
  END IF;
  
  -- Topic: Mental Capacity Act
  IF topic_mental_capacity IS NOT NULL THEN
    -- Subtopic 3.1: Presumption of Capacity
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_mental_capacity, 'Mental Capacity Act Podcast: Presumption of Capacity', 'Understanding the fundamental principle of presuming capacity', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '3.1', 900, true, 13),
    (gen_random_uuid(), topic_mental_capacity, 'Video: Presumption of Capacity in Practice', 'Real cases showing how to apply presumption of capacity', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '3.1', 720, true, 14),
    (gen_random_uuid(), topic_mental_capacity, 'Introduction to Presumption of Capacity', 'The Mental Capacity Act 2005 states that every adult has the right to make their own decisions unless proven otherwise. Healthcare professionals must always assume a person can make decisions unless there is evidence to the contrary.', 'text', null, null, '3.1', 300, true, 15);

    -- Subtopic 3.2: Assessing Capacity
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_mental_capacity, 'Mental Capacity Act Podcast: Assessing Capacity', 'Learn the two-stage test for assessing mental capacity', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '3.2', 900, true, 16),
    (gen_random_uuid(), topic_mental_capacity, 'Video: Capacity Assessments Step-by-Step', 'Practical guidance on conducting capacity assessments', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '3.2', 720, true, 17),
    (gen_random_uuid(), topic_mental_capacity, 'Introduction to Assessing Capacity', 'Assessing capacity involves determining if someone can understand, retain, use information to make a decision, and communicate that decision. Capacity is decision-specific and time-specific.', 'text', null, null, '3.2', 300, true, 18);

    -- Subtopic 3.3: Best Interests Decisions
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_mental_capacity, 'Mental Capacity Act Podcast: Best Interests', 'Making decisions in the best interests of patients', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '3.3', 900, true, 19),
    (gen_random_uuid(), topic_mental_capacity, 'Video: Best Interests Decision-Making', 'Examples of best interests decisions in clinical practice', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '3.3', 720, true, 20),
    (gen_random_uuid(), topic_mental_capacity, 'Introduction to Best Interests Decisions', 'When someone lacks capacity, decisions must be made in their best interests. This involves considering the person''s wishes, beliefs, values, and consulting with family and carers before acting.', 'text', null, null, '3.3', 300, true, 21);

    -- Subtopic 3.4: Advanced Care Planning
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_mental_capacity, 'Mental Capacity Act Podcast: Advanced Care Planning', 'Understanding advance decisions and lasting power of attorney', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '3.4', 900, true, 22),
    (gen_random_uuid(), topic_mental_capacity, 'Video: Advanced Care Planning in Action', 'How to support patients with advance care planning', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '3.4', 720, true, 23),
    (gen_random_uuid(), topic_mental_capacity, 'Introduction to Advanced Care Planning', 'Advance care planning includes advance decisions to refuse treatment (ADRT) and lasting powers of attorney (LPA). These legal documents allow people to plan for future care when they may lack capacity.', 'text', null, null, '3.4', 300, true, 24);
  END IF;
  
  -- Topic: Safeguarding
  IF topic_safeguarding IS NOT NULL THEN
    -- Subtopic 4.1: Recognising Abuse
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_safeguarding, 'Safeguarding Podcast: Recognising Abuse', 'Identifying signs and types of abuse in vulnerable adults', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '4.1', 900, true, 25),
    (gen_random_uuid(), topic_safeguarding, 'Video: Signs of Abuse and Neglect', 'Learn to recognize physical, emotional, and financial abuse', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '4.1', 720, true, 26),
    (gen_random_uuid(), topic_safeguarding, 'Introduction to Recognising Abuse', 'Abuse can be physical, emotional, sexual, financial, or neglect. Nurses must be alert to indicators such as unexplained injuries, changes in behavior, fear of certain people, or poor hygiene in vulnerable patients.', 'text', null, null, '4.1', 300, true, 27);

    -- Subtopic 4.2: Reporting Protocols
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_safeguarding, 'Safeguarding Podcast: Reporting Protocols', 'UK safeguarding reporting procedures and responsibilities', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '4.2', 900, true, 28),
    (gen_random_uuid(), topic_safeguarding, 'Video: Safeguarding Reporting Step-by-Step', 'How to report safeguarding concerns in your organization', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '4.2', 720, true, 29),
    (gen_random_uuid(), topic_safeguarding, 'Introduction to Reporting Protocols', 'All healthcare professionals have a duty to report safeguarding concerns. Follow your organization''s policy, document concerns accurately, and escalate to safeguarding leads or local authorities when necessary.', 'text', null, null, '4.2', 300, true, 30);

    -- Subtopic 4.3: Child Protection
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_safeguarding, 'Safeguarding Podcast: Child Protection', 'Protecting children and young people in healthcare settings', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '4.3', 900, true, 31),
    (gen_random_uuid(), topic_safeguarding, 'Video: Child Safeguarding in Practice', 'Recognizing and responding to child protection concerns', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '4.3', 720, true, 32),
    (gen_random_uuid(), topic_safeguarding, 'Introduction to Child Protection', 'Child protection requires understanding developmental stages, recognizing indicators of harm, and following children''s safeguarding procedures. Always prioritize the child''s welfare and safety above all other considerations.', 'text', null, null, '4.3', 300, true, 33);
  END IF;
  
  -- Topic: Consent & Confidentiality
  IF topic_consent IS NOT NULL THEN
    -- Subtopic 5.1: Valid Consent
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_consent, 'Consent Podcast: Valid Consent Principles', 'Understanding the legal requirements for valid consent', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '5.1', 900, true, 34),
    (gen_random_uuid(), topic_consent, 'Video: Obtaining Valid Consent', 'Best practices for gaining informed consent from patients', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '5.1', 720, true, 35),
    (gen_random_uuid(), topic_consent, 'Introduction to Valid Consent', 'Valid consent requires the person to be informed, have capacity, and give consent voluntarily. Patients must understand the treatment, risks, benefits, and alternatives before agreeing to proceed.', 'text', null, null, '5.1', 300, true, 36);

    -- Subtopic 5.2: GDPR & Confidentiality
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_consent, 'Confidentiality Podcast: GDPR in Healthcare', 'Data protection and confidentiality obligations under UK law', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '5.2', 900, true, 37),
    (gen_random_uuid(), topic_consent, 'Video: Maintaining Patient Confidentiality', 'GDPR compliance and patient confidentiality in practice', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '5.2', 720, true, 38),
    (gen_random_uuid(), topic_consent, 'Introduction to GDPR & Confidentiality', 'GDPR and the Data Protection Act 2018 require healthcare professionals to protect patient information. Share data only on a need-to-know basis, use secure systems, and respect patient privacy at all times.', 'text', null, null, '5.2', 300, true, 39);

    -- Subtopic 5.3: Confidentiality vs. Safeguarding
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_consent, 'Confidentiality Podcast: When to Break Confidentiality', 'Balancing confidentiality with safeguarding duties', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '5.3', 900, true, 40),
    (gen_random_uuid(), topic_consent, 'Video: Confidentiality Dilemmas in Practice', 'Case studies on breaching confidentiality for public interest', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '5.3', 720, true, 41),
    (gen_random_uuid(), topic_consent, 'Introduction to Confidentiality vs. Safeguarding', 'Confidentiality can be breached when there is a risk of serious harm to the patient or others. Safeguarding vulnerable people, preventing crime, or court orders may justify disclosure without consent.', 'text', null, null, '5.3', 300, true, 42);
  END IF;
  
  -- Topic: Equality & Diversity
  IF topic_equality IS NOT NULL THEN
    -- Subtopic 6.1: Equality Act 2010
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_equality, 'Equality Podcast: Equality Act 2010', 'Understanding protected characteristics and discrimination law', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '6.1', 900, true, 43),
    (gen_random_uuid(), topic_equality, 'Video: Equality Act in Healthcare', 'Applying equality legislation in nursing practice', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '6.1', 720, true, 44),
    (gen_random_uuid(), topic_equality, 'Introduction to Equality Act 2010', 'The Equality Act 2010 protects nine characteristics: age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion/belief, sex, and sexual orientation. Nurses must provide equal care regardless of these factors.', 'text', null, null, '6.1', 300, true, 45);

    -- Subtopic 6.2: Cultural Competence
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_equality, 'Diversity Podcast: Cultural Competence', 'Developing cultural awareness in patient care', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '6.2', 900, true, 46),
    (gen_random_uuid(), topic_equality, 'Video: Culturally Sensitive Care', 'Providing respectful care to diverse patient populations', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '6.2', 720, true, 47),
    (gen_random_uuid(), topic_equality, 'Introduction to Cultural Competence', 'Cultural competence involves understanding and respecting patients'' cultural backgrounds, beliefs, and practices. Nurses must avoid stereotypes, use interpreters when needed, and adapt care to meet diverse needs.', 'text', null, null, '6.2', 300, true, 48);

    -- Subtopic 6.3: Reasonable Adjustments
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_equality, 'Equality Podcast: Reasonable Adjustments', 'Making healthcare accessible for patients with disabilities', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '6.3', 900, true, 49),
    (gen_random_uuid(), topic_equality, 'Video: Reasonable Adjustments in Action', 'Examples of reasonable adjustments for disabled patients', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '6.3', 720, true, 50),
    (gen_random_uuid(), topic_equality, 'Introduction to Reasonable Adjustments', 'Reasonable adjustments remove barriers for disabled patients, such as providing accessible formats, longer appointments, or support workers. The Equality Act requires healthcare providers to make these adjustments proactively.', 'text', null, null, '6.3', 300, true, 51);
  END IF;
  
  -- Topic: Duty of Candour
  IF topic_candour IS NOT NULL THEN
    -- Subtopic 7.1: Transparency After Errors
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_candour, 'Duty of Candour Podcast: Transparency', 'The professional duty to be open and honest after incidents', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '7.1', 900, true, 52),
    (gen_random_uuid(), topic_candour, 'Video: Being Candid After Mistakes', 'How to communicate openly with patients after errors', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '7.1', 720, true, 53),
    (gen_random_uuid(), topic_candour, 'Introduction to Transparency After Errors', 'The duty of candour requires healthcare professionals to be open and honest when things go wrong. This includes apologizing, explaining what happened, and outlining steps to prevent recurrence.', 'text', null, null, '7.1', 300, true, 54);

    -- Subtopic 7.2: NHS Incident Reporting
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_candour, 'Duty of Candour Podcast: Incident Reporting', 'Using incident reporting systems to improve patient safety', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '7.2', 900, true, 55),
    (gen_random_uuid(), topic_candour, 'Video: NHS Incident Reporting Process', 'Step-by-step guide to reporting incidents and near misses', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '7.2', 720, true, 56),
    (gen_random_uuid(), topic_candour, 'Introduction to NHS Incident Reporting', 'All incidents, near misses, and adverse events must be reported through your organization''s system. Reporting promotes learning, improves safety, and ensures appropriate follow-up actions are taken.', 'text', null, null, '7.2', 300, true, 57);
  END IF;
  
  -- Topic: Cultural Adaptation
  IF topic_cultural IS NOT NULL THEN
    -- Subtopic 8.1: Autonomy vs. Family Decisions
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_cultural, 'Cultural Adaptation Podcast: Autonomy and Family', 'Navigating patient autonomy in collectivist cultures', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '8.1', 900, true, 58),
    (gen_random_uuid(), topic_cultural, 'Video: Balancing Individual and Family Choices', 'Case studies on family involvement in decision-making', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '8.1', 720, true, 59),
    (gen_random_uuid(), topic_cultural, 'Introduction to Autonomy vs. Family Decisions', 'UK healthcare emphasizes individual autonomy, but many cultures involve families in decisions. Nurses must respect patient preferences while ensuring the individual''s voice is heard and their rights protected.', 'text', null, null, '8.1', 300, true, 60);

    -- Subtopic 8.2: UK Communication Styles
    INSERT INTO lessons (id, topic_id, title, content, lesson_type, audio_url, video_url, category, duration, is_active, display_order) VALUES
    (gen_random_uuid(), topic_cultural, 'Cultural Adaptation Podcast: UK Communication', 'Understanding British communication norms in healthcare', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', null, '8.2', 900, true, 61),
    (gen_random_uuid(), topic_cultural, 'Video: Adapting to UK Healthcare Communication', 'Effective communication strategies for international nurses', 'video', null, 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', '8.2', 720, true, 62),
    (gen_random_uuid(), topic_cultural, 'Introduction to UK Communication Styles', 'UK communication tends to be indirect and polite. Phrases like "perhaps we could" or "I wonder if" are common. Understanding these subtleties helps international nurses communicate effectively with patients and colleagues.', 'text', null, null, '8.2', 300, true, 63);
  END IF;
  
  RAISE NOTICE '✅ 63 lessons inserted successfully!';
  
  -- ================================================================
  -- STEP 3: INSERT QUESTIONS (42 Total - 2 per subtopic)
  -- ================================================================
  RAISE NOTICE 'Inserting 42 questions...';
  
  -- Topic 2: The NMC Code
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'The NMC Code', '2.1', 'Which principle of the NMC Code emphasizes treating people with kindness, respect, and compassion?', 'easy', 'Prioritise People is the first principle of the NMC Code, requiring nurses to treat people as individuals and uphold their dignity with kindness, respect, and compassion.', true),
  (gen_random_uuid(), 'The NMC Code', '2.1', 'A patient requests to see their medical records. According to the NMC Code principle of Prioritise People, what should you do?', 'medium', 'Under the Prioritise People principle, patients have the right to access their health records. You should facilitate this request following your organization''s policy, respecting their right to information about their care.', true),
  
  (gen_random_uuid(), 'The NMC Code', '2.2', 'What is the most important requirement for practicing effectively according to the NMC Code?', 'medium', 'Keeping your knowledge and skills up to date is fundamental to effective practice. This ensures you provide safe, evidence-based care and work within your competence at all times.', true),
  (gen_random_uuid(), 'The NMC Code', '2.2', 'You are asked to perform a procedure you have never done before. According to Practice Effectively, what should you do?', 'easy', 'You must work within your competence. Decline the procedure and request supervision or training. Never attempt procedures you are not competent to perform, as this could endanger patient safety.', true),
  
  (gen_random_uuid(), 'The NMC Code', '2.3', 'You witness a colleague making a medication error. What does the Preserve Safety principle require you to do?', 'medium', 'The Preserve Safety principle requires you to raise concerns immediately to protect patient safety. Report the error to prevent harm and ensure proper documentation and follow-up.', true),
  (gen_random_uuid(), 'The NMC Code', '2.3', 'Which action best demonstrates preserving safety in nursing practice?', 'easy', 'Challenging poor practice, even when difficult, is essential to preserving safety. Nurses must speak up about unsafe conditions or behaviors to protect patients and maintain standards of care.', true),
  
  (gen_random_uuid(), 'The NMC Code', '2.4', 'What does promoting professionalism and trust mean in the NMC Code?', 'medium', 'Promoting professionalism means upholding the reputation of nursing through integrity, honesty, and ethical behavior. It includes maintaining professional boundaries and being a positive role model.', true),
  (gen_random_uuid(), 'The NMC Code', '2.4', 'A patient offers you a valuable gift. According to Promote Professionalism, what should you do?', 'medium', 'Politely decline valuable gifts to maintain professional boundaries. You may accept small tokens of appreciation according to your organization''s policy, but expensive gifts could compromise professional relationships.', true);
  
  -- Topic 3: Mental Capacity Act
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Mental Capacity Act', '3.1', 'What does the presumption of capacity mean under the Mental Capacity Act 2005?', 'easy', 'The presumption of capacity means every adult is assumed to have the mental capacity to make their own decisions unless proven otherwise. This is a fundamental principle of the Act.', true),
  (gen_random_uuid(), 'Mental Capacity Act', '3.1', 'A patient with dementia wants to refuse treatment. What should you assume first?', 'medium', 'Assume they have capacity to make this decision. Having dementia does not automatically mean someone lacks capacity. You must assess their capacity for this specific decision before overriding their choice.', true),
  
  (gen_random_uuid(), 'Mental Capacity Act', '3.2', 'What are the four components someone must demonstrate to have mental capacity?', 'medium', 'To have capacity, a person must be able to: (1) understand information, (2) retain that information, (3) use or weigh the information to make a decision, and (4) communicate their decision.', true),
  (gen_random_uuid(), 'Mental Capacity Act', '3.2', 'Is mental capacity decision-specific?', 'easy', 'Yes, capacity is decision-specific. A person may have capacity to make some decisions but not others. For example, they might be able to decide what to eat but not whether to undergo surgery.', true),
  
  (gen_random_uuid(), 'Mental Capacity Act', '3.3', 'When making a best interests decision, who should be consulted?', 'medium', 'Consult the person themselves (if possible), family members, carers, and anyone named by the person. Consider the person''s past and present wishes, beliefs, values, and other relevant factors.', true),
  (gen_random_uuid(), 'Mental Capacity Act', '3.3', 'Can you make a best interests decision for someone who has capacity?', 'easy', 'No. If someone has capacity to make a decision, they must make it themselves. Best interests decisions only apply when someone lacks capacity for that specific decision.', true),
  
  (gen_random_uuid(), 'Mental Capacity Act', '3.4', 'What is an Advance Decision to Refuse Treatment (ADRT)?', 'medium', 'An ADRT is a legally binding decision made by someone with capacity to refuse specific treatments in the future if they lose capacity. It must be valid and applicable to the current situation.', true),
  (gen_random_uuid(), 'Mental Capacity Act', '3.4', 'What is the role of a Lasting Power of Attorney for Health and Welfare?', 'medium', 'An LPA for health and welfare allows a named person to make healthcare decisions on behalf of someone who has lost capacity. It must be registered with the Office of the Public Guardian to be valid.', true);
  
  -- Topic 4: Safeguarding
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Safeguarding', '4.1', 'What are the main types of abuse that healthcare professionals should recognize?', 'easy', 'The main types are physical, emotional/psychological, sexual, financial, and neglect. Nurses must be alert to indicators of all these forms of abuse in vulnerable patients.', true),
  (gen_random_uuid(), 'Safeguarding', '4.1', 'An elderly patient has multiple bruises in different stages of healing. What should you consider?', 'medium', 'Consider the possibility of physical abuse. Bruises at different stages of healing, especially in unusual locations, may indicate repeated injury. Document findings and follow safeguarding procedures.', true),
  
  (gen_random_uuid(), 'Safeguarding', '4.2', 'What should you do if you suspect abuse but are not certain?', 'medium', 'Report your concerns anyway. You do not need to be certain - suspicion is enough to trigger a safeguarding referral. It is not your role to investigate, but to raise concerns appropriately.', true),
  (gen_random_uuid(), 'Safeguarding', '4.2', 'Who should you report safeguarding concerns to?', 'easy', 'Report to your organization''s designated safeguarding lead or local authority safeguarding team. Follow your organization''s safeguarding policy and document all concerns accurately.', true),
  
  (gen_random_uuid(), 'Safeguarding', '4.3', 'What is the primary consideration in child protection?', 'easy', 'The child''s welfare and safety is always the paramount consideration. All decisions and actions must prioritize protecting the child from harm above all other factors.', true),
  (gen_random_uuid(), 'Safeguarding', '4.3', 'A parent asks you not to report your concerns about their child. What should you do?', 'medium', 'You must still report safeguarding concerns despite parental objections. Child safety takes priority over parental wishes. Explain your duty to protect the child and follow safeguarding procedures.', true);
  
  -- Topic 5: Consent & Confidentiality
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Consent & Confidentiality', '5.1', 'What are the three key elements of valid consent?', 'medium', 'Valid consent must be: (1) informed - the person understands the treatment, risks, benefits, and alternatives; (2) given by someone with capacity; (3) given voluntarily without coercion or undue influence.', true),
  (gen_random_uuid(), 'Consent & Confidentiality', '5.1', 'Can consent be withdrawn after it has been given?', 'easy', 'Yes, patients can withdraw consent at any time. Even if treatment has started, if a patient withdraws consent, you must stop unless continuing is necessary to prevent serious harm.', true),
  
  (gen_random_uuid(), 'Consent & Confidentiality', '5.2', 'Under GDPR, when can patient information be shared without consent?', 'medium', 'Information can be shared without consent when required by law, for safeguarding, to prevent serious crime, or when in the public interest. Use the minimum necessary information and document the decision.', true),
  (gen_random_uuid(), 'Consent & Confidentiality', '5.2', 'What is the principle of "need to know" in healthcare confidentiality?', 'easy', 'Need to know means sharing patient information only with healthcare professionals directly involved in that patient''s care. Do not discuss cases with those not involved, even within your organization.', true),
  
  (gen_random_uuid(), 'Consent & Confidentiality', '5.3', 'When does safeguarding override confidentiality?', 'medium', 'Safeguarding overrides confidentiality when there is risk of serious harm to a vulnerable person or others. You can breach confidentiality to prevent harm, even without the patient''s consent.', true),
  (gen_random_uuid(), 'Consent & Confidentiality', '5.3', 'A patient discloses they are being abused but asks you not to tell anyone. What should you do?', 'hard', 'Explain you have a duty to report to protect them. Try to gain their consent, but if they refuse and risk is significant, you may need to breach confidentiality. Document your decision-making and seek senior guidance.', true);
  
  -- Topic 6: Equality & Diversity
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Equality & Diversity', '6.1', 'How many protected characteristics are covered by the Equality Act 2010?', 'easy', 'There are nine protected characteristics: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.', true),
  (gen_random_uuid(), 'Equality & Diversity', '6.1', 'What is direct discrimination under the Equality Act?', 'medium', 'Direct discrimination is treating someone less favorably because of a protected characteristic. For example, refusing treatment to someone because of their race would be direct discrimination.', true),
  
  (gen_random_uuid(), 'Equality & Diversity', '6.2', 'What is cultural competence in nursing?', 'medium', 'Cultural competence is the ability to understand, respect, and effectively respond to people from different cultural backgrounds. It involves avoiding stereotypes and adapting care to meet diverse needs.', true),
  (gen_random_uuid(), 'Equality & Diversity', '6.2', 'A patient does not speak English. What should you do?', 'easy', 'Arrange a professional interpreter. Never use family members, especially children, to interpret medical information as this compromises accuracy, confidentiality, and patient autonomy.', true),
  
  (gen_random_uuid(), 'Equality & Diversity', '6.3', 'What are reasonable adjustments under the Equality Act?', 'medium', 'Reasonable adjustments are changes made to remove barriers for disabled people. Examples include providing information in accessible formats, allowing longer appointments, or ensuring wheelchair access.', true),
  (gen_random_uuid(), 'Equality & Diversity', '6.3', 'When should reasonable adjustments be made?', 'easy', 'Reasonable adjustments should be made proactively, not just when requested. Healthcare providers must anticipate and remove barriers to ensure equal access for disabled patients.', true);
  
  -- Topic 7: Duty of Candour
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Duty of Candour', '7.1', 'What is the professional duty of candour?', 'medium', 'The duty of candour requires healthcare professionals to be open and honest when things go wrong. This includes apologizing, explaining what happened, and outlining steps to prevent recurrence.', true),
  (gen_random_uuid(), 'Duty of Candour', '7.1', 'Should you apologize after making a mistake?', 'easy', 'Yes, apologizing is part of the duty of candour. An apology is not an admission of legal liability but shows compassion and honesty, which patients value highly after errors.', true),
  
  (gen_random_uuid(), 'Duty of Candour', '7.2', 'What types of events should be reported through incident reporting systems?', 'medium', 'Report all incidents, near misses, and adverse events. This includes medication errors, falls, pressure ulcers, equipment failures, and any event that caused or could have caused harm.', true),
  (gen_random_uuid(), 'Duty of Candour', '7.2', 'Why is incident reporting important?', 'easy', 'Incident reporting promotes learning and improves patient safety. It identifies trends, allows investigation, and helps prevent similar events. Reporting is a professional duty, not a blame exercise.', true);
  
  -- Topic 8: Cultural Adaptation
  INSERT INTO questions (id, category, subdivision, question_text, difficulty, explanation, is_active) VALUES
  (gen_random_uuid(), 'Cultural Adaptation', '8.1', 'In UK healthcare, whose decision takes priority - the patient or their family?', 'medium', 'The patient''s decision takes priority. While UK law respects family involvement, it emphasizes individual autonomy. The patient with capacity must make their own healthcare decisions.', true),
  (gen_random_uuid(), 'Cultural Adaptation', '8.1', 'A family insists on making decisions for a patient with capacity. How should you respond?', 'medium', 'Politely explain that UK law requires the patient to make their own decisions if they have capacity. Encourage family involvement in discussions, but ensure the patient''s voice is heard and respected.', true),
  
  (gen_random_uuid(), 'Cultural Adaptation', '8.2', 'What characterizes typical UK communication in healthcare settings?', 'medium', 'UK communication tends to be polite and indirect, using softening phrases like "perhaps we could" or "would you mind." Understanding these subtleties helps international nurses communicate effectively.', true),
  (gen_random_uuid(), 'Cultural Adaptation', '8.2', 'Why is understanding UK communication styles important for international nurses?', 'easy', 'Understanding communication styles prevents misunderstandings with patients and colleagues. What seems indirect in the UK may be normal professional communication, not rudeness or lack of clarity.', true);
  
  RAISE NOTICE '✅ 42 questions inserted successfully!';
  
  -- ================================================================
  -- VERIFICATION
  -- ================================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED DATA COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📚 Lessons created: 63 (3 per subtopic)';
  RAISE NOTICE '❓ Questions created: 42 (2 per subtopic)';
  RAISE NOTICE '⚠️  Next step: Add 4 options per question (run generate_all_question_options.sql)';
  RAISE NOTICE '';
  
END $$;

-- ================================================================
-- VERIFICATION QUERIES (optional - run separately)
-- ================================================================
-- SELECT COUNT(*) as lesson_count FROM lessons;
-- SELECT COUNT(*) as question_count FROM questions;
-- SELECT category, COUNT(*) FROM lessons GROUP BY category ORDER BY category;
-- SELECT subdivision, COUNT(*) FROM questions GROUP BY subdivision ORDER BY subdivision;
