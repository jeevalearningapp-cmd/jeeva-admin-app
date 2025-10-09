import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { approvalsAPI } from '@/api'
import { ApprovalsFilters, CreateApprovalInput, ReviewApprovalInput } from '@/types/approval'

export const useApprovals = (filters?: ApprovalsFilters) => {
  return useQuery({
    queryKey: ['approvals', filters],
    queryFn: () => approvalsAPI.getAll(filters || {}),
  })
}

export const useApproval = (id: string) => {
  return useQuery({
    queryKey: ['approvals', id],
    queryFn: () => approvalsAPI.getById(id),
    enabled: !!id,
  })
}

export const useApprovalStats = () => {
  return useQuery({
    queryKey: ['approvals', 'stats'],
    queryFn: () => approvalsAPI.getStats(),
  })
}

export const useCreateApproval = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateApprovalInput) => approvalsAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      enqueueSnackbar('Content submitted for approval', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to submit for approval', { variant: 'error' })
    },
  })
}

export const useReviewApproval = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: ReviewApprovalInput) => approvalsAPI.review(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      const message = data.status === 'approved' 
        ? 'Content approved successfully' 
        : 'Content rejected'
      enqueueSnackbar(message, { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to review content', { variant: 'error' })
    },
  })
}

export const useDeleteApproval = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => approvalsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      enqueueSnackbar('Approval request deleted', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete approval', { variant: 'error' })
    },
  })
}
