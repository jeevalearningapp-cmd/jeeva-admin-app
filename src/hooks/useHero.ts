import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { heroAPI } from '@/api/hero'
import { CreateHeroInput, UpdateHeroInput } from '@/types/hero'
import { useSnackbar } from 'notistack'

export const useHeroSections = () => {
  return useQuery({
    queryKey: ['hero-sections'],
    queryFn: heroAPI.getAll,
  })
}

export const useHeroSection = (id: string) => {
  return useQuery({
    queryKey: ['hero-sections', id],
    queryFn: () => heroAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateHero = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (input: CreateHeroInput) => heroAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] })
      enqueueSnackbar('Hero section created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to create hero section', { variant: 'error' })
    },
  })
}

export const useUpdateHero = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHeroInput }) =>
      heroAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] })
      enqueueSnackbar('Hero section updated successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to update hero section', { variant: 'error' })
    },
  })
}

export const useDeleteHero = () => {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (id: string) => heroAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-sections'] })
      enqueueSnackbar('Hero section deleted successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to delete hero section', { variant: 'error' })
    },
  })
}

export const useUploadHeroImage = () => {
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (file: File) => heroAPI.uploadImage(file),
    onError: (error: any) => {
      enqueueSnackbar(error.message || 'Failed to upload image', { variant: 'error' })
    },
  })
}
