-- Migration to import Mock Exam Questions
-- Auto-generated from markdown

-- Add exam_part column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mock_exam_questions' AND column_name = 'exam_part') THEN
        ALTER TABLE mock_exam_questions ADD COLUMN exam_part VARCHAR(20) DEFAULT 'part_b';
    END IF;
END $$;


INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('12d69562-7be4-44c9-a7e8-0c2117855358', 'part_a', 'A patient is prescribed 1 g of paracetamol. Tablets available are 500 mg. How many tablets should be given?', 'multiple_choice', 'medium', 1, '1 g = 1000 mg. 1000 ÷ 500 = 2 tablets.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('dfd13e3d-5723-4a5d-b90f-09d341a1d73b', '12d69562-7be4-44c9-a7e8-0c2117855358', '1', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d356bdbc-2670-40e4-a571-4aa3af7a621c', '12d69562-7be4-44c9-a7e8-0c2117855358', '2', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('21d810ad-f9c5-4626-99b9-5701ef551d93', '12d69562-7be4-44c9-a7e8-0c2117855358', '3', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('45a6d022-470c-4905-8df8-6397d10b4ac3', '12d69562-7be4-44c9-a7e8-0c2117855358', '4', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e096ca04-2e3e-49d4-b39d-15c2cee082c9', 'part_a', 'Convert 0.25 g to milligrams (mg).', 'multiple_choice', 'medium', 1, '0.25 g = 250 mg.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('824a832d-cadf-4c01-8d84-2b1e3e40e344', 'e096ca04-2e3e-49d4-b39d-15c2cee082c9', '25 mg', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9cbf729c-24bd-4a6c-9961-000372484453', 'e096ca04-2e3e-49d4-b39d-15c2cee082c9', '250 mg', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0f0d09ee-4f56-4549-b01e-1b750aa479a6', 'e096ca04-2e3e-49d4-b39d-15c2cee082c9', '2500 mg', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('62ee96a6-6aae-46f8-8c76-fbd62ab3fe98', 'e096ca04-2e3e-49d4-b39d-15c2cee082c9', '25,000 mg', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('b13f0057-da53-4631-ab99-a5562a05a653', 'part_a', '1000 mL of IV fluid is prescribed over 8 hours. What is the flow rate in mL per hour?', 'multiple_choice', 'medium', 1, '1000 ÷ 8 = 125 mL/hour.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7a96a7ca-8d6a-488d-bd0f-fc74a562f3e3', 'b13f0057-da53-4631-ab99-a5562a05a653', '100', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1fb0f27d-7017-47bf-b270-25112c1dd808', 'b13f0057-da53-4631-ab99-a5562a05a653', '120', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('464522f7-3518-480d-9a5b-34db3aab05c3', 'b13f0057-da53-4631-ab99-a5562a05a653', '125', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('35bf5772-564d-42bf-b995-2a04d4d2445d', 'b13f0057-da53-4631-ab99-a5562a05a653', '150', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('5c695968-982c-4c6a-9223-1f9dd1f7c162', 'part_a', 'A patient drinks 1200 mL and receives 800 mL IV fluids. Total urine output is 1700 mL. What is the fluid balance?', 'multiple_choice', 'medium', 1, 'Intake = 2000 mL. 2000 – 1700 = +300 mL.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7fdba2bb-009a-42b8-a5e1-01a2de266e88', '5c695968-982c-4c6a-9223-1f9dd1f7c162', '–700 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6093e9b9-626b-4e44-b6c1-55de876642a7', '5c695968-982c-4c6a-9223-1f9dd1f7c162', '–300 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0387cb89-2715-447a-86e9-e2e3f005cdbf', '5c695968-982c-4c6a-9223-1f9dd1f7c162', '+300 mL', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('df0ab9c0-999e-4b42-bd99-48fa4bfdde03', '5c695968-982c-4c6a-9223-1f9dd1f7c162', '+700 mL', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('6eca0986-9b7c-40f3-9bb8-262b8a2f1458', 'part_a', 'Convert 500 micrograms (mcg) to milligrams (mg).', 'multiple_choice', 'medium', 1, '500 mcg ÷ 1000 = 0.5 mg.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('82574b5e-1721-4db8-bcc6-aa8139fed0c5', '6eca0986-9b7c-40f3-9bb8-262b8a2f1458', '0.05 mg', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e53d1f70-a3e0-422b-84a5-cd7b08757690', '6eca0986-9b7c-40f3-9bb8-262b8a2f1458', '0.5 mg', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('874d50b6-ee1f-4984-9f01-e26542d89bcd', '6eca0986-9b7c-40f3-9bb8-262b8a2f1458', '5 mg', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d437ea25-40a0-49c0-b590-c3578c6312c0', '6eca0986-9b7c-40f3-9bb8-262b8a2f1458', '50 mg', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('6780ffbc-a4b7-4674-b0b8-54da995f7ce1', 'part_a', 'A dose of 150 mg is prescribed. Tablets available are 75 mg. How many tablets are required?', 'multiple_choice', 'medium', 1, '150 ÷ 75 = 2 tablets.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('964edc83-e74e-47e2-9bb6-83cfb98552ca', '6780ffbc-a4b7-4674-b0b8-54da995f7ce1', '1', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a6299e57-cc84-4820-9e45-fc9a225a0268', '6780ffbc-a4b7-4674-b0b8-54da995f7ce1', '2', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('44eade0d-b5d2-420c-a19d-ba5de44eb92b', '6780ffbc-a4b7-4674-b0b8-54da995f7ce1', '3', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4687e21f-1921-433c-8e1d-9af85a1d8410', '6780ffbc-a4b7-4674-b0b8-54da995f7ce1', '4', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('059368d2-3517-451b-a8bd-acbec2732a50', 'part_a', '500 mL of IV fluid is given over 5 hours. What is the flow rate?', 'multiple_choice', 'medium', 1, '500 ÷ 5 = 100 mL/hour.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2504b720-2005-4579-947b-4bb6195c34e2', '059368d2-3517-451b-a8bd-acbec2732a50', '50', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2ab49708-82c9-4eb1-b80d-ff099fba4b3f', '059368d2-3517-451b-a8bd-acbec2732a50', '75', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3588c3db-06d4-42f6-816b-1e109e8e468b', '059368d2-3517-451b-a8bd-acbec2732a50', '100', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ece5222c-a054-4a7b-bc8f-48c9bf358c37', '059368d2-3517-451b-a8bd-acbec2732a50', '125', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('775c383e-3c08-442c-a2b1-007174518069', 'part_a', 'Convert 1.5 L to millilitres (mL).', 'multiple_choice', 'medium', 1, '1.5 L = 1500 mL.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f11c4144-cd56-4539-8b88-d73578ddc829', '775c383e-3c08-442c-a2b1-007174518069', '150', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4ae315fb-8fdf-496e-bf3e-00fc66b72620', '775c383e-3c08-442c-a2b1-007174518069', '500', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d974316d-4345-4631-973b-5dcebbb56e85', '775c383e-3c08-442c-a2b1-007174518069', '1500', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8c9d7fed-cc5b-49f3-b130-66f6b9c7a166', '775c383e-3c08-442c-a2b1-007174518069', '15,000', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e549e75c-ffdd-4c30-8139-669fdd63c9ba', 'part_a', 'A patient’s intake is 1800 mL. Output is 2100 mL. What is the fluid balance?', 'multiple_choice', 'medium', 1, '1800 – 2100 = –300 mL.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b3531ec4-65f5-40a8-9808-2417cf863c63', 'e549e75c-ffdd-4c30-8139-669fdd63c9ba', '–500 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e7d69d6e-8ac8-41d4-a941-6ff9272cbddc', 'e549e75c-ffdd-4c30-8139-669fdd63c9ba', '–300 mL', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ac361da5-2391-4f35-9efc-abe6a8448698', 'e549e75c-ffdd-4c30-8139-669fdd63c9ba', '+300 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9668255b-6d7c-4b67-a612-b18efc414f60', 'e549e75c-ffdd-4c30-8139-669fdd63c9ba', '+500 mL', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('d0fbd673-7731-4aa2-bf63-bcb73b80ffa2', 'part_a', 'A patient needs 30 mg of a drug. Tablets available are 60 mg. How many tablets should be given?', 'multiple_choice', 'medium', 1, '30 mg is half of 60 mg.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6ee0e9e8-9641-4e75-9785-70f6d2f8cdd0', 'd0fbd673-7731-4aa2-bf63-bcb73b80ffa2', '0.25', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8f773ef0-6b0b-4775-bd3d-251fc729f352', 'd0fbd673-7731-4aa2-bf63-bcb73b80ffa2', '0.5', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5fd3e59e-e215-4291-8547-bd9a0d7f052d', 'd0fbd673-7731-4aa2-bf63-bcb73b80ffa2', '1', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('120d7131-699b-4b45-ba6f-21c0369bebad', 'd0fbd673-7731-4aa2-bf63-bcb73b80ffa2', '2', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('f1a36ea7-3bc0-47ba-a092-39dc18f67bec', 'part_a', 'Convert 0.1 L to millilitres (mL).', 'multiple_choice', 'medium', 1, '0.1 L = 100 mL.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('32c594f2-a073-4f9e-828d-4ddc8611c067', 'f1a36ea7-3bc0-47ba-a092-39dc18f67bec', '10', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4d2cc380-95da-4e4b-ad52-25975fd442f2', 'f1a36ea7-3bc0-47ba-a092-39dc18f67bec', '100', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('85904f1e-a5a2-4d16-9ced-d4aa15003d99', 'f1a36ea7-3bc0-47ba-a092-39dc18f67bec', '1000', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3b43a7b7-f81f-429a-9ae8-03cc521505b4', 'f1a36ea7-3bc0-47ba-a092-39dc18f67bec', '10,000', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('292e9b80-ad65-402b-b3ca-fff6eedef94d', 'part_a', '1200 mL of IV fluid is prescribed over 16 hours. What is the flow rate?', 'multiple_choice', 'medium', 1, '1200 ÷ 16 = 75 mL/hour.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a63a091d-033e-4bd2-80d3-4dbe57ea5d96', '292e9b80-ad65-402b-b3ca-fff6eedef94d', '65', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b92b4460-f24f-4df6-853f-e64b6ea88894', '292e9b80-ad65-402b-b3ca-fff6eedef94d', '70', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fb669e18-3d68-4f22-bebb-500a736e0038', '292e9b80-ad65-402b-b3ca-fff6eedef94d', '75', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2f07ea78-e314-468d-a38f-99e6a92e9102', '292e9b80-ad65-402b-b3ca-fff6eedef94d', '80', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('20dcdd6b-a14f-42ff-a528-df38933e2998', 'part_a', 'A patient drinks 900 mL and receives 600 mL IV fluids. Total output is 1300 mL. What is the fluid balance?', 'multiple_choice', 'medium', 1, 'Intake = 1500 mL. 1500 – 1300 = +200 mL.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('29bcb1b2-836a-4b2e-8601-86e27aff909d', '20dcdd6b-a14f-42ff-a528-df38933e2998', '–200 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('74b347f9-176f-4714-8a92-586df3f3f735', '20dcdd6b-a14f-42ff-a528-df38933e2998', '0 mL', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9c37d36d-d168-4a6a-bbb6-75b81d8303f5', '20dcdd6b-a14f-42ff-a528-df38933e2998', '+200 mL', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a7e0cdf2-7942-437b-8524-5d6ec60dc5f0', '20dcdd6b-a14f-42ff-a528-df38933e2998', '+400 mL', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('5dd0c92a-b194-487f-b66e-928ea631d1e1', 'part_a', 'Convert 200 mg to grams (g).', 'multiple_choice', 'medium', 1, '200 ÷ 1000 = 0.2 g.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c91b1ba0-e21b-4b29-aa87-35e1475da3d1', '5dd0c92a-b194-487f-b66e-928ea631d1e1', '0.02', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('56320819-4ee2-4cdc-8261-6e3f980ece66', '5dd0c92a-b194-487f-b66e-928ea631d1e1', '0.2', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5605a04d-f54c-4544-9efc-0adb3abf6447', '5dd0c92a-b194-487f-b66e-928ea631d1e1', '2', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ca3bc13d-ad99-4bbf-81cd-3e4786c3c8b6', '5dd0c92a-b194-487f-b66e-928ea631d1e1', '20', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('9f4a2f82-4d8f-4c5a-98a5-dc361edcc415', 'part_a', '900 mL of IV fluid is infused over 9 hours. What is the flow rate?', 'multiple_choice', 'medium', 1, '900 ÷ 9 = 100 mL/hour.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9913c93e-0467-4a5c-99a2-4799b138c270', '9f4a2f82-4d8f-4c5a-98a5-dc361edcc415', '90', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('659e8c13-e7dc-46b3-91b1-b61eaf5b5c82', '9f4a2f82-4d8f-4c5a-98a5-dc361edcc415', '95', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('12876032-316a-4b3e-baed-0a5823cc5065', '9f4a2f82-4d8f-4c5a-98a5-dc361edcc415', '100', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2cd0665f-3579-441b-b4ca-9fc320079984', '9f4a2f82-4d8f-4c5a-98a5-dc361edcc415', '110', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('3b0975ec-10ed-4905-84b7-724a19d2421c', 'part_b', 'A patient with diabetes becomes confused and sweaty. Blood glucose is 2.6 mmol/L. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'This is hypoglycaemia and needs immediate glucose.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8580cbcb-7cde-4473-9adf-a779d50eece9', '3b0975ec-10ed-4905-84b7-724a19d2421c', 'Give insulin', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4cb985c0-02fd-4c19-afb7-d5ceea2ecde8', '3b0975ec-10ed-4905-84b7-724a19d2421c', 'Give fast-acting glucose', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5a3adcaf-8428-4939-b7d1-d602d2280f8c', '3b0975ec-10ed-4905-84b7-724a19d2421c', 'Document and observe', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4cc46193-d2dd-4c7f-abf0-4c83fa3b991a', '3b0975ec-10ed-4905-84b7-724a19d2421c', 'Call the family', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('6bbd3880-baed-4c1f-a93c-1dcfb7b8b188', 'part_b', 'A patient receiving IV antibiotics develops facial swelling and wheezing. What is the priority action?', 'multiple_choice', 'medium', 1, 'These are signs of anaphylaxis.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0bdef665-f9df-48bc-a8ac-09ec0a5a5015', '6bbd3880-baed-4c1f-a93c-1dcfb7b8b188', 'Slow the infusion', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4e4fe273-b470-45d2-ac02-7d83eea82de0', '6bbd3880-baed-4c1f-a93c-1dcfb7b8b188', 'Reassure the patient', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('89736b58-8a58-45ef-85ba-16cc802c30f6', '6bbd3880-baed-4c1f-a93c-1dcfb7b8b188', 'Stop the infusion and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7c6c5206-0a98-4d3b-8e91-324fbb203731', '6bbd3880-baed-4c1f-a93c-1dcfb7b8b188', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('cbdf058e-7689-43a3-860f-cc5b28e11ea0', 'part_b', 'A patient with suspected sepsis has a blood pressure of 88/52 mmHg. What should the nurse do?', 'multiple_choice', 'medium', 1, 'This indicates possible septic shock.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('286a9b29-b42d-4037-92c6-c255925e44c6', 'cbdf058e-7689-43a3-860f-cc5b28e11ea0', 'Encourage oral fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f07d923c-3182-43e3-9fc5-8632fae99b0e', 'cbdf058e-7689-43a3-860f-cc5b28e11ea0', 'Repeat observations later', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('42b0b4cf-eb42-4ed7-9701-dcf5c385b628', 'cbdf058e-7689-43a3-860f-cc5b28e11ea0', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c9992c94-20ae-4ec6-a01a-0764cf744f30', 'cbdf058e-7689-43a3-860f-cc5b28e11ea0', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e8221e55-80b5-4849-9ac4-16d050f165ad', 'part_b', 'A patient suddenly develops slurred speech and facial droop. What is the most appropriate action?', 'multiple_choice', 'medium', 1, 'These are signs of acute stroke.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e3a59251-3f27-473f-a5a1-52ae2ff1fa6e', 'e8221e55-80b5-4849-9ac4-16d050f165ad', 'Reassure and observe', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fcd1fa66-1911-4d50-ac6d-356dc687678e', 'e8221e55-80b5-4849-9ac4-16d050f165ad', 'Document and wait', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8184612b-1536-4273-bd22-4be70124df71', 'e8221e55-80b5-4849-9ac4-16d050f165ad', 'Activate stroke pathway', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c8c2b97b-c925-49bc-9b40-6398bf5ad7ab', 'e8221e55-80b5-4849-9ac4-16d050f165ad', 'Check blood pressure later', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('a93aebc5-df67-4fa7-97f6-2ee11afa8e5d', 'part_b', 'A patient refuses medication and clearly understands the risks. What should the nurse do?', 'multiple_choice', 'medium', 1, 'A patient with capacity can refuse treatment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9aec44c2-990d-4952-bb62-29f9d0273af0', 'a93aebc5-df67-4fa7-97f6-2ee11afa8e5d', 'Give the medication anyway', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a3b0d1b6-ee2f-40a3-944c-524af81da3be', 'a93aebc5-df67-4fa7-97f6-2ee11afa8e5d', 'Inform the family', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9c0a2d62-7137-4116-a6fd-cfcae012c5d2', 'a93aebc5-df67-4fa7-97f6-2ee11afa8e5d', 'Respect the refusal and document', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('95b1c132-caf0-4e74-9218-a9da83fa0bfe', 'a93aebc5-df67-4fa7-97f6-2ee11afa8e5d', 'Ask another nurse', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e99d166b-4c93-42e4-887f-f701ff665060', 'part_b', 'A patient with COPD becomes drowsy on oxygen therapy. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Assessment and escalation are required.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1248756c-662d-4f3a-824f-0743faf84e6c', 'e99d166b-4c93-42e4-887f-f701ff665060', 'Increase oxygen', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('93791c91-0632-4881-8450-408c0d0d6f29', 'e99d166b-4c93-42e4-887f-f701ff665060', 'Stop oxygen immediately', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('53e3f01b-dc7b-4521-bc13-5893ac4c17d6', 'e99d166b-4c93-42e4-887f-f701ff665060', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7bee1ef2-c1da-42a5-afa9-d304c2144c1b', 'e99d166b-4c93-42e4-887f-f701ff665060', 'Ask patient to breathe deeply', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('ce929598-d674-4ea6-975c-87e27669c8e7', 'part_b', 'A patient collapses on the ward. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Collapse is a medical emergency.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c79c8505-f4f5-4d8a-bb8c-81754d72f143', 'ce929598-d674-4ea6-975c-87e27669c8e7', 'Call the family', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c975d9ea-fd1a-4ab0-8338-4bf4fb1b5179', 'ce929598-d674-4ea6-975c-87e27669c8e7', 'Check notes', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a72db837-9f94-4c2f-8092-067a903e8f74', 'ce929598-d674-4ea6-975c-87e27669c8e7', 'Activate emergency response', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('20069d7b-a42c-44f0-bc9a-70603e16d1f7', 'ce929598-d674-4ea6-975c-87e27669c8e7', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('3e531543-242f-480d-9d72-62280c991f24', 'part_b', 'A patient with MRSA needs nursing care. What is the most appropriate action?', 'multiple_choice', 'medium', 1, 'Isolation reduces transmission.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('077287ec-1437-4184-9d83-ed39a5c1f7f0', '3e531543-242f-480d-9d72-62280c991f24', 'Nurse in a bay', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('29bee34e-3d45-43d9-87fb-7dd58a9b818a', '3e531543-242f-480d-9d72-62280c991f24', 'Use standard precautions only', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('29a0725e-5249-43fc-b68c-f0ad09497c08', '3e531543-242f-480d-9d72-62280c991f24', 'Isolate if possible', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('63580476-c6ff-4e28-bfb7-89843689391f', '3e531543-242f-480d-9d72-62280c991f24', 'Delay care', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('6930110a-f020-48bc-af69-e6dcd5b8e0ae', 'part_b', 'A wound becomes red, hot, and painful. What should the nurse do next?', 'multiple_choice', 'medium', 1, 'These are signs of infection.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('62f325c2-3094-4b61-b18c-64749b5489d1', '6930110a-f020-48bc-af69-e6dcd5b8e0ae', 'Continue current dressing', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f0ebf27e-e1a4-4760-ba42-d0b61209f17f', '6930110a-f020-48bc-af69-e6dcd5b8e0ae', 'Clean and ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('553d6036-e797-4a60-be99-29363ca1e58d', '6930110a-f020-48bc-af69-e6dcd5b8e0ae', 'Escalate for review', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f452b7a0-aae6-4234-897e-098a48806ddb', '6930110a-f020-48bc-af69-e6dcd5b8e0ae', 'Leave uncovered', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('19fb8a70-c5b1-4e28-970a-9409db877a5e', 'part_b', 'A patient at end of life has a valid DNACPR and stops breathing. What should the nurse do?', 'multiple_choice', 'medium', 1, 'DNACPR decisions must be respected.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('06c924d4-33d2-4f03-849b-44dbb512b74b', '19fb8a70-c5b1-4e28-970a-9409db877a5e', 'Start CPR', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7b6d5549-c8e7-4963-8bad-cd4f37405de6', '19fb8a70-c5b1-4e28-970a-9409db877a5e', 'Call the family', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('cb28cbeb-b550-4675-a20b-076514abf1dd', '19fb8a70-c5b1-4e28-970a-9409db877a5e', 'Follow DNACPR and provide comfort care', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5d57a069-f700-4f52-a5cc-1f127a4122a9', '19fb8a70-c5b1-4e28-970a-9409db877a5e', 'Ignore the patient', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('743a3c44-5b50-4847-a5ed-9904ad5ead35', 'part_b', 'A patient on warfarin reports blood in urine. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Bleeding is a serious side effect.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('66e8c094-56be-49a1-81fe-314c54b71e43', '743a3c44-5b50-4847-a5ed-9904ad5ead35', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c1a50914-c85f-4e00-a236-0108c9c939b0', '743a3c44-5b50-4847-a5ed-9904ad5ead35', 'Stop medication independently', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3cf38bec-ce33-4f82-b095-5506a0e8f657', '743a3c44-5b50-4847-a5ed-9904ad5ead35', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('41e82fda-e488-47d6-981d-ea9cc73948d4', '743a3c44-5b50-4847-a5ed-9904ad5ead35', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('79b408f9-6b22-4559-a60b-31748b2ef284', 'part_b', 'A patient’s NEWS2 score rises from 3 to 8. What is the nurse’s action?', 'multiple_choice', 'medium', 1, 'Rising NEWS2 requires escalation.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b7fc2a7d-055b-49e8-b458-a0f4ce733f2e', '79b408f9-6b22-4559-a60b-31748b2ef284', 'Repeat observations later', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('71067c84-2aa1-4838-9e15-41c0c1eb5c99', '79b408f9-6b22-4559-a60b-31748b2ef284', 'Ignore if patient looks well', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('baacb041-7cc1-4846-8712-9afee2c88f6f', '79b408f9-6b22-4559-a60b-31748b2ef284', 'Escalate as per policy', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c900f781-323c-48e9-bb19-f1a92a2c2a85', '79b408f9-6b22-4559-a60b-31748b2ef284', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('75ee2aae-b95e-418a-a619-f91813a22b28', 'part_b', 'A patient has diarrhoea and vomiting and is suspected of norovirus. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Isolation prevents spread.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6b4d28b9-4947-4798-9a05-e49f28acc6c7', '75ee2aae-b95e-418a-a619-f91813a22b28', 'Start antibiotics', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('60fae8be-fd68-4544-a603-238a49acca21', '75ee2aae-b95e-418a-a619-f91813a22b28', 'Isolate and use PPE', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('09b42379-6203-4606-b2d7-6dcd2c425b19', '75ee2aae-b95e-418a-a619-f91813a22b28', 'Ask relatives to help', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0884b492-f52d-4422-b6d7-2818de0e2ced', '75ee2aae-b95e-418a-a619-f91813a22b28', 'Place in a bay', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('cb2a4a60-5d31-47df-b51d-d7b2b486126a', 'part_b', 'A patient with diabetes has a foot ulcer showing discharge. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Diabetic foot ulcers need urgent review.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a1bf3da4-a828-4830-b83c-c0ef7ed6165b', 'cb2a4a60-5d31-47df-b51d-d7b2b486126a', 'Clean and dress only', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f86dcfc0-a497-4a70-9860-d9648caa534f', 'cb2a4a60-5d31-47df-b51d-d7b2b486126a', 'Encourage walking', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('867f0fa6-aa67-484a-97c3-01f1fee6d0d3', 'cb2a4a60-5d31-47df-b51d-d7b2b486126a', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f991389b-5ee2-4b5a-bc18-d57b9f0fc44b', 'cb2a4a60-5d31-47df-b51d-d7b2b486126a', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('8291e927-b44c-4ca7-aac4-970f9edd3df8', 'part_b', 'A patient is confused after receiving medication. What should the nurse do?', 'multiple_choice', 'medium', 1, 'New confusion requires assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('244fcb3e-fdac-4463-8b33-a2634a22cc18', '8291e927-b44c-4ca7-aac4-970f9edd3df8', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1225cc62-5730-4e3d-9699-beff2b573754', '8291e927-b44c-4ca7-aac4-970f9edd3df8', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('de9be7fb-dd31-4e80-bc63-cbb0f05a949a', '8291e927-b44c-4ca7-aac4-970f9edd3df8', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6664e890-4df9-4659-81f9-2299fc3a2d04', '8291e927-b44c-4ca7-aac4-970f9edd3df8', 'Sedate', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('b66d85d4-101a-4cb1-acb1-a3bd36eaa0e7', 'part_b', 'A patient with asthma is using accessory muscles to breathe. What is the priority action?', 'multiple_choice', 'medium', 1, 'This indicates severe respiratory distress.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('87355ff8-b17d-4735-8e0b-00f03679ee70', 'b66d85d4-101a-4cb1-acb1-a3bd36eaa0e7', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('187f21db-71b5-4a1c-8327-f75e36b9c06a', 'b66d85d4-101a-4cb1-acb1-a3bd36eaa0e7', 'Encourage slow breathing', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('98ca7562-e3e3-4198-8d8c-800f87ec1ec8', 'b66d85d4-101a-4cb1-acb1-a3bd36eaa0e7', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d8da465c-e13a-428a-bf9f-84bcfb8830fb', 'b66d85d4-101a-4cb1-acb1-a3bd36eaa0e7', 'Reduce oxygen', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('67b989a0-6e43-4994-81e6-3e98426c9db5', 'part_b', 'A patient refuses wound dressing and appears confused. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Capacity must be assessed.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('09ef5cb7-072a-4ccb-9fd8-3f95f4123e68', '67b989a0-6e43-4994-81e6-3e98426c9db5', 'Respect refusal', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('11f7077c-bea9-44fa-b27b-2206d66c433c', '67b989a0-6e43-4994-81e6-3e98426c9db5', 'Ask family to decide', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e0a325c0-5286-47f8-a35a-084cade6af28', '67b989a0-6e43-4994-81e6-3e98426c9db5', 'Assess capacity', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8bb09fe3-7d75-4226-9807-cbf45e42735e', '67b989a0-6e43-4994-81e6-3e98426c9db5', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('c3e1354c-e093-4735-aa18-23942fbed96e', 'part_b', 'A patient’s IV pump alarms repeatedly. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Equipment issues must be checked.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c830d3b3-e1e9-41e0-b619-ecbb75522db8', 'c3e1354c-e093-4735-aa18-23942fbed96e', 'Silence the alarm', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('530cd633-5862-48c2-82c1-c58c2784dd35', 'c3e1354c-e093-4735-aa18-23942fbed96e', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5f668fea-3784-4d24-97f0-4ae76a106157', 'c3e1354c-e093-4735-aa18-23942fbed96e', 'Check infusion and equipment', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('34718f8e-22d5-4136-b581-355d996fce6e', 'c3e1354c-e093-4735-aa18-23942fbed96e', 'Stop treatment', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('be941b64-fc83-4c96-95c7-7f0d26cf670c', 'part_b', 'A palliative patient becomes very agitated. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Agitation may indicate unmet needs.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('42f6c6d8-7a47-4c9a-9edc-4ab4ffa33cb7', 'be941b64-fc83-4c96-95c7-7f0d26cf670c', 'Leave alone', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('740632ae-6b8e-4090-962d-51a95685fe64', 'be941b64-fc83-4c96-95c7-7f0d26cf670c', 'Restrain', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fdb4211c-63a8-44a2-aab3-868634c32bf7', 'be941b64-fc83-4c96-95c7-7f0d26cf670c', 'Reassess comfort and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9b3c5e3d-f466-46cf-bdb7-5220bded3397', 'be941b64-fc83-4c96-95c7-7f0d26cf670c', 'Ignore', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('09006115-9cbd-480b-aca1-6cfd120185a4', 'part_b', 'A patient has sudden calf pain and swelling. What should the nurse do?', 'multiple_choice', 'medium', 1, 'This may indicate DVT.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1fc05e5c-7182-4f00-b4ae-18e96b51ff1c', '09006115-9cbd-480b-aca1-6cfd120185a4', 'Encourage walking', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a954acb0-d2a6-4fed-929e-88c1f9f77983', '09006115-9cbd-480b-aca1-6cfd120185a4', 'Apply heat', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('34d5ff12-4145-447c-8d1d-96d570e15c27', '09006115-9cbd-480b-aca1-6cfd120185a4', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7fc4c99c-49c0-492f-834d-b3e07a278fe7', '09006115-9cbd-480b-aca1-6cfd120185a4', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('2bfb92e1-3c93-4850-952c-d2ba9d0b2b4e', 'part_b', 'A patient with pneumonia has an oxygen saturation of 88% on room air. What should the nurse do next?', 'multiple_choice', 'medium', 1, 'Low oxygen saturation requires escalation.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f4927019-2847-434e-9b85-0060351a2b0e', '2bfb92e1-3c93-4850-952c-d2ba9d0b2b4e', 'Document and continue observation', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c47ce487-1fd7-4dc6-a04d-e7930403f671', '2bfb92e1-3c93-4850-952c-d2ba9d0b2b4e', 'Encourage coughing exercises', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('84124a5c-a6e9-4dd4-8d36-1911a8d7234b', '2bfb92e1-3c93-4850-952c-d2ba9d0b2b4e', 'Escalate and initiate oxygen therapy', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6338fcb1-838f-41b5-b950-bca575c9857e', '2bfb92e1-3c93-4850-952c-d2ba9d0b2b4e', 'Ask the patient to sit upright only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('82fc1589-7011-4119-81d3-ff6a24d2a501', 'part_b', 'A patient receiving IV fluids develops swelling around the cannula site. What is the most appropriate action?', 'multiple_choice', 'medium', 1, 'This may indicate infiltration.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2e0ad6b4-2542-43eb-9140-956e876b8456', '82fc1589-7011-4119-81d3-ff6a24d2a501', 'Slow the infusion', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c7424035-0c9f-45a3-adc3-53ec705d49d6', '82fc1589-7011-4119-81d3-ff6a24d2a501', 'Ignore if patient is comfortable', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('eed36b4e-127e-4140-a476-f4bec4921d3a', '82fc1589-7011-4119-81d3-ff6a24d2a501', 'Stop the infusion and assess', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('aed9c811-76ee-4bf0-a556-77915f6b7e9f', '82fc1589-7011-4119-81d3-ff6a24d2a501', 'Document and continue', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('dea01fd6-c4df-437b-9882-b6fe636dc74d', 'part_b', 'A patient with heart failure reports sudden weight gain and ankle swelling. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Signs of fluid overload.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('11d407fd-32d6-4d51-a779-cf19c3e4ebc9', 'dea01fd6-c4df-437b-9882-b6fe636dc74d', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3de75ca0-e975-4556-9fcb-9b08f534da5e', 'dea01fd6-c4df-437b-9882-b6fe636dc74d', 'Encourage more fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('62dd4207-d283-42a2-abae-1a260d39ce93', 'dea01fd6-c4df-437b-9882-b6fe636dc74d', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('316e9589-c1ae-4e41-a21b-c8a226bdcd70', 'dea01fd6-c4df-437b-9882-b6fe636dc74d', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('cfb1d16d-c51b-4fec-809d-b759fcae4bc4', 'part_b', 'A patient has a temperature of 39°C and rigors. What is the priority action?', 'multiple_choice', 'medium', 1, 'Possible sepsis.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f64ae57a-1330-4090-9f33-9d496cb896b8', 'cfb1d16d-c51b-4fec-809d-b759fcae4bc4', 'Give blankets', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c43e8890-124c-4196-a23e-9878a64c3b40', 'cfb1d16d-c51b-4fec-809d-b759fcae4bc4', 'Encourage fluids only', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a3d84268-5e44-481f-9986-be38c6653082', 'cfb1d16d-c51b-4fec-809d-b759fcae4bc4', 'Escalate as possible sepsis', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('11fd5005-8d58-4b5d-983b-c0f830eac6e4', 'cfb1d16d-c51b-4fec-809d-b759fcae4bc4', 'Document and wait', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('0da3e0dc-dcca-4bd7-ae83-8917c6de5c55', 'part_b', 'A patient refuses blood tests and understands consequences. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Capacity allows refusal.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7dc24043-9465-4606-ab5a-a0350975e55b', '0da3e0dc-dcca-4bd7-ae83-8917c6de5c55', 'Proceed anyway', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b8eeb491-c6d6-4daa-a2f5-69b9a5cb67df', '0da3e0dc-dcca-4bd7-ae83-8917c6de5c55', 'Ask family to consent', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e4650f8d-958c-441b-914e-277358508798', '0da3e0dc-dcca-4bd7-ae83-8917c6de5c55', 'Respect refusal and document', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5783146f-a304-4d57-92ac-f65430f86740', '0da3e0dc-dcca-4bd7-ae83-8917c6de5c55', 'Retry later', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('8930a7d6-4055-47db-8eb2-d7af6250c1a5', 'part_b', 'A patient with reduced mobility is not repositioned regularly. What risk increases?', 'multiple_choice', 'medium', 1, 'Lack of repositioning increases pressure risk.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4efe6ad8-9f7a-4684-a8d4-82d63216d9f9', '8930a7d6-4055-47db-8eb2-d7af6250c1a5', 'Dehydration', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ea323889-350e-4c04-b1dd-b24a289ad09d', '8930a7d6-4055-47db-8eb2-d7af6250c1a5', 'Infection', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7f126e44-5f8b-4ede-8444-017ce257b88b', '8930a7d6-4055-47db-8eb2-d7af6250c1a5', 'Pressure injury', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('863f9622-f394-46a7-9833-fd7a2e5412d2', '8930a7d6-4055-47db-8eb2-d7af6250c1a5', 'Constipation', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('ba63c7b8-ec9e-4556-8cae-c9c984aa464c', 'part_b', 'A nurse notices a colleague preparing medication without checking identity. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Preventing harm is priority.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('08641966-4f52-49e8-ab8a-14ec2567a6b7', 'ba63c7b8-ec9e-4556-8cae-c9c984aa464c', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1e3763a8-df9d-41df-b4df-48cc3ef209ae', 'ba63c7b8-ec9e-4556-8cae-c9c984aa464c', 'Report later', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8ef0e5fe-51a7-4155-81b8-eaab724aeaf6', 'ba63c7b8-ec9e-4556-8cae-c9c984aa464c', 'Intervene immediately', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('82d67418-5d8b-4f9b-9d4e-8c1fb7dc9367', 'ba63c7b8-ec9e-4556-8cae-c9c984aa464c', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('d44b3454-bcaa-4755-a6f8-26d6104c1a43', 'part_b', 'A patient with chronic kidney disease has very low urine output. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Low output needs assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2b23da63-79e5-4305-a752-88e14835833e', 'd44b3454-bcaa-4755-a6f8-26d6104c1a43', 'Increase IV fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('368e329f-666a-48f6-aa79-1e02aacb6d87', 'd44b3454-bcaa-4755-a6f8-26d6104c1a43', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1e33ab5b-6dfc-4567-b5cc-cee5f3c5763c', 'd44b3454-bcaa-4755-a6f8-26d6104c1a43', 'Encourage oral fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0739316c-1256-4882-9c6c-1c0b42bec706', 'd44b3454-bcaa-4755-a6f8-26d6104c1a43', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('50c007ff-09a6-49a5-9c46-086720a5159a', 'part_b', 'A patient suddenly becomes confused and disorientated. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Acute confusion requires assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5082738f-6e90-48c3-8f21-4a5665b7c39e', '50c007ff-09a6-49a5-9c46-086720a5159a', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('25123bba-fa60-4b4b-abba-142d2b161375', '50c007ff-09a6-49a5-9c46-086720a5159a', 'Observe', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('07bcb71a-540f-48cc-988f-31a8981a8bdd', '50c007ff-09a6-49a5-9c46-086720a5159a', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('37f55ed3-06fd-4648-975b-dfd45c485b22', '50c007ff-09a6-49a5-9c46-086720a5159a', 'Ask family', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('6cbb42a0-e573-4f67-98ea-635c26c81750', 'part_b', 'A patient is prescribed antibiotics but has a documented allergy. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Allergies must be acted on.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('55d4a491-6688-4f2a-b836-df78b6e7a56b', '6cbb42a0-e573-4f67-98ea-635c26c81750', 'Reduce dose', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7f050ccc-39b3-4d04-bc52-8ba7cf11bfb4', '6cbb42a0-e573-4f67-98ea-635c26c81750', 'Give and observe', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6d6a109c-4850-4037-aac7-e1dbeca0c462', '6cbb42a0-e573-4f67-98ea-635c26c81750', 'Withhold and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0705f590-5d6a-4b83-b985-a5a07441b1b2', '6cbb42a0-e573-4f67-98ea-635c26c81750', 'Document only', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('8734e2f5-3659-475c-8781-38e56a0399cf', 'part_b', 'A patient complains of severe abdominal pain with rigid abdomen. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Signs of acute abdomen.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ca5d8827-eeaa-4034-bbba-84a3a2bbba1f', '8734e2f5-3659-475c-8781-38e56a0399cf', 'Give analgesia', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4306779d-6b81-45e2-bb3e-08961ef8eefd', '8734e2f5-3659-475c-8781-38e56a0399cf', 'Encourage fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a16a4878-e1e3-4dd3-aae3-7ca3c89d7500', '8734e2f5-3659-475c-8781-38e56a0399cf', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d866ba89-02af-4ad2-ae0d-87031f7989a1', '8734e2f5-3659-475c-8781-38e56a0399cf', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('d755041a-5c0b-4daf-b666-1580a7080a22', 'part_b', 'A patient with epilepsy has a seizure lasting more than 5 minutes. What is the priority action?', 'multiple_choice', 'medium', 1, 'Prolonged seizures are emergencies.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('03ec4e6b-8c26-4cfc-80d5-8767e5a17fb1', 'd755041a-5c0b-4daf-b666-1580a7080a22', 'Wait', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7bafa7bc-6cd9-441e-ac98-e2b84ef5e6b5', 'd755041a-5c0b-4daf-b666-1580a7080a22', 'Protect airway and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('93aaa93c-33fd-4ff2-9a59-f11e99aa64bb', 'd755041a-5c0b-4daf-b666-1580a7080a22', 'Leave patient', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('872c34e5-ef39-45b6-8392-b3956f32824a', 'd755041a-5c0b-4daf-b666-1580a7080a22', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('4aff255f-6f86-45c8-82c1-7bcd0af285aa', 'part_b', 'A patient with urinary catheter reports pain and cloudy urine. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Possible infection.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2986ee3f-0033-4d18-a01a-01a1d10064c4', '4aff255f-6f86-45c8-82c1-7bcd0af285aa', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('90889eb9-921c-44d9-aab6-4183055d0282', '4aff255f-6f86-45c8-82c1-7bcd0af285aa', 'Remove catheter', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c6ecdc71-fbfb-420b-91a0-af472d4b8afd', '4aff255f-6f86-45c8-82c1-7bcd0af285aa', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('cb7e986c-9fba-4aa5-836a-02379e017187', '4aff255f-6f86-45c8-82c1-7bcd0af285aa', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('d2899a05-6eed-446e-843b-33ead4ef5a68', 'part_b', 'A patient with suspected tuberculosis is admitted. What precaution is required?', 'multiple_choice', 'medium', 1, 'TB requires airborne precautions.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1ec02d3d-491f-44a0-986f-c775da7ec7d9', 'd2899a05-6eed-446e-843b-33ead4ef5a68', 'Standard only', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f4ab826f-7432-4e8a-aaec-5e9a31ca94c9', 'd2899a05-6eed-446e-843b-33ead4ef5a68', 'Contact', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('700a12eb-c00f-4dc2-b5d9-52fe4f3e06fc', 'd2899a05-6eed-446e-843b-33ead4ef5a68', 'Airborne and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('08cb69e7-d7f3-4b5b-bc4d-1af3a8000507', 'd2899a05-6eed-446e-843b-33ead4ef5a68', 'None', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('f9537532-5c62-4089-8d04-dfd271589cdd', 'part_b', 'A patient receiving opioids becomes very drowsy. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Risk of respiratory depression.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('bb02ed5c-5c83-455a-8534-e6cd6f187a8b', 'f9537532-5c62-4089-8d04-dfd271589cdd', 'Let sleep', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5ab45a8e-5be0-4081-b144-ca69c58ed4d8', 'f9537532-5c62-4089-8d04-dfd271589cdd', 'Give next dose', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fb41eff0-51bf-407f-abed-1439404c39e7', 'f9537532-5c62-4089-8d04-dfd271589cdd', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('e9feee6d-43ac-4d17-8ffb-327eca2bd1d4', 'f9537532-5c62-4089-8d04-dfd271589cdd', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('30cd97a3-0a4c-47c9-af35-ee897b85ed08', 'part_b', 'A patient at end of life asks to stop investigations. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Requires assessment and discussion.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('987c537e-3238-4c11-b73c-6752b2c40921', '30cd97a3-0a4c-47c9-af35-ee897b85ed08', 'Refuse', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f8ce7778-44ee-48bd-844f-015543c5432f', '30cd97a3-0a4c-47c9-af35-ee897b85ed08', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('996befe8-f97e-4cd4-873b-b3a9fa1d8608', '30cd97a3-0a4c-47c9-af35-ee897b85ed08', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('dfc67c5f-c57e-40a2-96de-f451bdfa38bf', '30cd97a3-0a4c-47c9-af35-ee897b85ed08', 'Ask family', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e71ea7a1-9e27-4846-9a6a-896f5793ebe2', 'part_b', 'A patient develops a pressure ulcer. What is the nurse’s responsibility?', 'multiple_choice', 'medium', 1, 'Requires review and escalation.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c29c32c5-c8c8-458c-b174-bde2a965ad92', 'e71ea7a1-9e27-4846-9a6a-896f5793ebe2', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('305ada02-f582-4c3f-a599-0ca1c276c427', 'e71ea7a1-9e27-4846-9a6a-896f5793ebe2', 'Blame patient', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9e7d35d6-60a8-40ec-a65e-592a35a68f6e', 'e71ea7a1-9e27-4846-9a6a-896f5793ebe2', 'Escalate, document, review care', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1cfcc3d0-a6f1-4963-ad29-7ccae6af8405', 'e71ea7a1-9e27-4846-9a6a-896f5793ebe2', 'Remove from register', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('bb8c6677-0a03-47f2-a3eb-fc4ce6e5a698', 'part_b', 'A patient vomits blood. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Medical emergency.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('1d091414-e24a-45b5-8e39-0e64da172869', 'bb8c6677-0a03-47f2-a3eb-fc4ce6e5a698', 'Offer fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c59a4aff-beb3-4f98-8be6-956e4646b726', 'bb8c6677-0a03-47f2-a3eb-fc4ce6e5a698', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3e18c9a5-cd75-4b55-aac7-75315cc99433', 'bb8c6677-0a03-47f2-a3eb-fc4ce6e5a698', 'Escalate immediately', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8923f744-a355-45ab-8e1b-00f10267089d', 'bb8c6677-0a03-47f2-a3eb-fc4ce6e5a698', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('7c2cf796-41d2-4727-b624-6420d38a4d92', 'part_b', 'A patient has rising NEWS2 but feels well. What should the nurse do?', 'multiple_choice', 'medium', 1, 'NEWS2 must be followed.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c7546746-0da0-47ae-bb22-9f7bc0c48ad7', '7c2cf796-41d2-4727-b624-6420d38a4d92', 'Trust patient', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('39f37af1-9315-43af-8fd3-731e5d2e13ba', '7c2cf796-41d2-4727-b624-6420d38a4d92', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9cb24003-e637-4169-aadb-054c1e953702', '7c2cf796-41d2-4727-b624-6420d38a4d92', 'Escalate as per policy', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('5d34e67f-ea54-4e2b-9139-da5a2a4a2fdf', '7c2cf796-41d2-4727-b624-6420d38a4d92', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('8a989206-75b7-4d20-aad6-e27b3d4441aa', 'part_b', 'A patient becomes breathless after mobilisation. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Breathlessness needs assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a625eda6-85c0-4217-8f4f-342e68c78b0f', '8a989206-75b7-4d20-aad6-e27b3d4441aa', 'Encourage walking', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0816edc8-41b6-4ac4-9d7d-b10a3a8391fe', '8a989206-75b7-4d20-aad6-e27b3d4441aa', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c335c9a6-7411-4c7e-b27f-ca339399afe1', '8a989206-75b7-4d20-aad6-e27b3d4441aa', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9f679d63-fd9e-4772-a85d-bfa4d692e6c1', '8a989206-75b7-4d20-aad6-e27b3d4441aa', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('1a6fe373-5024-4523-bbc4-2fc007c25b85', 'part_b', 'A patient with dementia appears distressed during care. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Distress should be addressed.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('48289d9d-8dde-4779-9d2b-f70df465c07b', '1a6fe373-5024-4523-bbc4-2fc007c25b85', 'Continue quickly', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2584b584-e99a-406e-8ce9-4e0626d63548', '1a6fe373-5024-4523-bbc4-2fc007c25b85', 'Restrain', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('05ff17e0-eeb2-49bd-ad3f-4012e44204df', '1a6fe373-5024-4523-bbc4-2fc007c25b85', 'Pause, reassure, reassess', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9851499e-9c40-49aa-9834-7c81bce38197', '1a6fe373-5024-4523-bbc4-2fc007c25b85', 'Ignore', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('1251273d-7833-48ff-90cf-8f203b5879ae', 'part_b', 'A patient with diabetes has blood glucose of 18 mmol/L. What should the nurse do?', 'multiple_choice', 'medium', 1, 'High glucose needs action.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ffc59744-1116-46d6-aa0e-288a97c65b93', '1251273d-7833-48ff-90cf-8f203b5879ae', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('83d25ed9-9129-4262-add1-29a2d451db03', '1251273d-7833-48ff-90cf-8f203b5879ae', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c66916e5-b983-451e-95e2-bb1a2960b8bb', '1251273d-7833-48ff-90cf-8f203b5879ae', 'Give insulin blindly', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('06703cc9-3b43-431e-8be5-f2b97bb8fadd', '1251273d-7833-48ff-90cf-8f203b5879ae', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('ac01f36a-6ee1-436c-b87f-cd05f4dda038', 'part_b', 'A patient complains of pain at IV cannula site. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Cannula issues need assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6f369972-79d7-41fd-b126-944279001194', 'ac01f36a-6ee1-436c-b87f-cd05f4dda038', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a4073952-0e54-4a8e-822e-8fc841c05461', 'ac01f36a-6ee1-436c-b87f-cd05f4dda038', 'Slow infusion', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('96087ee3-5b4f-4344-acde-6b6730ea6196', 'ac01f36a-6ee1-436c-b87f-cd05f4dda038', 'Assess and act', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c90b376b-496f-46ec-90c0-80c67b8c20a0', 'ac01f36a-6ee1-436c-b87f-cd05f4dda038', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('5e564e31-6135-47d9-9b86-03e67bae20f9', 'part_b', 'A palliative patient has increasing secretions. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Symptoms need management.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ca6188fa-6b0a-45a9-a155-f270e46554be', '5e564e31-6135-47d9-9b86-03e67bae20f9', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('912bb0e4-af12-4c7b-8d4c-e8e7ff3052ae', '5e564e31-6135-47d9-9b86-03e67bae20f9', 'Reassess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('efc445d4-d327-4d06-8060-67928ad5b497', '5e564e31-6135-47d9-9b86-03e67bae20f9', 'Increase fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0bfdd516-5a29-4555-aa5c-283cf9dc7b1b', '5e564e31-6135-47d9-9b86-03e67bae20f9', 'Ask family to leave', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('286358c6-b2f1-48e9-a1e7-085bc8c08c1f', 'part_b', 'A patient suddenly loses consciousness. What is the priority action?', 'multiple_choice', 'medium', 1, 'Emergency response required.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a038f086-4904-43e2-bdc2-a1951fdc880e', '286358c6-b2f1-48e9-a1e7-085bc8c08c1f', 'Check notes', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('4eaa6bdb-ab1e-43f8-a857-b56ca335337d', '286358c6-b2f1-48e9-a1e7-085bc8c08c1f', 'Call family', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('75e7c041-c843-43ad-b2e7-da40b9984897', '286358c6-b2f1-48e9-a1e7-085bc8c08c1f', 'Assess airway and activate emergency', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f7b3f24b-c8b3-4401-b475-fb51cdcb0b95', '286358c6-b2f1-48e9-a1e7-085bc8c08c1f', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e27b048c-e19a-43b9-b496-0261b4a74742', 'part_b', 'A patient refuses personal care and appears confused. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Capacity must be assessed.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9d370121-3eb3-4092-9590-ad72842bec23', 'e27b048c-e19a-43b9-b496-0261b4a74742', 'Respect refusal', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('72ff7dd6-8d47-4a16-8126-e8264ac9b95a', 'e27b048c-e19a-43b9-b496-0261b4a74742', 'Ask family', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('462c1b66-0bc3-4f5f-9b7f-f0634631e8fd', 'e27b048c-e19a-43b9-b496-0261b4a74742', 'Assess capacity', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('72903a69-5206-4621-88da-f7d5c08ad5a9', 'e27b048c-e19a-43b9-b496-0261b4a74742', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('da879aef-fd5e-4655-bc04-c0428c03babb', 'part_b', 'A patient with diarrhoea wants to use shared toilet. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Prevents infection spread.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('becc5db9-d990-4cd3-ab35-bd4aea8e38b4', 'da879aef-fd5e-4655-bc04-c0428c03babb', 'Allow', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9e8bd125-5ed3-448d-be82-4d47dc2ff711', 'da879aef-fd5e-4655-bc04-c0428c03babb', 'Use dedicated toilet', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('d09bc0d5-c152-41d3-a392-e7daa48e0c95', 'da879aef-fd5e-4655-bc04-c0428c03babb', 'Delay care', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('09a0fb48-ea82-4eea-a181-5b37f57e9a07', 'da879aef-fd5e-4655-bc04-c0428c03babb', 'Ignore', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('b26a5364-67b5-461a-8d75-1c3251845315', 'part_b', 'A patient has chest pain radiating to arm. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Possible cardiac emergency.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f34699f8-c5e1-40f8-b7be-4f883d89f550', 'b26a5364-67b5-461a-8d75-1c3251845315', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('14c5d2ea-e0a4-4b67-92cf-f1b068544f3b', 'b26a5364-67b5-461a-8d75-1c3251845315', 'Ask to rest', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c2552d31-5546-41b6-84a2-71411612ddb4', 'b26a5364-67b5-461a-8d75-1c3251845315', 'Escalate immediately', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('bd4baedc-ffd5-4c35-a4f2-4e4800fa97c4', 'b26a5364-67b5-461a-8d75-1c3251845315', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('7d9b4de6-a6ac-44cc-8596-79fd128a806d', 'part_b', 'A patient receiving chemotherapy develops fever. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Febrile neutropenia risk.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('3122f008-15dd-4e9a-9be7-68ceda8c3b12', '7d9b4de6-a6ac-44cc-8596-79fd128a806d', 'Give paracetamol', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('90ae61ee-ba9d-49ae-b295-de0e7eb47d9c', '7d9b4de6-a6ac-44cc-8596-79fd128a806d', 'Document', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('53aad71c-71d2-4466-a7b3-dd31d43148ff', '7d9b4de6-a6ac-44cc-8596-79fd128a806d', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('12e14b13-7151-4ee3-a5ba-62a86b90780d', '7d9b4de6-a6ac-44cc-8596-79fd128a806d', 'Encourage fluids', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e7484ce1-83e0-4e3b-b818-1a8f3b2937ba', 'part_b', 'A patient at end of life is incontinent. What is the priority?', 'multiple_choice', 'medium', 1, 'Dignity is essential.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('9ff56b56-89d1-4196-a983-cbf4ef99c3d0', 'e7484ce1-83e0-4e3b-b818-1a8f3b2937ba', 'Restrict fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('14008498-5ccd-4ffa-8edf-fdba11df5cdb', 'e7484ce1-83e0-4e3b-b818-1a8f3b2937ba', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('56da9e4e-6349-4d93-8d1c-17da5774478d', 'e7484ce1-83e0-4e3b-b818-1a8f3b2937ba', 'Maintain hygiene and dignity', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f36fddfd-9e2c-4d53-a3f9-2075d9b7657c', 'e7484ce1-83e0-4e3b-b818-1a8f3b2937ba', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('69ea3dd8-87fb-49f8-9e7a-2217a43cd57d', 'part_b', 'A patient becomes aggressive during care. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Safety first.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ca447b17-984e-414b-a138-e0f4c4427661', '69ea3dd8-87fb-49f8-9e7a-2217a43cd57d', 'Respond aggressively', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('cbe5b7b1-87c5-4793-afc4-9e2f3786343e', '69ea3dd8-87fb-49f8-9e7a-2217a43cd57d', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fac6a54d-e68d-454f-a555-528124a2f11e', '69ea3dd8-87fb-49f8-9e7a-2217a43cd57d', 'Ensure safety and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('24c2a32b-64a4-4ab3-9f1c-c7062eb697aa', '69ea3dd8-87fb-49f8-9e7a-2217a43cd57d', 'Leave patient', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('f55a1669-822f-427e-aa55-34001cf9a35c', 'part_b', 'A patient has poor oral intake and appears dehydrated. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Dehydration needs assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7679a7a3-abbc-439b-8dc7-6462db0d3a8a', 'f55a1669-822f-427e-aa55-34001cf9a35c', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a0eef0c1-0ff3-487e-bfd5-03493944f8c7', 'f55a1669-822f-427e-aa55-34001cf9a35c', 'Restrict fluids', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8cda4e5e-5a3a-4986-9871-d19166653a76', 'f55a1669-822f-427e-aa55-34001cf9a35c', 'Assess hydration and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('cd7cabad-46db-4336-bf2b-3c8efe583ed2', 'f55a1669-822f-427e-aa55-34001cf9a35c', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('3348425d-3d72-4e7a-a688-1b503ed8cadc', 'part_b', 'A patient’s wound suddenly increases in size. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Sudden change indicates deterioration.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('39525439-5f9f-4787-8418-2c7b95840946', '3348425d-3d72-4e7a-a688-1b503ed8cadc', 'Continue care', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f8635573-3bdd-441a-b633-8fac2ce90e63', '3348425d-3d72-4e7a-a688-1b503ed8cadc', 'Cover and wait', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('6d6d0ab6-2e81-4e43-953a-84cf774580c4', '3348425d-3d72-4e7a-a688-1b503ed8cadc', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8b9d9822-8a21-41df-af29-87c490f90472', '3348425d-3d72-4e7a-a688-1b503ed8cadc', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('06d80e54-8471-4c9f-9fa3-7cb5456c5325', 'part_b', 'A patient removes oxygen mask repeatedly. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Address cause, not restrain.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('8c8ac164-64b4-4db8-bb76-03df9c762dcd', '06d80e54-8471-4c9f-9fa3-7cb5456c5325', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f901366d-1949-40ad-920f-7271e72e7318', '06d80e54-8471-4c9f-9fa3-7cb5456c5325', 'Restrain', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('04840d5a-a0f0-4aa3-a414-654b50278617', '06d80e54-8471-4c9f-9fa3-7cb5456c5325', 'Assess understanding and needs', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('12cf33fe-c4a5-49c3-b768-1f0f43234525', '06d80e54-8471-4c9f-9fa3-7cb5456c5325', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('90337c53-d3ba-423c-8cc1-77d493c0ecfc', 'part_b', 'A patient has repeated low blood pressure readings. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Persistent hypotension is serious.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('05d36b7e-de0f-4327-98c4-825f530fbf35', '90337c53-d3ba-423c-8cc1-77d493c0ecfc', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0b758135-7c87-4005-9294-a90b1f87fe43', '90337c53-d3ba-423c-8cc1-77d493c0ecfc', 'Encourage walking', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f9d82e02-9474-4af7-b7f0-de6a8af4f268', '90337c53-d3ba-423c-8cc1-77d493c0ecfc', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('00c9d770-c983-4977-9f6d-23f09dbd5aff', '90337c53-d3ba-423c-8cc1-77d493c0ecfc', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('7d335558-1923-4f12-9890-dc063bcbdf6b', 'part_b', 'A patient receiving IV antibiotics reports itching. What should the nurse do first?', 'multiple_choice', 'medium', 1, 'Early allergy sign.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('82a6ff75-f987-4d8a-98b0-207cea7f3fc0', '7d335558-1923-4f12-9890-dc063bcbdf6b', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('62b22d89-fe85-417b-93f8-c6a228613db6', '7d335558-1923-4f12-9890-dc063bcbdf6b', 'Continue infusion', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b5457472-e8f8-41b3-8b12-1f5356207574', '7d335558-1923-4f12-9890-dc063bcbdf6b', 'Assess for allergic reaction', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('7d94dd92-e3f6-4765-b0f4-b6ee406c9f2f', '7d335558-1923-4f12-9890-dc063bcbdf6b', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('1e23f584-8cb1-4fb6-9672-76122488363a', 'part_b', 'A patient at end of life asks if they are dying. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Honest communication is required.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0538fe2e-084e-42d7-a4da-98620a3037fd', '1e23f584-8cb1-4fb6-9672-76122488363a', 'Avoid', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('2eb3ff74-86a2-4dc9-9e28-c60444baad88', '1e23f584-8cb1-4fb6-9672-76122488363a', 'Give opinion', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('47cccfaf-7695-4361-a01c-5639f3b9229d', '1e23f584-8cb1-4fb6-9672-76122488363a', 'Respond honestly and escalate if needed', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('da9de4d6-ce22-47f9-a844-458960768c4e', '1e23f584-8cb1-4fb6-9672-76122488363a', 'Change topic', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('e3f37429-448a-4acb-93cf-38d822acd30d', 'part_b', 'A patient with catheter has no urine output for hours. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Needs assessment.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f5755874-7c65-414c-a597-1ad408f4eb8a', 'e3f37429-448a-4acb-93cf-38d822acd30d', 'Flush catheter', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('ea5bc159-80cc-431c-b750-fc210a2296e6', 'e3f37429-448a-4acb-93cf-38d822acd30d', 'Ignore', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('645cb499-b6a7-4aa3-8d33-1b7e94918056', 'e3f37429-448a-4acb-93cf-38d822acd30d', 'Assess and escalate', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f35da41b-05a9-4347-b2c3-61438a6f3d38', 'e3f37429-448a-4acb-93cf-38d822acd30d', 'Document', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('410dafdc-a7a0-4248-aad3-d16fb0f0c7fc', 'part_b', 'A patient becomes pale, clammy, and tachycardic. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Signs of shock.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('c78ec265-96c5-47f1-bc03-68cfba16b2bb', '410dafdc-a7a0-4248-aad3-d16fb0f0c7fc', 'Reassure', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('b56b4365-509f-44e7-9e0a-a3d865fe2372', '410dafdc-a7a0-4248-aad3-d16fb0f0c7fc', 'Document', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('a6cee3d0-90e0-46c0-b0a5-57c0191df59a', '410dafdc-a7a0-4248-aad3-d16fb0f0c7fc', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('0336aefb-9212-454b-b296-68336c479385', '410dafdc-a7a0-4248-aad3-d16fb0f0c7fc', 'Encourage fluids', false, 0);

INSERT INTO mock_exam_questions (id, exam_part, question_text, question_type, difficulty, points, explanation, is_active)
VALUES ('877f0b83-283a-414c-afc2-709eba902299', 'part_b', 'A patient has severe headache and neck stiffness. What should the nurse do?', 'multiple_choice', 'medium', 1, 'Possible serious neurological condition.', true);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('876d07bf-75ab-4443-a852-1cfd516d6402', '877f0b83-283a-414c-afc2-709eba902299', 'Give analgesia', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f79689cd-9fb3-4f80-8e1e-8fb45c901c86', '877f0b83-283a-414c-afc2-709eba902299', 'Encourage rest', false, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('f9263a82-2b0a-4988-ad60-eff7fb638f4f', '877f0b83-283a-414c-afc2-709eba902299', 'Escalate urgently', true, 0);

INSERT INTO "mock_exam_question_options" (id, question_id, option_text, is_correct, display_order)
VALUES ('fa4da962-f87a-48f5-853f-f26715f8b202', '877f0b83-283a-414c-afc2-709eba902299', 'Document', false, 0);