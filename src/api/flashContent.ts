import { supabase } from '@/lib/supabase'

export interface TopicFlashContent {
  id: string
  topicId: string
  screenNumber: number
  title: string
  content: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFlashContentInput {
  topicId: string
  screenNumber: number
  title: string
  content: string
  imageUrl?: string
  isActive?: boolean
}

export interface UpdateFlashContentInput {
  title?: string
  content?: string
  imageUrl?: string
  isActive?: boolean
}

const mapToFlashContent = (data: any): TopicFlashContent => ({
  id: data.id,
  topicId: data.topic_id,
  screenNumber: data.screen_number,
  title: data.title,
  content: data.content,
  imageUrl: data.image_url,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export const flashContentAPI = {
  async getByTopicId(topicId: string): Promise<TopicFlashContent[]> {
    const { data, error } = await supabase
      .from('topic_flash_content')
      .select('*')
      .eq('topic_id', topicId)
      .order('screen_number', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToFlashContent)
  },

  async create(input: CreateFlashContentInput): Promise<TopicFlashContent> {
    const { data, error } = await supabase
      .from('topic_flash_content')
      .insert([{
        topic_id: input.topicId,
        screen_number: input.screenNumber,
        title: input.title,
        content: input.content,
        image_url: input.imageUrl,
        is_active: input.isActive ?? true,
      }])
      .select()
      .single()

    if (error) throw error
    return mapToFlashContent(data)
  },

  async update(
    topicId: string,
    screenNumber: number,
    input: UpdateFlashContentInput
  ): Promise<TopicFlashContent> {
    const updateData: any = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data, error } = await supabase
      .from('topic_flash_content')
      .update(updateData)
      .eq('topic_id', topicId)
      .eq('screen_number', screenNumber)
      .select()
      .single()

    if (error) throw error
    return mapToFlashContent(data)
  },

  async delete(topicId: string, screenNumber: number): Promise<void> {
    const { error } = await supabase
      .from('topic_flash_content')
      .delete()
      .eq('topic_id', topicId)
      .eq('screen_number', screenNumber)

    if (error) throw error
  },

  async createPlaceholders(topicId: string): Promise<TopicFlashContent[]> {
    const placeholders = Array.from({ length: 5 }, (_, i) => ({
      topic_id: topicId,
      screen_number: i + 1,
      title: `Screen ${i + 1}`,
      content: '',
      is_active: true,
    }))

    const { data, error } = await supabase
      .from('topic_flash_content')
      .insert(placeholders)
      .select()

    if (error) throw error
    return (data || []).map(mapToFlashContent)
  },
}
