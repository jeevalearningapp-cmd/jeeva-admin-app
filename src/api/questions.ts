import { supabase } from '@/lib/supabase'
import { Question, QuestionOption, CreateQuestionInput, UpdateQuestionInput } from '@/types/content'

const mapToQuestion = (data: any): Question => ({
  id: data.id,
  lessonId: data.lesson_id,
  questionText: data.question_text,
  questionType: data.question_type,
  difficulty: data.difficulty,
  points: data.points,
  explanation: data.explanation,
  imageUrl: data.image_url,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  options: data.question_options ? data.question_options.map((opt: any) => ({
    id: opt.id,
    questionId: opt.question_id,
    optionText: opt.option_text,
    isCorrect: opt.is_correct,
    displayOrder: opt.display_order
  })) : []
})

export const questionsAPI = {
  async getAll(): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapToQuestion)
  },

  async getByLessonId(lessonId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapToQuestion)
  },

  async getById(id: string): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return mapToQuestion(data)
  },

  async create(input: CreateQuestionInput): Promise<Question> {
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert([{
        lesson_id: input.lessonId,
        question_text: input.questionText,
        question_type: input.questionType,
        difficulty: input.difficulty,
        points: input.points ?? 1,
        explanation: input.explanation,
        image_url: input.imageUrl,
        is_active: input.isActive ?? true
      }])
      .select()
      .single()

    if (questionError) throw questionError

    if (input.options && input.options.length > 0) {
      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(input.options.map(opt => ({
          question_id: question.id,
          option_text: opt.optionText,
          is_correct: opt.isCorrect,
          display_order: opt.displayOrder
        })))

      if (optionsError) throw optionsError
    }

    return questionsAPI.getById(question.id)
  },

  async update(id: string, input: UpdateQuestionInput): Promise<Question> {
    const updateData: any = {}
    if (input.lessonId !== undefined) updateData.lesson_id = input.lessonId
    if (input.questionText !== undefined) updateData.question_text = input.questionText
    if (input.questionType !== undefined) updateData.question_type = input.questionType
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty
    if (input.points !== undefined) updateData.points = input.points
    if (input.explanation !== undefined) updateData.explanation = input.explanation
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select('*, question_options(*)')
      .single()

    if (error) throw error
    return mapToQuestion(data)
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(fileName, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }
}
