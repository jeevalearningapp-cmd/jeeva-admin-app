import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockQuestionsAPI, CreateMockQuestionInput, UpdateMockQuestionInput } from '@/api/mockQuestions'
import { useSnackbar } from 'notistack'

export const useMockQuestions = (examPart: 'part_a' | 'part_b') => {
    return useQuery({
        queryKey: ['mock-questions', examPart],
        queryFn: () => mockQuestionsAPI.getByPart(examPart),
        enabled: !!examPart,
    })
}

export const useMockQuestion = (id: string) => {
    return useQuery({
        queryKey: ['mock-questions', id],
        queryFn: () => mockQuestionsAPI.getById(id),
        enabled: !!id,
    })
}

export const useCreateMockQuestion = () => {
    const queryClient = useQueryClient()
    const { enqueueSnackbar } = useSnackbar()

    return useMutation({
        mutationFn: (input: CreateMockQuestionInput) => mockQuestionsAPI.create(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['mock-questions', data.examPart]
            })
            enqueueSnackbar('Mock question created successfully', { variant: 'success' })
        },
        onError: (error: any) => {
            enqueueSnackbar(error.message || 'Failed to create mock question', { variant: 'error' })
        },
    })
}

export const useUpdateMockQuestion = () => {
    const queryClient = useQueryClient()
    const { enqueueSnackbar } = useSnackbar()

    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateMockQuestionInput }) =>
            mockQuestionsAPI.update(id, input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['mock-questions'] })
            enqueueSnackbar('Mock question updated successfully', { variant: 'success' })
        },
        onError: (error: any) => {
            enqueueSnackbar(error.message || 'Failed to update mock question', { variant: 'error' })
        },
    })
}

export const useDeleteMockQuestion = () => {
    const queryClient = useQueryClient()
    const { enqueueSnackbar } = useSnackbar()

    return useMutation({
        mutationFn: (id: string) => mockQuestionsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mock-questions'] })
            enqueueSnackbar('Mock question deleted successfully', { variant: 'success' })
        },
        onError: (error: any) => {
            enqueueSnackbar(error.message || 'Failed to delete mock question', { variant: 'error' })
        },
    })
}

export const useUploadMockQuestionImage = () => {
    const { enqueueSnackbar } = useSnackbar()

    return useMutation({
        mutationFn: (file: File) => mockQuestionsAPI.uploadImage(file),
        onError: (error: any) => {
            enqueueSnackbar(error.message || 'Failed to upload image', { variant: 'error' })
        },
    })
}

export const useBulkCreateMockQuestions = () => {
    const queryClient = useQueryClient()
    const { enqueueSnackbar } = useSnackbar()

    return useMutation({
        mutationFn: (inputs: CreateMockQuestionInput[]) => mockQuestionsAPI.bulkCreate(inputs),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['mock-questions'] })
            enqueueSnackbar(`${data.length} mock questions created successfully`, { variant: 'success' })
        },
        onError: (error: any) => {
            enqueueSnackbar(error.message || 'Failed to create mock questions', { variant: 'error' })
        },
    })
}
