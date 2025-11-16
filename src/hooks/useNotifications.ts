import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '@/api/notifications'
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationFilters,
  NotificationStats,
  UserTargetingOption,
} from '@/types/notifications'
import { useSnackbar } from 'notistack'

export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsAPI.getNotifications(filters),
  })
}

export const useNotification = (id: string) => {
  return useQuery({
    queryKey: ['notifications', id],
    queryFn: () => notificationsAPI.getNotificationById(id),
    enabled: !!id,
  })
}

export const useNotificationStats = (id: string) => {
  return useQuery({
    queryKey: ['notifications', id, 'stats'],
    queryFn: () => notificationsAPI.getNotificationStats(id),
    enabled: !!id,
  })
}

export const useUserTargetingOptions = () => {
  return useQuery({
    queryKey: ['notifications', 'targeting-options'],
    queryFn: () => notificationsAPI.getUserTargetingOptions(),
  })
}

export const useCreateNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateNotificationInput) =>
      notificationsAPI.createNotification(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Notification created successfully', { variant: 'success' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to create notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}

export const useUpdateNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNotificationInput }) =>
      notificationsAPI.updateNotification(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Notification updated successfully', { variant: 'success' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to update notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Notification deleted successfully', { variant: 'success' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to delete notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}

export const useScheduleNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      notificationsAPI.scheduleNotification(id, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Notification scheduled successfully', { variant: 'success' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to schedule notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}

export const useCancelNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.cancelScheduledNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Notification cancelled successfully', { variant: 'success' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to cancel notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}

export const useRetryNotification = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.retryFailedNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      enqueueSnackbar('Retrying failed deliveries...', { variant: 'info' })
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Failed to retry notification: ${error.message}`, {
        variant: 'error',
      })
    },
  })
}
