import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardsAPI } from "@/api/flashcards";
import { CreateFlashcardInput, UpdateFlashcardInput } from "@/types/content";
import { useSnackbar } from "notistack";

export const useFlashcards = () => {
  return useQuery({
    queryKey: ["flashcards"],
    queryFn: flashcardsAPI.getAll,
  });
};

export const useFlashcardsByLesson = (lessonId: string) => {
  return useQuery({
    queryKey: ["flashcards", "lesson", lessonId],
    queryFn: () => flashcardsAPI.getByLessonId(lessonId),
    enabled: !!lessonId,
  });
};

export const useFlashcardsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["flashcards", "category", category],
    queryFn: () => flashcardsAPI.getByCategory(category),
    enabled: !!category,
  });
};

export const useFlashcard = (id: string) => {
  return useQuery({
    queryKey: ["flashcards", id],
    queryFn: () => flashcardsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateFlashcard = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateFlashcardInput) => flashcardsAPI.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      if (data.lessonId) {
        queryClient.invalidateQueries({
          queryKey: ["flashcards", "lesson", data.lessonId],
        });
      }
      if (data.category) {
        queryClient.invalidateQueries({
          queryKey: ["flashcards", "category", data.category],
        });
      }
      enqueueSnackbar("Flashcard created successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create flashcard", {
        variant: "error",
      });
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFlashcardInput }) =>
      flashcardsAPI.update(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      if (data.lessonId) {
        queryClient.invalidateQueries({
          queryKey: ["flashcards", "lesson", data.lessonId],
        });
      }
      if (data.category) {
        queryClient.invalidateQueries({
          queryKey: ["flashcards", "category", data.category],
        });
      }
      enqueueSnackbar("Flashcard updated successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to update flashcard", {
        variant: "error",
      });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => flashcardsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
      enqueueSnackbar("Flashcard deleted successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to delete flashcard", {
        variant: "error",
      });
    },
  });
};

export const useUploadFlashcardImage = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (file: File) => flashcardsAPI.uploadImage(file),
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to upload image", {
        variant: "error",
      });
    },
  });
};
