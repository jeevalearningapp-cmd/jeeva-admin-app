-- Create Practice Questions Table (User Provided Schema)
create table IF NOT EXISTS public.practice_questions (
  id uuid not null default gen_random_uuid (),
  category character varying(100) not null,
  subdivision character varying(100) not null,
  question_text text not null,
  question_type character varying(50) not null,
  difficulty character varying(20) not null,
  points integer not null default 1,
  explanation text null,
  image_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint practice_questions_pkey primary key (id),
  constraint practice_questions_difficulty_check check (
    (
      (difficulty)::text = any (
        (
          array[
            'easy'::character varying,
            'medium'::character varying,
            'hard'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint practice_questions_question_type_check check (
    (
      (question_type)::text = any (
        (
          array[
            'multiple_choice'::character varying,
            'true_false'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_practice_questions_category on public.practice_questions using btree (category) TABLESPACE pg_default;
create index IF not exists idx_practice_questions_subdivision on public.practice_questions using btree (subdivision) TABLESPACE pg_default;
create index IF not exists idx_practice_questions_active on public.practice_questions using btree (is_active) TABLESPACE pg_default where (is_active = true);

-- Create Practice Question Options Table (User Provided Schema)
create table IF NOT EXISTS public.practice_question_options (
  id uuid not null default gen_random_uuid (),
  question_id uuid not null,
  option_text text not null,
  is_correct boolean null default false,
  display_order integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint practice_question_options_pkey primary key (id),
  constraint practice_question_options_question_id_fkey foreign KEY (question_id) references practice_questions (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_practice_question_options_question_id on public.practice_question_options using btree (question_id) TABLESPACE pg_default;


-- Enable RLS
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_question_options ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Copying from questions table patterns)

-- Practice Questions Policies
CREATE POLICY "Enable read access for all users" ON public.practice_questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.practice_questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.practice_questions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.practice_questions FOR DELETE USING (auth.role() = 'authenticated');

-- Practice Options Policies
CREATE POLICY "Enable read access for all users" ON public.practice_question_options FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.practice_question_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.practice_question_options FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.practice_question_options FOR DELETE USING (auth.role() = 'authenticated');

-- Migrate Data: Service Function to Migrate Practice Data Only
CREATE OR REPLACE FUNCTION migrate_practice_data() RETURNS void AS $$
DECLARE
    q_record RECORD;
    new_q_id UUID;
    opt_record RECORD;
BEGIN
    -- Migrate Practice Questions
    FOR q_record IN SELECT * FROM public.questions WHERE module_type = 'practice' LOOP
        INSERT INTO public.practice_questions (
            id, category, subdivision, question_text, question_type, 
            difficulty, points, explanation, image_url, is_active, 
            created_at, updated_at
        ) VALUES (
            q_record.id, q_record.category, q_record.subdivision, q_record.question_text, q_record.question_type,
            q_record.difficulty, q_record.points, q_record.explanation, q_record.image_url, q_record.is_active,
            q_record.created_at, q_record.updated_at
        ) RETURNING id INTO new_q_id;

        -- Migrate Options
        FOR opt_record IN SELECT * FROM public.question_options WHERE question_id = q_record.id LOOP
            INSERT INTO public.practice_question_options (
                id, question_id, option_text, is_correct, display_order, created_at
            ) VALUES (
                opt_record.id, new_q_id, opt_record.option_text, opt_record.is_correct, opt_record.display_order, opt_record.created_at
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute Migration
SELECT migrate_practice_data();

-- Drop the function after use
DROP FUNCTION migrate_practice_data();


