import { supabase } from '@/lib/supabase'

export interface Subtopic {
  id: string
  topicId: string
  title: string
  description: string
  videoUrl?: string
  podcastUrl?: string
  duration?: number
  isMandatory: boolean
  contentType: 'video' | 'audio' | 'text'
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateSubtopicInput {
  topicId: string
  title: string
  description: string
  videoUrl?: string
  podcastUrl?: string
  duration?: number
  isMandatory?: boolean
  contentType?: 'video' | 'audio' | 'text'
  isActive?: boolean
  displayOrder?: number
}

export interface UpdateSubtopicInput {
  title?: string
  description?: string
  videoUrl?: string
  podcastUrl?: string
  duration?: number
  isMandatory?: boolean
  contentType?: 'video' | 'audio' | 'text'
  isActive?: boolean
  displayOrder?: number
}

export interface SubtopicValidationStatus {
  hasVideo: boolean
  hasPodcast: boolean
  mcqCount: number
  isValid: boolean
  errors: string[]
}

const mapToSubtopic = (data: any): Subtopic => {
  // Find specific content types from the joined lesson_content array
  const videoContent = data.lesson_content?.find((c: any) => c.content_type === 'video')
  const textContent = data.lesson_content?.find((c: any) => c.content_type === 'text')
  const audioContent = data.lesson_content?.find((c: any) => c.content_type === 'audio')

  return {
    id: data.id,
    topicId: data.topic_id,
    title: data.title,
    // Use text content as description if available, fallback to lesson column
    description: textContent?.content_text || data.content || data.description || '',
    // Use video content URL if available, fallback to lesson column
    videoUrl: videoContent?.content_url || data.video_url,
    podcastUrl: audioContent?.content_url || data.podcast_url,
    duration: videoContent?.duration_seconds || data.duration,
    isMandatory: data.is_mandatory ?? true,
    contentType: data.content_type || 'video',
    isActive: data.is_active,
    displayOrder: data.display_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export const subtopicsAPI = {
  async getByTopicId(topicId: string): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, lesson_content(*)')
      .eq('topic_id', topicId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToSubtopic)
  },

  async getById(id: string): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, lesson_content(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToSubtopic(data)
  },

  async create(input: CreateSubtopicInput): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('lessons')
      .insert([{
        topic_id: input.topicId,
        title: input.title,
        content: input.description,
        video_url: input.videoUrl,
        podcast_url: input.podcastUrl,
        duration: input.duration,
        is_mandatory: input.isMandatory ?? true,
        content_type: input.contentType || 'video',
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0,
      }])
      .select()
      .single()

    if (error) throw error
    return mapToSubtopic(data)
  },

  async update(id: string, input: UpdateSubtopicInput): Promise<Subtopic> {
    const updateData: any = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.content = input.description
    if (input.videoUrl !== undefined) updateData.video_url = input.videoUrl
    if (input.podcastUrl !== undefined) updateData.podcast_url = input.podcastUrl
    if (input.duration !== undefined) updateData.duration = input.duration
    if (input.isMandatory !== undefined) updateData.is_mandatory = input.isMandatory
    if (input.contentType !== undefined) updateData.content_type = input.contentType
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

    const { data, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToSubtopic(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getValidationStatus(id: string): Promise<SubtopicValidationStatus> {
    // Get subtopic
    const subtopic = await this.getById(id)

    // Get MCQ count for this subtopic
    const { count, error } = await supabase
      .from('learning_questions')
      .select('*', { count: 'exact', head: true })
      .eq('video_lesson_id', id)
      .eq('is_active', true)

    if (error) throw error

    const mcqCount = count || 0
    const hasVideo = !!subtopic.videoUrl
    const hasPodcast = !!subtopic.podcastUrl

    const errors: string[] = []
    if (!hasVideo) {
      errors.push('Mandatory video lesson required')
    }
    if (mcqCount < 5) {
      errors.push(`At least 5 MCQs required (currently: ${mcqCount})`)
    }
    if (mcqCount > 10) {
      errors.push(`Maximum 10 MCQs allowed (currently: ${mcqCount})`)
    }

    const isValid = hasVideo && mcqCount >= 5 && mcqCount <= 10

    return {
      hasVideo,
      hasPodcast,
      mcqCount,
      isValid,
      errors,
    }
  },
}
