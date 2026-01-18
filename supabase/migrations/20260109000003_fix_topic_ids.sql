-- ============================================
-- Fix Topic IDs to match Mobile App Constants
-- CORE TABLES ONLY: subtopics, lessons, progress tables
-- ============================================

DO $$
DECLARE
    r RECORD;
    current_id UUID;
    target_occupied UUID;
    temp_id UUID;
    learning_module_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    FOR r IN 
        SELECT * FROM (VALUES 
            ('22222222-2222-0001-0000-000000000001'::uuid, 'Numeracy', 'Master calculations, conversions, IV infusions, and fluid balance scenarios tested in the CBT numeracy exam.'),
            ('22222222-2222-0002-0000-000000000002'::uuid, 'Clinical', 'Build essential clinical knowledge across medical-surgical nursing, pharmacology, infection control, wound care, and palliative care.'),
            ('22222222-2222-0003-0000-000000000003'::uuid, 'The NMC Code', 'Understand the four pillars of the NMC Code—People, Practice, Safety, Professionalism—to deliver accountable and compassionate care.'),
            ('22222222-2222-0004-0000-000000000004'::uuid, 'Mental Capacity Act', 'Apply the Mental Capacity Act to assess decision-making ability, plan best-interest care, and respect autonomy.'),
            ('22222222-2222-0005-0000-000000000005'::uuid, 'Safeguarding', 'Safeguard adults and children by recognising abuse, following reporting protocols, and fulfilling statutory duties.'),
            ('22222222-2222-0006-0000-000000000006'::uuid, 'Consent & Confidentiality', 'Balance informed consent, data protection, and safeguarding disclosure requirements in UK nursing practice.'),
            ('22222222-2222-0007-0000-000000000007'::uuid, 'Equality & Diversity', 'Deliver culturally competent care that meets Equality Act duties, respects diversity, and provides reasonable adjustments.'),
            ('22222222-2222-0008-0000-000000000008'::uuid, 'Duty of Candour', 'Meet statutory duty of candour obligations by communicating openly after incidents and documenting actions.'),
            ('22222222-2222-0009-0000-000000000009'::uuid, 'Cultural Adaptation', 'Bridge cultural expectations between Indian practice and UK standards, focusing on autonomy and communication.')
        ) AS t(target_id, title, description)
    LOOP
        
        SELECT id INTO current_id FROM public.topics WHERE title = r.title;
        SELECT id INTO target_occupied FROM public.topics WHERE id = r.target_id;

        -- CASE A: Target ID occupied by wrong topic
        IF target_occupied IS NOT NULL AND (current_id IS NULL OR target_occupied != current_id) THEN
            temp_id := gen_random_uuid();
            RAISE NOTICE 'Target ID % occupied. Moving to temp %', r.target_id, temp_id;
            
            INSERT INTO public.topics (id, module_id, title, description, is_active, created_at, updated_at)
            SELECT temp_id, module_id, title, description, is_active, created_at, updated_at 
            FROM public.topics WHERE id = r.target_id;
            
            -- Core learning tables only
            UPDATE public.subtopics SET topic_id = temp_id WHERE topic_id = r.target_id;
            UPDATE public.lessons SET topic_id = temp_id WHERE topic_id = r.target_id;
            UPDATE public.subtopic_progress SET topic_id = temp_id WHERE topic_id = r.target_id;
            UPDATE public.topic_progress SET topic_id = temp_id WHERE topic_id = r.target_id;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_core_notes') THEN
                UPDATE public.topic_core_notes SET topic_id = temp_id WHERE topic_id = r.target_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_flash_content') THEN
                UPDATE public.topic_flash_content SET topic_id = temp_id WHERE topic_id = r.target_id;
            END IF;

            DELETE FROM public.topics WHERE id = r.target_id;
        END IF;

        -- CASE B: Move existing topic to target ID
        IF current_id IS NOT NULL AND current_id != r.target_id THEN
            RAISE NOTICE 'Moving "%" from % to %', r.title, current_id, r.target_id;
            
            INSERT INTO public.topics (id, module_id, title, description, is_active, created_at, updated_at)
            SELECT r.target_id, module_id, title, description, is_active, created_at, updated_at 
            FROM public.topics WHERE id = current_id;
            
            UPDATE public.subtopics SET topic_id = r.target_id WHERE topic_id = current_id;
            UPDATE public.lessons SET topic_id = r.target_id WHERE topic_id = current_id;
            UPDATE public.subtopic_progress SET topic_id = r.target_id WHERE topic_id = current_id;
            UPDATE public.topic_progress SET topic_id = r.target_id WHERE topic_id = current_id;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_core_notes') THEN
                UPDATE public.topic_core_notes SET topic_id = r.target_id WHERE topic_id = current_id;
            END IF;
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_flash_content') THEN
                UPDATE public.topic_flash_content SET topic_id = r.target_id WHERE topic_id = current_id;
            END IF;

            DELETE FROM public.topics WHERE id = current_id;
            
        -- CASE C: Create new topic
        ELSIF current_id IS NULL THEN
             RAISE NOTICE 'Creating "%"', r.title;
             INSERT INTO public.topics (id, module_id, title, description, is_active, created_at, updated_at)
             VALUES (r.target_id, learning_module_id, r.title, r.description, true, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET 
                title = EXCLUDED.title,
                description = EXCLUDED.description;
        
        -- CASE D: Update existing
        ELSE
             UPDATE public.topics SET 
                description = r.description,
                title = r.title
             WHERE id = r.target_id;
        END IF;

    END LOOP;
    
    UPDATE public.subtopics SET is_active = true WHERE is_active IS NULL;
    UPDATE public.lessons SET is_active = true WHERE is_active IS NULL;

END $$;
