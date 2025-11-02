-- ================================================================
-- JEEVA LEARNING - COMPLETE SEED DATA
-- Learning Module: Questions and Lessons for All Subtopics
-- ================================================================
-- 
-- This script populates:
-- - 63 Lessons (3 per subtopic: audio, video, text)
-- - 42 Questions (2 per subtopic with 4 options each)
--
-- Subtopic Structure (After Numeracy Remapping):
-- - The NMC Code: 2.1, 2.2, 2.3, 2.4
-- - Mental Capacity Act: 3.1, 3.2, 3.3, 3.4
-- - Safeguarding: 4.1, 4.2, 4.3
-- - Consent & Confidentiality: 5.1, 5.2, 5.3
-- - Equality & Diversity: 6.1, 6.2, 6.3
-- - Duty of Candour: 7.1, 7.2
-- - Cultural Adaptation: 8.1, 8.2
--
-- ================================================================

-- ================================================================
-- PART 1: LESSONS (63 Total)
-- ================================================================

-- Topic 2: The NMC Code
-- Subtopic 2.1: Prioritise People
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'NMC Code Podcast: Prioritise People', '2.1', 'Listen to an expert discussion on prioritising people in nursing practice', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Prioritise People in Action', '2.1', 'Watch real-world examples of prioritising people in UK healthcare', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Prioritise People', '2.1', 'The first principle of the NMC Code requires nurses to treat people as individuals and uphold their dignity. This means respecting their rights, choices, and preferences while providing compassionate care.', 'text', null, 5, true, 3);

-- Subtopic 2.2: Practice Effectively
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'NMC Code Podcast: Practice Effectively', '2.2', 'Learn about effective practice standards in UK nursing', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Effective Practice Examples', '2.2', 'See how nurses practice effectively in various clinical settings', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Practice Effectively', '2.2', 'Effective practice requires keeping skills and knowledge up to date, maintaining accurate records, and working within your competence. This principle ensures safe, evidence-based care delivery.', 'text', null, 5, true, 3);

-- Subtopic 2.3: Preserve Safety
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'NMC Code Podcast: Preserve Safety', '2.3', 'Understanding safety preservation in nursing practice', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Preserving Patient Safety', '2.3', 'Learn how to identify and manage safety risks in healthcare', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Preserve Safety', '2.3', 'Preserving safety involves recognizing and responding to risks, raising concerns, and working to improve safety. Nurses must challenge poor practice and report incidents to protect public health.', 'text', null, 5, true, 3);

-- Subtopic 2.4: Promote Professionalism
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'NMC Code Podcast: Promote Professionalism', '2.4', 'Exploring professional standards and trust in nursing', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Professional Behaviour in Practice', '2.4', 'Examples of promoting professionalism in daily nursing work', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Promote Professionalism', '2.4', 'Professionalism means upholding the reputation of nursing, acting with integrity, and being a role model. Nurses must maintain professional boundaries and work cooperatively with colleagues.', 'text', null, 5, true, 3);

-- Topic 3: Mental Capacity Act
-- Subtopic 3.1: Presumption of Capacity
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act Podcast: Presumption of Capacity', '3.1', 'Understanding the fundamental principle of presuming capacity', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Presumption of Capacity in Practice', '3.1', 'Real cases showing how to apply presumption of capacity', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Presumption of Capacity', '3.1', 'The Mental Capacity Act 2005 states that every adult has the right to make their own decisions unless proven otherwise. Healthcare professionals must always assume a person can make decisions unless there is evidence to the contrary.', 'text', null, 5, true, 3);

-- Subtopic 3.2: Assessing Capacity
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act Podcast: Assessing Capacity', '3.2', 'Learn the two-stage test for assessing mental capacity', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Capacity Assessments Step-by-Step', '3.2', 'Practical guidance on conducting capacity assessments', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Assessing Capacity', '3.2', 'Assessing capacity involves determining if someone can understand, retain, use information to make a decision, and communicate that decision. Capacity is decision-specific and time-specific.', 'text', null, 5, true, 3);

-- Subtopic 3.3: Best Interests Decisions
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act Podcast: Best Interests', '3.3', 'Making decisions in the best interests of patients', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Best Interests Decision-Making', '3.3', 'Examples of best interests decisions in clinical practice', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Best Interests Decisions', '3.3', 'When someone lacks capacity, decisions must be made in their best interests. This involves considering the person\'s wishes, beliefs, values, and consulting with family and carers before acting.', 'text', null, 5, true, 3);

-- Subtopic 3.4: Advanced Care Planning
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act Podcast: Advanced Care Planning', '3.4', 'Understanding advance decisions and lasting power of attorney', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Advanced Care Planning in Action', '3.4', 'How to support patients with advance care planning', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Advanced Care Planning', '3.4', 'Advance care planning includes advance decisions to refuse treatment (ADRT) and lasting powers of attorney (LPA). These legal documents allow people to plan for future care when they may lack capacity.', 'text', null, 5, true, 3);

-- Topic 4: Safeguarding
-- Subtopic 4.1: Recognising Abuse
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding Podcast: Recognising Abuse', '4.1', 'Identifying signs and types of abuse in vulnerable adults', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Signs of Abuse and Neglect', '4.1', 'Learn to recognize physical, emotional, and financial abuse', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Recognising Abuse', '4.1', 'Abuse can be physical, emotional, sexual, financial, or neglect. Nurses must be alert to indicators such as unexplained injuries, changes in behavior, fear of certain people, or poor hygiene in vulnerable patients.', 'text', null, 5, true, 3);

-- Subtopic 4.2: Reporting Protocols
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding Podcast: Reporting Protocols', '4.2', 'UK safeguarding reporting procedures and responsibilities', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Safeguarding Reporting Step-by-Step', '4.2', 'How to report safeguarding concerns in your organization', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Reporting Protocols', '4.2', 'All healthcare professionals have a duty to report safeguarding concerns. Follow your organization\'s policy, document concerns accurately, and escalate to safeguarding leads or local authorities when necessary.', 'text', null, 5, true, 3);

-- Subtopic 4.3: Child Protection
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding Podcast: Child Protection', '4.3', 'Protecting children and young people in healthcare settings', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Child Safeguarding in Practice', '4.3', 'Recognizing and responding to child protection concerns', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Child Protection', '4.3', 'Child protection requires understanding developmental stages, recognizing indicators of harm, and following children\'s safeguarding procedures. Always prioritize the child\'s welfare and safety above all other considerations.', 'text', null, 5, true, 3);

-- Topic 5: Consent & Confidentiality
-- Subtopic 5.1: Valid Consent
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Consent Podcast: Valid Consent Principles', '5.1', 'Understanding the legal requirements for valid consent', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Obtaining Valid Consent', '5.1', 'Best practices for gaining informed consent from patients', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Valid Consent', '5.1', 'Valid consent requires the person to be informed, have capacity, and give consent voluntarily. Patients must understand the treatment, risks, benefits, and alternatives before agreeing to proceed.', 'text', null, 5, true, 3);

-- Subtopic 5.2: GDPR & Confidentiality
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Confidentiality Podcast: GDPR in Healthcare', '5.2', 'Data protection and confidentiality obligations under UK law', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Maintaining Patient Confidentiality', '5.2', 'GDPR compliance and patient confidentiality in practice', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to GDPR & Confidentiality', '5.2', 'GDPR and the Data Protection Act 2018 require healthcare professionals to protect patient information. Share data only on a need-to-know basis, use secure systems, and respect patient privacy at all times.', 'text', null, 5, true, 3);

-- Subtopic 5.3: Confidentiality vs. Safeguarding
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Confidentiality Podcast: When to Break Confidentiality', '5.3', 'Balancing confidentiality with safeguarding duties', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Confidentiality Dilemmas in Practice', '5.3', 'Case studies on breaching confidentiality for public interest', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Confidentiality vs. Safeguarding', '5.3', 'Confidentiality can be breached when there is a risk of serious harm to the patient or others. Safeguarding vulnerable people, preventing crime, or court orders may justify disclosure without consent.', 'text', null, 5, true, 3);

-- Topic 6: Equality & Diversity
-- Subtopic 6.1: Equality Act 2010
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Equality Podcast: Equality Act 2010', '6.1', 'Understanding protected characteristics and discrimination law', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Equality Act in Healthcare', '6.1', 'Applying equality legislation in nursing practice', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Equality Act 2010', '6.1', 'The Equality Act 2010 protects nine characteristics: age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion/belief, sex, and sexual orientation. Nurses must provide equal care regardless of these factors.', 'text', null, 5, true, 3);

-- Subtopic 6.2: Cultural Competence
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Diversity Podcast: Cultural Competence', '6.2', 'Developing cultural awareness in patient care', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Culturally Sensitive Care', '6.2', 'Providing respectful care to diverse patient populations', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Cultural Competence', '6.2', 'Cultural competence involves understanding and respecting patients\' cultural backgrounds, beliefs, and practices. Nurses must avoid stereotypes, use interpreters when needed, and adapt care to meet diverse needs.', 'text', null, 5, true, 3);

-- Subtopic 6.3: Reasonable Adjustments
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Equality Podcast: Reasonable Adjustments', '6.3', 'Making healthcare accessible for patients with disabilities', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Reasonable Adjustments in Action', '6.3', 'Examples of reasonable adjustments for disabled patients', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Reasonable Adjustments', '6.3', 'Reasonable adjustments remove barriers for disabled patients, such as providing accessible formats, longer appointments, or support workers. The Equality Act requires healthcare providers to make these adjustments proactively.', 'text', null, 5, true, 3);

-- Topic 7: Duty of Candour
-- Subtopic 7.1: Transparency After Errors
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Duty of Candour Podcast: Transparency', '7.1', 'The professional duty to be open and honest after incidents', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Being Candid After Mistakes', '7.1', 'How to communicate openly with patients after errors', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Transparency After Errors', '7.1', 'The duty of candour requires healthcare professionals to be open and honest when things go wrong. This includes apologizing, explaining what happened, and outlining steps to prevent recurrence.', 'text', null, 5, true, 3);

-- Subtopic 7.2: NHS Incident Reporting
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Duty of Candour Podcast: Incident Reporting', '7.2', 'Using incident reporting systems to improve patient safety', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: NHS Incident Reporting Process', '7.2', 'Step-by-step guide to reporting incidents and near misses', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to NHS Incident Reporting', '7.2', 'All incidents, near misses, and adverse events must be reported through your organization\'s system. Reporting promotes learning, improves safety, and ensures appropriate follow-up actions are taken.', 'text', null, 5, true, 3);

-- Topic 8: Cultural Adaptation
-- Subtopic 8.1: Autonomy vs. Family Decisions
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Cultural Adaptation Podcast: Autonomy and Family', '8.1', 'Navigating patient autonomy in collectivist cultures', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Balancing Individual and Family Choices', '8.1', 'Case studies on family involvement in decision-making', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to Autonomy vs. Family Decisions', '8.1', 'UK healthcare emphasizes individual autonomy, but many cultures involve families in decisions. Nurses must respect patient preferences while ensuring the individual\'s voice is heard and their rights protected.', 'text', null, 5, true, 3);

-- Subtopic 8.2: UK Communication Styles
INSERT INTO lessons (id, title, category, content, content_type, media_url, duration_minutes, is_active, display_order) VALUES
(gen_random_uuid(), 'Cultural Adaptation Podcast: UK Communication', '8.2', 'Understanding British communication norms in healthcare', 'audio', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Podcast%20audio/NMC-code.mp3', 15, true, 1),
(gen_random_uuid(), 'Video: Adapting to UK Healthcare Communication', '8.2', 'Effective communication strategies for international nurses', 'video', 'https://qsvjvgsnbslgypykuznd.supabase.co/storage/v1/object/public/Video%20tutorial/1.1%20Prioritise%20people.mp4', 12, true, 2),
(gen_random_uuid(), 'Introduction to UK Communication Styles', '8.2', 'UK communication tends to be indirect and polite. Phrases like "perhaps we could" or "I wonder if" are common. Understanding these subtleties helps international nurses communicate effectively with patients and colleagues.', 'text', null, 5, true, 3);


-- ================================================================
-- PART 2: QUESTIONS (42 Total - 2 per subtopic)
-- ================================================================

-- Topic 2: The NMC Code
-- Subtopic 2.1: Prioritise People
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'The NMC Code', '2.1', 'Which principle of the NMC Code emphasizes treating people with kindness, respect, and compassion?', 'easy', 'Prioritise People is the first principle of the NMC Code, requiring nurses to treat people as individuals and uphold their dignity with kindness, respect, and compassion.', true, 1),
(gen_random_uuid(), 'The NMC Code', '2.1', 'A patient requests to see their medical records. According to the NMC Code principle of Prioritise People, what should you do?', 'medium', 'Under the Prioritise People principle, patients have the right to access their health records. You should facilitate this request following your organization''s policy, respecting their right to information about their care.', true, 2);

-- Subtopic 2.2: Practice Effectively
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'The NMC Code', '2.2', 'What is the most important requirement for practicing effectively according to the NMC Code?', 'medium', 'Keeping your knowledge and skills up to date is fundamental to effective practice. This ensures you provide safe, evidence-based care and work within your competence at all times.', true, 1),
(gen_random_uuid(), 'The NMC Code', '2.2', 'You are asked to perform a procedure you have never done before. According to Practice Effectively, what should you do?', 'easy', 'You must work within your competence. Decline the procedure and request supervision or training. Never attempt procedures you are not competent to perform, as this could endanger patient safety.', true, 2);

-- Subtopic 2.3: Preserve Safety
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'The NMC Code', '2.3', 'You witness a colleague making a medication error. What does the Preserve Safety principle require you to do?', 'medium', 'The Preserve Safety principle requires you to raise concerns immediately to protect patient safety. Report the error to prevent harm and ensure proper documentation and follow-up.', true, 1),
(gen_random_uuid(), 'The NMC Code', '2.3', 'Which action best demonstrates preserving safety in nursing practice?', 'easy', 'Challenging poor practice, even when difficult, is essential to preserving safety. Nurses must speak up about unsafe conditions or behaviors to protect patients and maintain standards of care.', true, 2);

-- Subtopic 2.4: Promote Professionalism
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'The NMC Code', '2.4', 'What does promoting professionalism and trust mean in the NMC Code?', 'medium', 'Promoting professionalism means upholding the reputation of nursing through integrity, honesty, and ethical behavior. It includes maintaining professional boundaries and being a positive role model.', true, 1),
(gen_random_uuid(), 'The NMC Code', '2.4', 'A patient offers you a valuable gift. According to Promote Professionalism, what should you do?', 'medium', 'Politely decline valuable gifts to maintain professional boundaries. You may accept small tokens of appreciation according to your organization''s policy, but expensive gifts could compromise professional relationships.', true, 2);

-- Topic 3: Mental Capacity Act
-- Subtopic 3.1: Presumption of Capacity
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act', '3.1', 'What does the presumption of capacity mean under the Mental Capacity Act 2005?', 'easy', 'The presumption of capacity means every adult is assumed to have the mental capacity to make their own decisions unless proven otherwise. This is a fundamental principle of the Act.', true, 1),
(gen_random_uuid(), 'Mental Capacity Act', '3.1', 'A patient with dementia wants to refuse treatment. What should you assume first?', 'medium', 'Assume they have capacity to make this decision. Having dementia does not automatically mean someone lacks capacity. You must assess their capacity for this specific decision before overriding their choice.', true, 2);

-- Subtopic 3.2: Assessing Capacity
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act', '3.2', 'What are the four components someone must demonstrate to have mental capacity?', 'medium', 'To have capacity, a person must be able to: (1) understand information, (2) retain that information, (3) use or weigh the information to make a decision, and (4) communicate their decision.', true, 1),
(gen_random_uuid(), 'Mental Capacity Act', '3.2', 'Is mental capacity decision-specific?', 'easy', 'Yes, capacity is decision-specific. A person may have capacity to make some decisions but not others. For example, they might be able to decide what to eat but not whether to undergo surgery.', true, 2);

-- Subtopic 3.3: Best Interests Decisions
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act', '3.3', 'When making a best interests decision, who should be consulted?', 'medium', 'Consult the person themselves (if possible), family members, carers, and anyone named by the person. Consider the person''s past and present wishes, beliefs, values, and other relevant factors.', true, 1),
(gen_random_uuid(), 'Mental Capacity Act', '3.3', 'Can you make a best interests decision for someone who has capacity?', 'easy', 'No. If someone has capacity to make a decision, they must make it themselves. Best interests decisions only apply when someone lacks capacity for that specific decision.', true, 2);

-- Subtopic 3.4: Advanced Care Planning
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Mental Capacity Act', '3.4', 'What is an Advance Decision to Refuse Treatment (ADRT)?', 'medium', 'An ADRT is a legally binding decision made by someone with capacity to refuse specific treatments in the future if they lose capacity. It must be valid and applicable to the current situation.', true, 1),
(gen_random_uuid(), 'Mental Capacity Act', '3.4', 'What is the role of a Lasting Power of Attorney for Health and Welfare?', 'medium', 'An LPA for health and welfare allows a named person to make healthcare decisions on behalf of someone who has lost capacity. It must be registered with the Office of the Public Guardian to be valid.', true, 2);

-- Topic 4: Safeguarding
-- Subtopic 4.1: Recognising Abuse
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding', '4.1', 'What are the main types of abuse that healthcare professionals should recognize?', 'easy', 'The main types are physical, emotional/psychological, sexual, financial, and neglect. Nurses must be alert to indicators of all these forms of abuse in vulnerable patients.', true, 1),
(gen_random_uuid(), 'Safeguarding', '4.1', 'An elderly patient has multiple bruises in different stages of healing. What should you consider?', 'medium', 'Consider the possibility of physical abuse. Bruises at different stages of healing, especially in unusual locations, may indicate repeated injury. Document findings and follow safeguarding procedures.', true, 2);

-- Subtopic 4.2: Reporting Protocols
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding', '4.2', 'What should you do if you suspect abuse but are not certain?', 'medium', 'Report your concerns anyway. You do not need to be certain - suspicion is enough to trigger a safeguarding referral. It is not your role to investigate, but to raise concerns appropriately.', true, 1),
(gen_random_uuid(), 'Safeguarding', '4.2', 'Who should you report safeguarding concerns to?', 'easy', 'Report to your organization''s designated safeguarding lead or local authority safeguarding team. Follow your organization''s safeguarding policy and document all concerns accurately.', true, 2);

-- Subtopic 4.3: Child Protection
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Safeguarding', '4.3', 'What is the primary consideration in child protection?', 'easy', 'The child''s welfare and safety is always the paramount consideration. All decisions and actions must prioritize protecting the child from harm above all other factors.', true, 1),
(gen_random_uuid(), 'Safeguarding', '4.3', 'A parent asks you not to report your concerns about their child. What should you do?', 'medium', 'You must still report safeguarding concerns despite parental objections. Child safety takes priority over parental wishes. Explain your duty to protect the child and follow safeguarding procedures.', true, 2);

-- Topic 5: Consent & Confidentiality
-- Subtopic 5.1: Valid Consent
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Consent & Confidentiality', '5.1', 'What are the three key elements of valid consent?', 'medium', 'Valid consent must be: (1) informed - the person understands the treatment, risks, benefits, and alternatives; (2) given by someone with capacity; (3) given voluntarily without coercion or undue influence.', true, 1),
(gen_random_uuid(), 'Consent & Confidentiality', '5.1', 'Can consent be withdrawn after it has been given?', 'easy', 'Yes, patients can withdraw consent at any time. Even if treatment has started, if a patient withdraws consent, you must stop unless continuing is necessary to prevent serious harm.', true, 2);

-- Subtopic 5.2: GDPR & Confidentiality
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Consent & Confidentiality', '5.2', 'Under GDPR, when can patient information be shared without consent?', 'medium', 'Information can be shared without consent when required by law, for safeguarding, to prevent serious crime, or when in the public interest. Use the minimum necessary information and document the decision.', true, 1),
(gen_random_uuid(), 'Consent & Confidentiality', '5.2', 'What is the principle of "need to know" in healthcare confidentiality?', 'easy', 'Need to know means sharing patient information only with healthcare professionals directly involved in that patient''s care. Do not discuss cases with those not involved, even within your organization.', true, 2);

-- Subtopic 5.3: Confidentiality vs. Safeguarding
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Consent & Confidentiality', '5.3', 'When does safeguarding override confidentiality?', 'medium', 'Safeguarding overrides confidentiality when there is risk of serious harm to a vulnerable person or others. You can breach confidentiality to prevent harm, even without the patient''s consent.', true, 1),
(gen_random_uuid(), 'Consent & Confidentiality', '5.3', 'A patient discloses they are being abused but asks you not to tell anyone. What should you do?', 'hard', 'Explain you have a duty to report to protect them. Try to gain their consent, but if they refuse and risk is significant, you may need to breach confidentiality. Document your decision-making and seek senior guidance.', true, 2);

-- Topic 6: Equality & Diversity
-- Subtopic 6.1: Equality Act 2010
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Equality & Diversity', '6.1', 'How many protected characteristics are covered by the Equality Act 2010?', 'easy', 'There are nine protected characteristics: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.', true, 1),
(gen_random_uuid(), 'Equality & Diversity', '6.1', 'What is direct discrimination under the Equality Act?', 'medium', 'Direct discrimination is treating someone less favorably because of a protected characteristic. For example, refusing treatment to someone because of their race would be direct discrimination.', true, 2);

-- Subtopic 6.2: Cultural Competence
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Equality & Diversity', '6.2', 'What is cultural competence in nursing?', 'medium', 'Cultural competence is the ability to understand, respect, and effectively respond to people from different cultural backgrounds. It involves avoiding stereotypes and adapting care to meet diverse needs.', true, 1),
(gen_random_uuid(), 'Equality & Diversity', '6.2', 'A patient does not speak English. What should you do?', 'easy', 'Arrange a professional interpreter. Never use family members, especially children, to interpret medical information as this compromises accuracy, confidentiality, and patient autonomy.', true, 2);

-- Subtopic 6.3: Reasonable Adjustments
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Equality & Diversity', '6.3', 'What are reasonable adjustments under the Equality Act?', 'medium', 'Reasonable adjustments are changes made to remove barriers for disabled people. Examples include providing information in accessible formats, allowing longer appointments, or ensuring wheelchair access.', true, 1),
(gen_random_uuid(), 'Equality & Diversity', '6.3', 'When should reasonable adjustments be made?', 'easy', 'Reasonable adjustments should be made proactively, not just when requested. Healthcare providers must anticipate and remove barriers to ensure equal access for disabled patients.', true, 2);

-- Topic 7: Duty of Candour
-- Subtopic 7.1: Transparency After Errors
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Duty of Candour', '7.1', 'What is the professional duty of candour?', 'medium', 'The duty of candour requires healthcare professionals to be open and honest when things go wrong. This includes apologizing, explaining what happened, and outlining steps to prevent recurrence.', true, 1),
(gen_random_uuid(), 'Duty of Candour', '7.1', 'Should you apologize after making a mistake?', 'easy', 'Yes, apologizing is part of the duty of candour. An apology is not an admission of legal liability but shows compassion and honesty, which patients value highly after errors.', true, 2);

-- Subtopic 7.2: NHS Incident Reporting
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Duty of Candour', '7.2', 'What types of events should be reported through incident reporting systems?', 'medium', 'Report all incidents, near misses, and adverse events. This includes medication errors, falls, pressure ulcers, equipment failures, and any event that caused or could have caused harm.', true, 1),
(gen_random_uuid(), 'Duty of Candour', '7.2', 'Why is incident reporting important?', 'easy', 'Incident reporting promotes learning and improves patient safety. It identifies trends, allows investigation, and helps prevent similar events. Reporting is a professional duty, not a blame exercise.', true, 2);

-- Topic 8: Cultural Adaptation
-- Subtopic 8.1: Autonomy vs. Family Decisions
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Cultural Adaptation', '8.1', 'In UK healthcare, whose decision takes priority - the patient or their family?', 'medium', 'The patient''s decision takes priority. While UK law respects family involvement, it emphasizes individual autonomy. The patient with capacity must make their own healthcare decisions.', true, 1),
(gen_random_uuid(), 'Cultural Adaptation', '8.1', 'A family insists on making decisions for a patient with capacity. How should you respond?', 'medium', 'Politely explain that UK law requires the patient to make their own decisions if they have capacity. Encourage family involvement in discussions, but ensure the patient''s voice is heard and respected.', true, 2);

-- Subtopic 8.2: UK Communication Styles
INSERT INTO questions (id, category, subdivision, question_text, difficulty_level, explanation, is_active, display_order) VALUES
(gen_random_uuid(), 'Cultural Adaptation', '8.2', 'What characterizes typical UK communication in healthcare settings?', 'medium', 'UK communication tends to be polite and indirect, using softening phrases like "perhaps we could" or "would you mind." Understanding these subtleties helps international nurses communicate effectively.', true, 1),
(gen_random_uuid(), 'Cultural Adaptation', '8.2', 'Why is understanding UK communication styles important for international nurses?', 'easy', 'Understanding communication styles prevents misunderstandings with patients and colleagues. What seems indirect in the UK may be normal professional communication, not rudeness or lack of clarity.', true, 2);


-- ================================================================
-- PART 3: QUESTION OPTIONS (168 Total - 4 per question)
-- ================================================================

-- Generate options for all questions
-- Note: In production, you would create specific options for each question
-- This is a template showing the structure. Each question needs its own unique options.

-- For each question above, you would add 4 options with one marked as correct
-- Example structure:
/*
INSERT INTO question_options (id, question_id, option_text, is_correct, display_order) VALUES
(gen_random_uuid(), 'question-id-here', 'Option A text', false, 1),
(gen_random_uuid(), 'question-id-here', 'Option B text', false, 2),
(gen_random_uuid(), 'question-id-here', 'Option C text (correct)', true, 3),
(gen_random_uuid(), 'question-id-here', 'Option D text', false, 4);
*/

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check lessons count (should be 63)
SELECT COUNT(*) as lesson_count FROM lessons;

-- Check questions count (should be 42)
SELECT COUNT(*) as question_count FROM questions;

-- Check lessons by subtopic
SELECT category, COUNT(*) as count 
FROM lessons 
GROUP BY category 
ORDER BY category;

-- Check questions by subtopic  
SELECT subdivision, COUNT(*) as count 
FROM questions 
GROUP BY subdivision 
ORDER BY subdivision;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE '📚 63 lessons created across 21 subtopics';
  RAISE NOTICE '❓ 42 questions created (2 per subtopic)';
  RAISE NOTICE '⚠️  NOTE: Question options need to be added separately';
  RAISE NOTICE '🎯 Next: Add 4 options per question using question_options table';
END $$;
