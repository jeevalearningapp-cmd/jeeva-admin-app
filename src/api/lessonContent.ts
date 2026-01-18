import { supabase } from "@/lib/supabase";

export interface LessonContent {
  id: string;
  lessonId: string;
  contentType: "video" | "audio" | "text" | "flashcard" | "mcq" | "assessment";
  title: string;
  description?: string;
  displayOrder: number;
  contentUrl?: string;
  contentText?: string;
  contentData?: any;
  durationSeconds?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonContentInput {
  lessonId: string;
  contentType: "video" | "audio" | "text" | "flashcard" | "mcq" | "assessment";
  title: string;
  description?: string;
  displayOrder?: number;
  contentUrl?: string;
  contentText?: string;
  contentData?: any;
  durationSeconds?: number;
  isActive?: boolean;
}

export interface UpdateLessonContentInput {
  title?: string;
  description?: string;
  displayOrder?: number;
  contentUrl?: string;
  contentText?: string;
  contentData?: any;
  durationSeconds?: number;
  isActive?: boolean;
}

const mapToLessonContent = (data: any): LessonContent => ({
  id: data.id,
  lessonId: data.subtopic_id || data.lesson_id, // Map subtopic_id as lessonId (which is actually subtopicId in this context)
  contentType: data.content_type,
  title: data.title,
  description: data.description,
  displayOrder: data.display_order,
  contentUrl: data.video_url || data.podcast_url || data.content_url,
  contentText: data.content, // Map content column to contentText
  contentData: data.content_data,
  durationSeconds: data.duration,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const lessonContentAPI = {
  async getByLessonId(lessonId: string): Promise<LessonContent[]> {
    // Here lessonId is subtopicId
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("subtopic_id", lessonId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToLessonContent);
  },

  async getByType(
    lessonId: string,
    contentType: string,
  ): Promise<LessonContent | null> {
    // lessonId is subtopicId
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("subtopic_id", lessonId)
      .eq("content_type", contentType)
      // .eq('is_active', true) // Allow inactive mainly for drafting
      .limit(1)
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) return null;
    return mapToLessonContent(data[0]);
  },

  async create(input: CreateLessonContentInput): Promise<LessonContent> {
    const { data, error } = await supabase
      .from("lessons")
      .insert([
        {
          subtopic_id: input.lessonId, // Mapping lessonId to subtopic_id
          content_type: input.contentType,
          title: input.title,
          content: input.contentText, // Mapping contentText to content
          video_url: input.contentUrl, // Assuming URL goes here if video
          podcast_url: input.contentUrl, // Or here if audio - simplistic mapping
          duration: input.durationSeconds,
          is_active: input.isActive ?? true,
          display_order: input.displayOrder ?? 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return mapToLessonContent(data);
  },

  async update(
    id: string,
    input: UpdateLessonContentInput,
  ): Promise<LessonContent> {
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.contentText !== undefined) updateData.content = input.contentText;
    if (input.contentUrl !== undefined) {
      // We don't know type here easily, but usually update is specific.
      // For text, URL is irrelevant. For now map to video_url as a catch-all if needed?
      // Or better: don't touch distinct columns unless we know.
      // Given usage in Text Tab, we mostly care about content.
      updateData.video_url = input.contentUrl;
    }
    if (input.durationSeconds !== undefined)
      updateData.duration = input.durationSeconds;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;
    if (input.displayOrder !== undefined)
      updateData.display_order = input.displayOrder;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("lessons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapToLessonContent(data);
  },

  async upsert(
    lessonId: string,
    contentType: string,
    input: Partial<CreateLessonContentInput>,
  ): Promise<LessonContent> {
    // Check if exists
    const existing = await this.getByType(lessonId, contentType);

    if (existing) {
      return this.update(existing.id, input);
    } else {
      // Create defaults if missing
      return this.create({
        lessonId,
        contentType: contentType as any,
        title: input.title || "Lesson Content",
        ...input,
      } as CreateLessonContentInput);
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) throw error;
  },
};
