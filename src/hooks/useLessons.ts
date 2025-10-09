import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonsAPI } from '@/api/lessons'
import { CreateLessonInput, UpdateLessonInput } from '@/types/content'
import { useSnackbar } from 'notistack'

export const useLessons = () => {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: lessonsAPI.getAll,
  })
}

export const useLessonsByTopic = (topicId: string) => {
  return useQuery({
    queryKey: ['lessons', 'topic', topicId],
    queryFn: () => lessonsAPI.getByTopicId(topicId),
    enabled: !!topicId,
  })
}

export const useLesson = (id: string) => {
  return useQuery({
    queryKey: ['lessons', id],
    queryFn: () => lessonsAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateLesson = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateLessonInput) => lessonsAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['lessons', 'topic', data.topicId] })
      enqueueSnackbar('Lesson created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create lesson', { variant: 'error' })
    },
  })
}

export const useUpdateLesson = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLessonInput }) =>
      lessonsAPI.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['lessons', 'topic', data.topicId] })
      if (data.topicId) {
        queryClient.invalidateQueries({ queryKey: ['lessons', 'topic'] })
      }
      enqueueSnackbar('Lesson updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update lesson', { variant: 'error' })
    },
  })
}

export const useDeleteLesson = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => lessonsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['lessons', 'topic'] })
      enqueueSnackbar('Lesson deleted successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete lesson', { variant: 'error' })
    },
  })
}
