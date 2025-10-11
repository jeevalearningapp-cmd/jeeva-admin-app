import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSnackbar } from 'notistack'

interface BulkUploadOptions {
  table: string
  data: Record<string, any>[]
  requiredFields?: string[]
  transformData?: (item: Record<string, any>) => Record<string, any>
}

export const useBulkUpload = () => {
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const uploadBulk = async (options: BulkUploadOptions): Promise<boolean> => {
    const { table, data, requiredFields = [], transformData } = options

    setLoading(true)
    try {
      // Transform data if transformer provided
      const transformedData = transformData 
        ? data.map(transformData)
        : data

      // Validate required fields
      for (const item of transformedData) {
        for (const field of requiredFields) {
          if (!item[field]) {
            throw new Error(`Missing required field: ${field}`)
          }
        }
      }

      // Insert in batches of 100 for better performance
      const batchSize = 100
      let successCount = 0

      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batch = transformedData.slice(i, i + batchSize)
        
        const { error } = await supabase
          .from(table)
          .insert(batch)

        if (error) {
          throw error
        }

        successCount += batch.length
      }

      enqueueSnackbar(`Successfully uploaded ${successCount} items`, {
        variant: 'success'
      })

      return true
    } catch (error: any) {
      console.error('Bulk upload error:', error)
      enqueueSnackbar(error.message || 'Bulk upload failed', {
        variant: 'error'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const uploadLessons = async (data: Record<string, any>[], topicId: string) => {
    return uploadBulk({
      table: 'lessons',
      data,
      requiredFields: ['title', 'content'],
      transformData: (item) => ({
        topic_id: topicId,
        title: item.title,
        content: item.content,
        video_url: item.video_url || null,
        audio_url: item.audio_url || null,
        duration: item.duration ? parseInt(item.duration) : null,
        is_active: true,
        display_order: 0
      })
    })
  }

  const uploadQuestions = async (data: Record<string, any>[], lessonId?: string) => {
    setLoading(true)
    
    try {
      const questionsData: any[] = []
      const optionsData: any[] = []

      // Process questions and collect options
      for (const item of data) {
        const questionId = crypto.randomUUID()
        const questionType = item.question_type
        
        questionsData.push({
          id: questionId,
          lesson_id: lessonId || null,
          question_text: item.question_text,
          question_type: questionType,
          difficulty: item.difficulty,
          points: parseInt(item.points) || 1,
          explanation: item.explanation || null,
          image_url: item.image_url || null,
          is_active: true
        })

        // Only collect options for multiple_choice and true_false
        if (questionType === 'multiple_choice' || questionType === 'true_false') {
          for (let i = 1; i <= 4; i++) {
            const optionText = item[`option_${i}`]
            const isCorrect = item[`option_${i}_correct`]?.toLowerCase() === 'true'

            if (optionText) {
              optionsData.push({
                question_id: questionId,
                option_text: optionText,
                is_correct: isCorrect,
                display_order: i - 1
              })
            }
          }
        } else if (questionType === 'short_answer') {
          // For short_answer, option_1 is the correct answer
          if (item.option_1) {
            optionsData.push({
              question_id: questionId,
              option_text: item.option_1,
              is_correct: true,
              display_order: 0
            })
          }
        }
      }

      // Insert questions and options in a single transaction-like operation
      // First, insert questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData)

      if (questionsError) {
        throw new Error(`Failed to insert questions: ${questionsError.message}`)
      }

      // Then insert options if any
      if (optionsData.length > 0) {
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsData)

        if (optionsError) {
          // Rollback: delete the questions we just created
          const questionIds = questionsData.map(q => q.id)
          const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .in('id', questionIds)
          
          if (deleteError) {
            console.error('Rollback failed - orphaned questions:', questionIds, deleteError)
            throw new Error(
              `Failed to insert options AND rollback failed. Orphaned question IDs: ${questionIds.join(', ')}. ` +
              `Please manually delete these questions. Error: ${optionsError.message}`
            )
          }
          
          throw new Error(`Failed to insert options: ${optionsError.message}`)
        }
      }

      enqueueSnackbar(`Successfully uploaded ${questionsData.length} questions with ${optionsData.length} options`, {
        variant: 'success'
      })

      return true
    } catch (error: any) {
      console.error('Upload questions error:', error)
      enqueueSnackbar(error.message || 'Failed to upload questions', {
        variant: 'error'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const uploadFlashcards = async (data: Record<string, any>[], lessonId: string) => {
    return uploadBulk({
      table: 'flashcards',
      data,
      requiredFields: ['front', 'back'],
      transformData: (item) => ({
        lesson_id: lessonId,
        front: item.front,
        back: item.back,
        image_url: item.image_url || null,
        is_active: true,
        display_order: 0
      })
    })
  }

  return {
    loading,
    uploadBulk,
    uploadLessons,
    uploadQuestions,
    uploadFlashcards
  }
}
