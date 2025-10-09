import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { DashboardHero } from '@/types/dashboard'

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  })
}

export const useDashboardAnalyticsData = () => {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: dashboardApi.getAnalyticsData,
  })
}

export const useDashboardHeroes = () => {
  return useQuery({
    queryKey: ['dashboard-heroes'],
    queryFn: dashboardApi.getDashboardHeroes,
  })
}

export const useCreateDashboardHero = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hero: Omit<DashboardHero, 'id' | 'created_at' | 'updated_at'>) =>
      dashboardApi.createDashboardHero(hero),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-heroes'] })
    },
  })
}

export const useUpdateDashboardHero = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DashboardHero> }) =>
      dashboardApi.updateDashboardHero(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-heroes'] })
    },
  })
}

export const useDeleteDashboardHero = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteDashboardHero(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-heroes'] })
    },
  })
}
