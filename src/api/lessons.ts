import { supabase } from "@/lib/supabase";
import { Lesson, CreateLessonInput, UpdateLessonInput } from "@/types/content";

const mapToLesson = (data: any): Lesson => ({
  id: data.id,
  topicId: data.topic_id,
  title: data.title,
  content: data.content,
  videoUrl: data.video_url,
  audioUrl: data.podcast_url || data.audio_url, // Fallback
  podcastUrl: data.podcast_url,
  contentType: data.content_type || data.lesson_type, // Fallback
  lessonType: data.content_type || (data.lesson_type as any), // Fallback
  isMandatory: data.is_mandatory,
  passingScorePercentage: data.passing_score_percentage,
  category: data.subtopic_id || data.category, // Fallback to category if subtopic_id null
  subtopicId: data.subtopic_id || data.category, // Map subtopicId too
  duration: data.duration,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  topic: data.topics
    ? {
        id: data.topics.id,
        moduleId: data.topics.module_id,
        title: data.topics.title,
        description: data.topics.description,
        isActive: data.topics.is_active,
        displayOrder: data.topics.display_order,
        createdAt: data.topics.created_at,
        updatedAt: data.topics.updated_at,
      }
    : undefined,
});

export const lessonsAPI = {
  async getAll(): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*, topics(*)")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToLesson);
  },

  async getByTopicId(topicId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*, topics(*)")
      .eq("topic_id", topicId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToLesson);
  },

  async getById(id: string): Promise<Lesson> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*, topics(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapToLesson(data);
  },

  async create(input: CreateLessonInput): Promise<Lesson> {
    const { data, error } = await supabase
      .from("lessons")
      .insert([
        {
          topic_id: input.topicId,
          title: input.title,
          content: input.content,
          video_url: input.videoUrl,
          podcast_url: input.audioUrl, // Map frontend audioUrl to DB podcast_url
          content_type: input.lessonType, // Map frontend lessonType to DB content_type
          passing_score_percentage: input.passingScorePercentage,
          subtopic_id: input.category, // Map frontend category to DB subtopic_id
          duration: input.duration,
          is_active: input.isActive ?? true,
          display_order: input.displayOrder ?? 0,
        },
      ])
      .select("*, topics(*)")
      .single();

    if (error) throw error;
    return mapToLesson(data);
  },

  async update(id: string, input: UpdateLessonInput): Promise<Lesson> {
    const updateData: any = {};
    if (input.topicId !== undefined) updateData.topic_id = input.topicId;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.videoUrl !== undefined) updateData.video_url = input.videoUrl;
    if (input.audioUrl !== undefined) updateData.podcast_url = input.audioUrl; // Map
    if (input.podcastUrl !== undefined)
      updateData.podcast_url = input.podcastUrl;
    if (input.lessonType !== undefined)
      updateData.content_type = input.lessonType; // Map
    if (input.contentType !== undefined)
      updateData.content_type = input.contentType;
    if (input.isMandatory !== undefined)
      updateData.is_mandatory = input.isMandatory;
    if (input.passingScorePercentage !== undefined)
      updateData.passing_score_percentage = input.passingScorePercentage;
    if (input.category !== undefined) updateData.subtopic_id = input.category; // Map
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.displayOrder !== undefined)
      updateData.display_order = input.displayOrder;

    const { data, error } = await supabase
      .from("lessons")
      .update(updateData)
      .eq("id", id)
      .select("*, topics(*)")
      .single();

    if (error) throw error;
    return mapToLesson(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) throw error;
  },
};
