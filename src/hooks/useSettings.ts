import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { getSettings, updateSettings } from '@/api/settings'
import type { UpdateSettingsInput } from '@/types'
import { ErrorHandler } from '@/utils/errorHandler'

export const useSettings = () => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSettingsInput }) =>
      updateSettings(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      enqueueSnackbar('Settings saved successfully!', { variant: 'success' })
    },
    onError: (error: Error) => {
      ErrorHandler.handle(
        error,
        'Failed to save settings. Please check your permissions and try again.'
      )
    },
  })

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  }
}
