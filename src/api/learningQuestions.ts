import { supabase } from '@/lib/supabase'

export interface LearningQuestionOption {
  id: string
  questionId: string
  optionText: string
  isCorrect: boolean
  displayOrder: number
}

export interface LearningQuestion {
  id: string
  topicId: string
  subtopicId: string
  videoLessonId: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  explanation?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  options?: LearningQuestionOption[]
}

export interface CreateLearningQuestionInput {
  topicId: string
  subtopicId: string
  videoLessonId: string
  questionText: string
  questionType: 'multiple_choice' | 'true_false'
  difficulty: 'easy' | 'medium' | 'hard'
  points?: number
  explanation?: string
  imageUrl?: string
  isActive?: boolean
  options: {
    optionText: string
    isCorrect: boolean
    displayOrder: number
  }[]
}

export interface UpdateLearningQuestionInput {
  questionText?: string
  questionType?: 'multiple_choice' | 'true_false'
  difficulty?: 'easy' | 'medium' | 'hard'
  points?: number
  explanation?: string
  imageUrl?: string
  isActive?: boolean
}

const mapToQuestion = (data: any): LearningQuestion => ({
  id: data.id,
  topicId: data.topic_id,
  subtopicId: data.subtopic_id,
  videoLessonId: data.video_lesson_id,
  questionText: data.question_text,
  questionType: data.question_type,
  difficulty: data.difficulty,
  points: data.points,
  explanation: data.explanation,
  imageUrl: data.image_url,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

const mapToOption = (data: any): LearningQuestionOption => ({
  id: data.id,
  questionId: data.question_id,
  optionText: data.option_text,
  isCorrect: data.is_correct,
  displayOrder: data.display_order,
})

export const learningQuestionsAPI = {
  async getByVideoLessonId(videoLessonId: string): Promise<LearningQuestion[]> {
    const { data, error } = await supabase
      .from('learning_questions')
      .select('*, learning_question_options(*)')
      .eq('video_lesson_id', videoLessonId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []).map((q) => ({
      ...mapToQuestion(q),
      options: (q.learning_question_options || []).map(mapToOption),
    }))
  },

  async getById(id: string): Promise<LearningQuestion> {
    const { data, error } = await supabase
      .from('learning_questions')
      .select('*, learning_question_options(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return {
      ...mapToQuestion(data),
      options: (data.learning_question_options || []).map(mapToOption),
    }
  },

  async create(input: CreateLearningQuestionInput): Promise<LearningQuestion> {
    // Create question
    const { data: questionData, error: questionError } = await supabase
      .from('learning_questions')
      .insert([{
        topic_id: input.topicId,
        subtopic_id: input.subtopicId,
        video_lesson_id: input.videoLessonId,
        question_text: input.questionText,
        question_type: input.questionType,
        difficulty: input.difficulty,
        points: input.points ?? 1,
        explanation: input.explanation,
        image_url: input.imageUrl,
        is_active: input.isActive ?? true,
      }])
      .select()
      .single()

    if (questionError) throw questionError

    // Create options
    const optionsToInsert = input.options.map((opt) => ({
      question_id: questionData.id,
      option_text: opt.optionText,
      is_correct: opt.isCorrect,
      display_order: opt.displayOrder,
    }))

    const { data: optionsData, error: optionsError } = await supabase
      .from('learning_question_options')
      .insert(optionsToInsert)
      .select()

    if (optionsError) throw optionsError

    return {
      ...mapToQuestion(questionData),
      options: (optionsData || []).map(mapToOption),
    }
  },

  async update(id: string, input: UpdateLearningQuestionInput): Promise<LearningQuestion> {
    const updateData: any = {}
    if (input.questionText !== undefined) updateData.question_text = input.questionText
    if (input.questionType !== undefined) updateData.question_type = input.questionType
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty
    if (input.points !== undefined) updateData.points = input.points
    if (input.explanation !== undefined) updateData.explanation = input.explanation
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl
    if (input.isActive !== undefined) updateData.is_active = input.isActive

    const { data, error } = await supabase
      .from('learning_questions')
      .update(updateData)
      .eq('id', id)
      .select('*, learning_question_options(*)')
      .single()

    if (error) throw error
    return {
      ...mapToQuestion(data),
      options: (data.learning_question_options || []).map(mapToOption),
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('learning_questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async updateOptions(
    questionId: string,
    options: { optionText: string; isCorrect: boolean; displayOrder: number }[]
  ): Promise<void> {
    // Delete existing options
    await supabase
      .from('learning_question_options')
      .delete()
      .eq('question_id', questionId)

    // Insert new options
    const optionsToInsert = options.map((opt) => ({
      question_id: questionId,
      option_text: opt.optionText,
      is_correct: opt.isCorrect,
      display_order: opt.displayOrder,
    }))

    const { error } = await supabase
      .from('learning_question_options')
      .insert(optionsToInsert)

    if (error) throw error
  },
}
