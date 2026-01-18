import { supabase } from "@/lib/supabase";

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubtopicInput {
  topicId: string;
  title: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateSubtopicInput {
  title?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface SubtopicValidationStatus {
  hasVideo: boolean;
  hasReading: boolean;
  hasPodcast: boolean;
  mcqCount: number;
  isValid: boolean;
  errors: string[];
}

const mapToSubtopic = (data: any): Subtopic => {
  return {
    id: data.id,
    topicId: data.topic_id,
    title: data.title,
    isActive: data.is_active,
    displayOrder: data.display_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const subtopicsAPI = {
  async getByTopicId(topicId: string): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from("subtopics")
      .select("*")
      .eq("topic_id", topicId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToSubtopic);
  },

  async getById(id: string): Promise<Subtopic> {
    const { data, error } = await supabase
      .from("subtopics")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return mapToSubtopic(data);
  },

  async create(input: CreateSubtopicInput): Promise<Subtopic> {
    const { data, error } = await supabase
      .from("subtopics")
      .insert([
        {
          topic_id: input.topicId,
          title: input.title,
          is_active: input.isActive ?? true,
          display_order: input.displayOrder ?? 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return mapToSubtopic(data);
  },

  async update(id: string, input: UpdateSubtopicInput): Promise<Subtopic> {
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.displayOrder !== undefined)
      updateData.display_order = input.displayOrder;

    const { data, error } = await supabase
      .from("subtopics")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapToSubtopic(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("subtopics").delete().eq("id", id);

    if (error) throw error;
  },

  async getValidationStatus(id: string): Promise<SubtopicValidationStatus> {
    // Check for "Reading" lesson (text content)
    const { count: readingCount } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("subtopic_id", id)
      .eq("content_type", "text");

    // Check for "Video" lesson - either by content_type OR by having video_url
    const { count: videoByType } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("subtopic_id", id)
      .eq("content_type", "video");

    const { count: videoByUrl } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("subtopic_id", id)
      .not("video_url", "is", null)
      .neq("video_url", "");

    // Check for Podcast - by having podcast_url
    const { count: podcastCount } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("subtopic_id", id)
      .not("podcast_url", "is", null)
      .neq("podcast_url", "");

    // Get MCQ count from learning_questions table (correct table for learning module)
    const { count: mcqCount } = await supabase
      .from("learning_questions")
      .select("*", { count: "exact", head: true })
      .eq("subtopic_id", id)
      .eq("is_active", true);

    const hasVideo = (videoByType || 0) + (videoByUrl || 0) > 0;
    const hasReading = (readingCount || 0) > 0;
    const hasPodcast = (podcastCount || 0) > 0;
    const finalMcqCount = mcqCount || 0;

    const errors: string[] = [];
    if (!hasVideo) errors.push("Missing Video Lesson");
    if (!hasReading) errors.push("Missing Reading Lesson");
    if (finalMcqCount < 5) errors.push(`Low MCQ count (${finalMcqCount}/5)`);

    return {
      hasVideo,
      hasReading,
      hasPodcast,
      mcqCount: finalMcqCount,
      isValid: hasVideo && hasReading && finalMcqCount >= 5,
      errors,
    };
  },
};
