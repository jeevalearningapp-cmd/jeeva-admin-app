import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsAPI } from '@/api/questions'
import { CreateQuestionInput, UpdateQuestionInput } from '@/types/content'
import { useSnackbar } from 'notistack'

export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: questionsAPI.getAll,
  })
}

export const useQuestionsByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ['questions', 'lesson', lessonId],
    queryFn: () => questionsAPI.getByLessonId(lessonId),
    enabled: !!lessonId,
  })
}

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => questionsAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateQuestion = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateQuestionInput) => questionsAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['questions', 'lesson', data.lessonId] })
      }
      enqueueSnackbar('Question created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create question', { variant: 'error' })
    },
  })
}

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuestionInput }) =>
      questionsAPI.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['questions', 'lesson', data.lessonId] })
      }
      enqueueSnackbar('Question updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update question', { variant: 'error' })
    },
  })
}

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => questionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      enqueueSnackbar('Question deleted successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete question', { variant: 'error' })
    },
  })
}

export const useUploadQuestionImage = () => {
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (file: File) => questionsAPI.uploadImage(file),
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to upload image', { variant: 'error' })
    },
  })
}
