import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { emailTemplatesAPI } from '@/api/email'
import type { EmailTemplate } from '@/types'
import { ErrorHandler } from '@/utils/errorHandler'

export const useEmailTemplates = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: emailTemplatesAPI.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
      emailTemplatesAPI.create(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] })
      enqueueSnackbar('Template created successfully!', { variant: 'success' })
    },
    onError: (error: Error) => {
      ErrorHandler.handle(error, 'Failed to create template')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, template }: { id: string; template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      emailTemplatesAPI.update(id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] })
      enqueueSnackbar('Template updated successfully!', { variant: 'success' })
    },
    onError: (error: Error) => {
      ErrorHandler.handle(error, 'Failed to update template')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailTemplatesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] })
      enqueueSnackbar('Template deleted successfully!', { variant: 'success' })
    },
    onError: (error: Error) => {
      ErrorHandler.handle(error, 'Failed to delete template')
    },
  })

  return {
    templates,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
