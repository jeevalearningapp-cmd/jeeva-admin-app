import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsersApi } from '@/api'
import { AdminUser } from '@/types'

export const useAdminUsers = (params?: { 
  search?: string
  role?: string
  page?: number
  limit?: number 
}) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminUsersApi.getAdminUsers(params),
  })
}

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => adminUsersApi.getAdminUserById(id),
    enabled: !!id,
  })
}

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (adminUserData: Partial<AdminUser>) => 
      adminUsersApi.createAdminUser(adminUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })
}

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      adminUsersApi.updateAdminUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminUser', variables.id] })
    },
  })
}

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUsersApi.updateAdminUserStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminUser', variables.id] })
    },
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminUsersApi.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
  })
}
