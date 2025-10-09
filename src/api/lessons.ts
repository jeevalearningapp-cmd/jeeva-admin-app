import { supabase } from '@/lib/supabase'
import { Lesson, CreateLessonInput, UpdateLessonInput } from '@/types/content'

const mapToLesson = (data: any): Lesson => ({
  id: data.id,
  topicId: data.topic_id,
  title: data.title,
  content: data.content,
  videoUrl: data.video_url,
  duration: data.duration,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  topic: data.topics ? {
    id: data.topics.id,
    moduleId: data.topics.module_id,
    title: data.topics.title,
    description: data.topics.description,
    isActive: data.topics.is_active,
    displayOrder: data.topics.display_order,
    createdAt: data.topics.created_at,
    updatedAt: data.topics.updated_at
  } : undefined
})

export const lessonsAPI = {
  async getAll(): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, topics(*)')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToLesson)
  },

  async getByTopicId(topicId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, topics(*)')
      .eq('topic_id', topicId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToLesson)
  },

  async getById(id: string): Promise<Lesson> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, topics(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToLesson(data)
  },

  async create(input: CreateLessonInput): Promise<Lesson> {
    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        topic_id: input.topicId,
        title: input.title,
        content: input.content,
        video_url: input.videoUrl,
        duration: input.duration,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0
      }])
      .select('*, topics(*)')
      .single()

    if (error) throw error
    return mapToLesson(data)
  },

  async update(id: string, input: UpdateLessonInput): Promise<Lesson> {
    const updateData: any = {}
    if (input.topicId !== undefined) updateData.topic_id = input.topicId
    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.videoUrl !== undefined) updateData.video_url = input.videoUrl
    if (input.duration !== undefined) updateData.duration = input.duration
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

    const { data, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select('*, topics(*)')
      .single()

    if (error) throw error
    return mapToLesson(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
