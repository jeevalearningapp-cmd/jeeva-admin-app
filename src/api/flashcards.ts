import { supabase } from '@/lib/supabase'
import { Flashcard, CreateFlashcardInput, UpdateFlashcardInput } from '@/types/content'

const mapToFlashcard = (data: any): Flashcard => ({
  id: data.id,
  lessonId: data.lesson_id,
  category: data.category,
  front: data.front,
  back: data.back,
  imageUrl: data.image_url,
  isActive: data.is_active,
  displayOrder: data.display_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at
})

export const flashcardsAPI = {
  async getAll(): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToFlashcard)
  },

  async getByLessonId(lessonId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToFlashcard)
  },

  async getByCategory(category: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('category', category)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data || []).map(mapToFlashcard)
  },

  async getById(id: string): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToFlashcard(data)
  },

  async create(input: CreateFlashcardInput): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([{
        lesson_id: input.lessonId,
        category: input.category,
        front: input.front,
        back: input.back,
        image_url: input.imageUrl,
        is_active: input.isActive ?? true,
        display_order: input.displayOrder ?? 0
      }])
      .select()
      .single()

    if (error) throw error
    return mapToFlashcard(data)
  },

  async update(id: string, input: UpdateFlashcardInput): Promise<Flashcard> {
    const updateData: any = {}
    if (input.lessonId !== undefined) updateData.lesson_id = input.lessonId
    if (input.category !== undefined) updateData.category = input.category
    if (input.front !== undefined) updateData.front = input.front
    if (input.back !== undefined) updateData.back = input.back
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive
    if (input.displayOrder !== undefined) updateData.display_order = input.displayOrder

    const { data, error } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToFlashcard(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('flashcard-images')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('flashcard-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }
}
