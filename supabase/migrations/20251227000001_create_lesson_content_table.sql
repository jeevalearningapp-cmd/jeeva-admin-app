-- Create Lesson Content Table (User Provided Schema)
create table IF NOT EXISTS public.lesson_content (
  id uuid not null default gen_random_uuid (),
  lesson_id uuid not null,
  content_type character varying(50) not null,
  title character varying(255) not null,
  description text null,
  display_order integer null default 0,
  content_url character varying(500) null,
  content_text text null,
  content_data jsonb null,
  duration_seconds integer null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lesson_content_pkey primary key (id),
  constraint lesson_content_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_content_content_type_check check (
    (
      (content_type)::text = any (
        (
          array[
            'video'::character varying,
            'audio'::character varying,
            'text'::character varying,
            'flashcard'::character varying,
            'mcq'::character varying,
            'assessment'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lesson_content_lesson on public.lesson_content using btree (lesson_id) TABLESPACE pg_default;
create index IF not exists idx_lesson_content_type on public.lesson_content using btree (content_type) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Enable read access for all users" ON public.lesson_content FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.lesson_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.lesson_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.lesson_content FOR DELETE USING (auth.role() = 'authenticated');

-- Migrate Data: Function to move content from 'lessons' table to 'lesson_content'
CREATE OR REPLACE FUNCTION migrate_lesson_content() RETURNS void AS $$
DECLARE
    l_record RECORD;
BEGIN
    FOR l_record IN SELECT * FROM public.lessons LOOP
        -- 1. Migrate Text Content
        IF l_record.content IS NOT NULL AND length(l_record.content) > 0 THEN
            INSERT INTO public.lesson_content (
                lesson_id, content_type, title, content_text, display_order, is_active, created_at
            ) VALUES (
                l_record.id, 'text', 'Lesson Notes', l_record.content, 0, l_record.is_active, l_record.created_at
            );
        END IF;

        -- 2. Migrate Video Content
        IF l_record.video_url IS NOT NULL AND length(l_record.video_url) > 0 THEN
            INSERT INTO public.lesson_content (
                lesson_id, content_type, title, content_url, display_order, is_active, created_at
            ) VALUES (
                l_record.id, 'video', 'Lesson Video', l_record.video_url, 1, l_record.is_active, l_record.created_at
            );
        END IF;

        -- 3. Migrate Audio Content
        IF l_record.audio_url IS NOT NULL AND length(l_record.audio_url) > 0 THEN
            INSERT INTO public.lesson_content (
                lesson_id, content_type, title, content_url, display_order, is_active, created_at
            ) VALUES (
                l_record.id, 'audio', 'Lesson Audio', l_record.audio_url, 2, l_record.is_active, l_record.created_at
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute Migration
SELECT migrate_lesson_content();

-- Drop the function after use
DROP FUNCTION migrate_lesson_content();
