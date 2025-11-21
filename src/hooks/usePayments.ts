import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { paymentsAPI } from '@/api/payments'
import type { PaymentFilters } from '@/types/payments'
import { ErrorHandler } from '@/utils/errorHandler'

export const usePayments = (filters?: PaymentFilters) => {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    data: payments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentsAPI.getPayments(filters),
  })

  const {
    data: summary,
    isLoading: summaryLoading,
  } = useQuery({
    queryKey: ['paymentsSummary', filters],
    queryFn: () => paymentsAPI.getPaymentsSummary(filters),
  })

  const refundMutation = useMutation({
    mutationFn: ({ paymentId, amount, reason }: { paymentId: string; amount?: number; reason?: string }) =>
      paymentsAPI.refundPayment(paymentId, { amount, reason, refundedBy: 'admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['paymentsSummary'] })
      enqueueSnackbar('Refund processed successfully!', { variant: 'success' })
    },
    onError: (error: Error) => {
      ErrorHandler.handle(error, 'Failed to process refund')
    },
  })

  return {
    payments,
    summary,
    isLoading,
    summaryLoading,
    error,
    refund: refundMutation.mutate,
    isRefunding: refundMutation.isPending,
  }
}
