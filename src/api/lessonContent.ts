import { supabase } from '@/lib/supabase'

export interface LessonContent {
    id: string
    lessonId: string
    contentType: 'video' | 'audio' | 'text' | 'flashcard' | 'mcq' | 'assessment'
    title: string
    description?: string
    displayOrder: number
    contentUrl?: string
    contentText?: string
    contentData?: any
    durationSeconds?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateLessonContentInput {
    lessonId: string
    contentType: 'video' | 'audio' | 'text' | 'flashcard' | 'mcq' | 'assessment'
    title: string
    description?: string
    displayOrder?: number
    contentUrl?: string
    contentText?: string
    contentData?: any
    durationSeconds?: number
    isActive?: boolean
}

export interface UpdateLessonContentInput {
    title?: string
    description?: string
    displayOrder?: number
    contentUrl?: string
    contentText?: string
    contentData?: any
    durationSeconds?: number
    isActive?: boolean
}

const mapToLessonContent = (data: any): LessonContent => ({
    id: data.id,
    lessonId: data.lesson_id,
    contentType: data.content_type,
    title: data.title,
    description: data.description,
    displayOrder: data.display_order,
    contentUrl: data.content_url,
    contentText: data.content_text,
    contentData: data.content_data,
    durationSeconds: data.duration_seconds,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
})

export const lessonContentAPI = {
    async getByLessonId(lessonId: string): Promise<LessonContent[]> {
        const { data, error } = await supabase
            .from('lesson_content')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (error) throw error
        return (data || []).map(mapToLessonContent)
    },

    async getByType(lessonId: string, contentType: string): Promise<LessonContent | null> {
        const { data, error } = await supabase
            .from('lesson_content')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('content_type', contentType)
            .eq('is_active', true)
            .limit(1)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return mapToLessonContent(data)
    },

    async create(input: CreateLessonContentInput): Promise<LessonContent> {
        const { data, error } = await supabase
            .from('lesson_content')
            .insert([{
                lesson_id: input.lessonId,
                content_type: input.contentType,
                title: input.title,
                description: input.description,
                display_order: input.displayOrder ?? 0,
                content_url: input.contentUrl,
                content_text: input.contentText,
                content_data: input.contentData,
                duration_seconds: input.durationSeconds,
                is_active: input.isActive ?? true,
            }])
            .select()
            .single()

        if (error) throw error
        return mapToLessonContent(data)
    },

    async update(id: string, input: UpdateLessonContentInput): Promise<LessonContent> {
        const updateData: any = {}
        if (input.title !== undefined) updateData.title = input.title
        if (input.description !== undefined) updateData.description = input.description
        if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder
        if (input.contentUrl !== undefined) updateData.content_url = input.contentUrl
        if (input.contentText !== undefined) updateData.content_text = input.contentText
        if (input.contentData !== undefined) updateData.content_data = input.contentData
        if (input.durationSeconds !== undefined) updateData.duration_seconds = input.durationSeconds
        if (input.isActive !== undefined) updateData.is_active = input.isActive
        updateData.updated_at = new Date().toISOString()

        const { data, error } = await supabase
            .from('lesson_content')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return mapToLessonContent(data)
    },

    async upsert(lessonId: string, contentType: string, input: Partial<CreateLessonContentInput>): Promise<LessonContent> {
        // Check if exists
        const existing = await this.getByType(lessonId, contentType)

        if (existing) {
            return this.update(existing.id, input)
        } else {
            // Create defaults if missing
            return this.create({
                lessonId,
                contentType: contentType as any,
                title: input.title || 'Lesson Content',
                ...input
            } as CreateLessonContentInput)
        }
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('lesson_content')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
