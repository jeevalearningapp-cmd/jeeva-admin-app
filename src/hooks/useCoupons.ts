import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponsAPI } from '@/api/coupons'
import { CreateCouponInput, UpdateCouponInput } from '@/types/coupon'
import { useSnackbar } from 'notistack'

export const useCoupons = (filters?: { active_only?: boolean; search?: string }) => {
  return useQuery({
    queryKey: ['coupons', filters],
    queryFn: () => couponsAPI.getAll(filters),
  })
}

export const useActiveCouponsWithStats = () => {
  return useQuery({
    queryKey: ['coupons', 'active-stats'],
    queryFn: () => couponsAPI.getActiveWithStats(),
  })
}

export const useCoupon = (id: string) => {
  return useQuery({
    queryKey: ['coupons', id],
    queryFn: () => couponsAPI.getById(id),
    enabled: !!id,
  })
}

export const useCouponByCode = (code: string) => {
  return useQuery({
    queryKey: ['coupons', 'code', code],
    queryFn: () => couponsAPI.getByCode(code),
    enabled: !!code && code.length > 0,
  })
}

export const useCreateCoupon = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateCouponInput) => couponsAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      enqueueSnackbar('Coupon created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create coupon', { variant: 'error' })
    },
  })
}

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCouponInput }) =>
      couponsAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      enqueueSnackbar('Coupon updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update coupon', { variant: 'error' })
    },
  })
}

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => couponsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      enqueueSnackbar('Coupon deleted successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete coupon', { variant: 'error' })
    },
  })
}

export const useValidateCoupon = () => {
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ code, planId }: { code: string; planId?: string }) =>
      couponsAPI.validate(code, planId),
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to validate coupon', { variant: 'error' })
    },
  })
}
