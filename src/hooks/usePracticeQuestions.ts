import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  practiceQuestionsAPI,
  CreatePracticeQuestionInput,
  UpdatePracticeQuestionInput,
} from "@/api/practiceQuestions";
import { useSnackbar } from "notistack";

export const usePracticeQuestions = (category: string, subdivision: string) => {
  return useQuery({
    queryKey: ["practice-questions", category, subdivision],
    queryFn: () => practiceQuestionsAPI.getByFilter(category, subdivision),
    enabled: !!category && !!subdivision,
  });
};

export const usePracticeQuestion = (id: string) => {
  return useQuery({
    queryKey: ["practice-questions", id],
    queryFn: () => practiceQuestionsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreatePracticeQuestion = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreatePracticeQuestionInput) =>
      practiceQuestionsAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["practice-questions", data.category, data.subdivision],
      });
      enqueueSnackbar("Practice question created successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create practice question", {
        variant: "error",
      });
    },
  });
};

export const useUpdatePracticeQuestion = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePracticeQuestionInput;
    }) => practiceQuestionsAPI.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["practice-questions"] });
      enqueueSnackbar("Practice question updated successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to update practice question", {
        variant: "error",
      });
    },
  });
};

export const useDeletePracticeQuestion = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => practiceQuestionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practice-questions"] });
      enqueueSnackbar("Practice question deleted successfully", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to delete practice question", {
        variant: "error",
      });
    },
  });
};

export const useUploadPracticeQuestionImage = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (file: File) => practiceQuestionsAPI.uploadImage(file),
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to upload image", {
        variant: "error",
      });
    },
  });
};

export const useBulkCreatePracticeQuestions = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (inputs: CreatePracticeQuestionInput[]) =>
      practiceQuestionsAPI.bulkCreate(inputs),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["practice-questions"] });
      enqueueSnackbar(
        `${data.length} practice questions created successfully`,
        { variant: "success" },
      );
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create practice questions", {
        variant: "error",
      });
    },
  });
};
