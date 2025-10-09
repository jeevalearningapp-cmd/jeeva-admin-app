import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { topicsAPI } from '@/api/topics'
import { CreateTopicInput, UpdateTopicInput } from '@/types/content'
import { useSnackbar } from 'notistack'

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: topicsAPI.getAll,
  })
}

export const useTopicsByModule = (moduleId: string) => {
  return useQuery({
    queryKey: ['topics', 'module', moduleId],
    queryFn: () => topicsAPI.getByModuleId(moduleId),
    enabled: !!moduleId,
  })
}

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: ['topics', id],
    queryFn: () => topicsAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateTopic = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateTopicInput) => topicsAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      queryClient.invalidateQueries({ queryKey: ['topics', 'module', data.moduleId] })
      enqueueSnackbar('Topic created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create topic', { variant: 'error' })
    },
  })
}

export const useUpdateTopic = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTopicInput }) =>
      topicsAPI.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      queryClient.invalidateQueries({ queryKey: ['topics', 'module', data.moduleId] })
      if (data.moduleId) {
        queryClient.invalidateQueries({ queryKey: ['topics', 'module'] })
      }
      enqueueSnackbar('Topic updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update topic', { variant: 'error' })
    },
  })
}

export const useDeleteTopic = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => topicsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      queryClient.invalidateQueries({ queryKey: ['topics', 'module'] })
      enqueueSnackbar('Topic deleted successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete topic', { variant: 'error' })
    },
  })
}
