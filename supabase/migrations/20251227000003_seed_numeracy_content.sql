-- Seeding Numeracy Topic Content

DO $$
DECLARE
    v_topic_id uuid;
BEGIN
    -- 1. Get the Topic ID for 'Numeracy'
    -- Note: Adjust the title match if it's named slightly differently (e.g., 'Numeracy Skills')
    SELECT id INTO v_topic_id FROM public.topics WHERE title ILIKE 'Numeracy%' LIMIT 1;

    IF v_topic_id IS NULL THEN
        RAISE NOTICE 'Topic "Numeracy" not found. Skipping seeding.';
        RETURN;
    END IF;

    -- 2. Insert Core Notes (sections)
    -- We delete existing to avoid duplicates/conflicts during re-runs
    DELETE FROM public.topic_core_notes WHERE topic_id = v_topic_id;

    INSERT INTO public.topic_core_notes (topic_id, content, sections, is_active)
    VALUES (
        v_topic_id,
        '', -- Provide empty string for required content column
        '[
            {
                "order": 0,
                "title": "1. Introduction",
                "content": "<p>Numeracy is tested in <strong>Part A of the NMC CBT</strong>.</p><p>It checks if the nurse can calculate safely and accurately.</p><p>Numeracy errors can cause serious patient harm.</p><p>This lesson explains the <strong>core numeracy skills</strong> needed for the CBT and UK practice.</p>"
            },
            {
                "order": 1,
                "title": "2. Why Numeracy Is Important for Nurses in the UK",
                "content": "<p>In UK nursing practice, nurses must:</p><ul><li>Give the <strong>correct dose</strong></li><li>Use the <strong>correct unit</strong></li><li>Set <strong>IV fluids safely</strong></li><li>Record <strong>accurate fluid balance</strong></li></ul><p>A small calculation error can lead to overdose, underdose, or patient harm.</p><p>The CBT tests <strong>accuracy, not speed</strong>.</p>"
            },
            {
                "order": 2,
                "title": "3. Core Numeracy Areas Tested in the CBT",
                "content": "<p>The numeracy section mainly tests four areas:</p><ol><li>Dosage calculations</li><li>Unit conversions</li><li>IV flow rate calculations</li><li>Fluid balance calculations</li></ol><p>Each question has <strong>one correct answer only</strong>.</p>"
            },
            {
                "order": 3,
                "title": "4. Dosage Calculations",
                "content": "<h3>Key Principle</h3><p>The nurse must calculate the <strong>exact dose prescribed</strong>.</p><p>Always check the <strong>prescription</strong>, <strong>drug strength</strong>, and <strong>route</strong>.</p><h3>Common Types</h3><ul><li>Tablets</li><li>Liquid medicines</li><li>Weight-based doses (mg/kg)</li></ul><h3>Scenario</h3><p>A patient is prescribed <strong>500 mg paracetamol</strong>.</p><p>Tablets available are <strong>250 mg each</strong>.</p><p><strong>Decision Question</strong></p><p>What should the nurse give?</p><h3>Correct Action</h3><ul><li>Calculate required tablets</li><li>500 mg ÷ 250 mg = <strong>2 tablets</strong></li></ul><h3>CBT Trap</h3><ul><li>Guessing the dose</li><li>Giving one tablet without calculating</li></ul><h3>Key CBT Takeaway</h3><ul><li>Always divide the <strong>dose required</strong> by the <strong>dose available</strong></li><li>Do not estimate</li></ul>"
            },
            {
                "order": 4,
                "title": "5. Unit Conversions",
                "content": "<h3>Key Principle</h3><p>Units must be converted <strong>before</strong> calculating the dose.</p><p>Wrong units lead to wrong answers.</p><h3>Common Conversions Tested</h3><ul><li>1 g = 1000 mg</li><li>1 mg = 1000 micrograms (mcg)</li><li>1 L = 1000 mL</li><li>Weight: kg to g (×1000)</li></ul><h3>Scenario</h3><p>A prescription says <strong>0.5 g</strong>.</p><p>The question asks for the answer in <strong>mg</strong>.</p><p><strong>Decision Question</strong></p><p>What should the nurse do first?</p><h3>Correct Action</h3><ul><li>Convert units</li><li>0.5 g = <strong>500 mg</strong></li></ul><h3>CBT Trap</h3><ul><li>Calculating without converting</li><li>Missing the unit asked in the question</li></ul><h3>Key CBT Takeaway</h3><ul><li>Convert units <strong>first</strong></li><li>Check what unit the answer requires</li></ul>"
            },
            {
                "order": 5,
                "title": "6. IV Flow Rate Calculations",
                "content": "<h3>Key Principle</h3><p>IV fluids must be delivered at the <strong>correct rate and time</strong>.</p><p>Errors can cause fluid overload or dehydration.</p><h3>Common Questions</h3><ul><li>Total volume over time</li><li>mL per hour</li><li>Drops per minute (if drop factor is given)</li></ul><h3>Scenario</h3><p>A patient needs <strong>1000 mL over 8 hours</strong>.</p><p><strong>Decision Question</strong></p><p>What is the infusion rate in mL per hour?</p><h3>Correct Action</h3><ul><li>Divide volume by time</li><li>1000 mL ÷ 8 = <strong>125 mL/hour</strong></li></ul><h3>CBT Trap</h3><ul><li>Multiplying instead of dividing</li><li>Forgetting the time unit</li></ul><h3>Key CBT Takeaway</h3><ul><li>Use the formula: <strong>Total volume ÷ total time</strong></li></ul>"
            },
            {
                "order": 6,
                "title": "7. Fluid Balance Calculations",
                "content": "<h3>Key Principle</h3><p>Fluid balance helps assess hydration status.</p><p>Accurate calculation supports patient safety.</p><h3>Common Tasks</h3><ul><li>Add fluid intake</li><li>Add fluid output</li><li>Calculate total balance</li><li>Estimate daily fluid needs</li></ul><h3>Scenario</h3><p>A patient drinks <strong>1500 mL</strong> and has <strong>1200 mL urine output</strong>.</p><p><strong>Decision Question</strong></p><p>What is the fluid balance?</p><h3>Correct Action</h3><ul><li>Intake – Output</li><li>1500 – 1200 = <strong>+300 mL</strong></li></ul><h3>CBT Trap</h3><ul><li>Adding intake and output together</li><li>Forgetting positive or negative balance</li></ul><h3>Key CBT Takeaway</h3><ul><li>Fluid balance = <strong>Intake minus Output</strong></li><li>Show the sign (+ or –)</li></ul>"
            },
            {
                "order": 7,
                "title": "8. How to Approach Numeracy Questions in the CBT",
                "content": "<p>Follow this safe order:</p><ol><li>Read the question <strong>slowly</strong></li><li>Identify:<ul><li>What is given</li><li>What is asked</li></ul></li><li>Convert units if needed</li><li>Use one clear calculation</li><li>Check the final unit</li><li>Enter the answer carefully</li></ol><p>There is <strong>no negative marking</strong>, but accuracy is essential.</p>"
            },
            {
                "order": 8,
                "title": "9. Common CBT Numeracy Mistakes to Avoid",
                "content": "<ul><li>Skipping unit conversion</li><li>Rounding when not asked</li><li>Guessing answers</li><li>Misreading hours and minutes</li><li>Forgetting decimal points</li></ul><p>Always double-check before submitting.</p>"
            },
            {
                "order": 9,
                "title": "10. Final CBT Takeaways",
                "content": "<ul><li>Numeracy tests <strong>safe practice</strong></li><li>Accuracy is more important than speed</li><li>Convert units first</li><li>Use simple calculations</li><li>Check units every time</li></ul>"
            }
        ]'::jsonb,
        true
    );

    -- 3. Insert Flash Content (5 screens)
    -- Delete existing to avoid duplicates
    DELETE FROM public.topic_flash_content WHERE topic_id = v_topic_id;

    INSERT INTO public.topic_flash_content (topic_id, screen_number, title, content, is_active)
    VALUES
        (
            v_topic_id, 
            1, 
            'Numeracy Safety First', 
            '<ul><li>Numeracy errors can cause serious patient harm</li><li>Always calculate carefully</li><li>Accuracy is more important than speed in the CBT</li></ul>', 
            true
        ),
        (
            v_topic_id, 
            2, 
            'Dosage Calculation Rule', 
            '<ul><li>Check the prescribed dose</li><li>Check the strength available</li><li>Use: <strong>Dose required ÷ Dose available</strong></li><li>Never guess the number of tablets or volume</li></ul>', 
            true
        ),
        (
            v_topic_id, 
            3, 
            'Unit Conversion Reminder', 
            '<ul><li>1 g = 1000 mg</li><li>1 mg = 1000 micrograms</li><li>1 L = 1000 mL</li><li>Always convert units <strong>before</strong> calculating</li></ul>', 
            true
        ),
        (
            v_topic_id, 
            4, 
            'IV Flow Rate Formula', 
            '<ul><li>Use: <strong>Total volume ÷ Total time</strong></li><li>Answer is usually in mL per hour</li><li>Check if the question asks for hours or minutes</li></ul>', 
            true
        ),
        (
            v_topic_id, 
            5, 
            'Fluid Balance Calculation', 
            '<ul><li>Fluid balance = <strong>Intake – Output</strong></li><li>Positive balance means more intake</li><li>Negative balance means more output</li><li>Record totals clearly and accurately</li></ul>', 
            true
        );

    RAISE NOTICE 'Numeracy content seeded successfully.';

END $$;
