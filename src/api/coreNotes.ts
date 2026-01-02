import { supabase } from '@/lib/supabase'

export interface CoreNoteSection {
  title: string
  content: string
  order: number
}

export interface TopicCoreNotes {
  id: string
  topicId: string
  content: string
  sections: CoreNoteSection[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCoreNotesInput {
  topicId: string
  content?: string
  sections?: CoreNoteSection[]
  isActive?: boolean
}

export interface UpdateCoreNotesInput {
  content?: string
  sections?: CoreNoteSection[]
  isActive?: boolean
}

const mapToCoreNotes = (data: any): TopicCoreNotes => ({
  id: data.id,
  topicId: data.topic_id,
  content: data.content || '',
  sections: data.sections || [],
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

export const coreNotesAPI = {
  async getByTopicId(topicId: string): Promise<TopicCoreNotes | null> {
    const { data, error } = await supabase
      .from('topic_core_notes')
      .select('*')
      .eq('topic_id', topicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }
    return mapToCoreNotes(data)
  },

  async create(input: CreateCoreNotesInput): Promise<TopicCoreNotes> {
    const { data, error } = await supabase
      .from('topic_core_notes')
      .insert([{
        topic_id: input.topicId,
        content: input.content || '',
        sections: input.sections || [],
        is_active: input.isActive ?? true,
      }])
      .select()
      .single()

    if (error) throw error
    return mapToCoreNotes(data)
  },

  async update(topicId: string, input: UpdateCoreNotesInput): Promise<TopicCoreNotes> {
    const updateData: any = {}
    if (input.content !== undefined) updateData.content = input.content
    if (input.sections !== undefined) updateData.sections = input.sections
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data, error } = await supabase
      .from('topic_core_notes')
      .update(updateData)
      .eq('topic_id', topicId)
      .select()
      .single()

    if (error) throw error
    return mapToCoreNotes(data)
  },

  async delete(topicId: string): Promise<void> {
    const { error } = await supabase
      .from('topic_core_notes')
      .delete()
      .eq('topic_id', topicId)

    if (error) throw error
  },
}
