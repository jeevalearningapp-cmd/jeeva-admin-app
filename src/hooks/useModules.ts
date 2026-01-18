import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modulesAPI } from "@/api/modules";
import { CreateModuleInput, UpdateModuleInput } from "@/types/content";
import { useSnackbar } from "notistack";

export const useModules = () => {
  return useQuery({
    queryKey: ["modules"],
    queryFn: modulesAPI.getAll,
  });
};

export const useModule = (id: string) => {
  return useQuery({
    queryKey: ["modules", id],
    queryFn: () => modulesAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateModuleInput) => modulesAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      enqueueSnackbar("Module created successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to create module", {
        variant: "error",
      });
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateModuleInput }) =>
      modulesAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      enqueueSnackbar("Module updated successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to update module", {
        variant: "error",
      });
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => modulesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      enqueueSnackbar("Module deleted successfully", { variant: "success" });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to delete module", {
        variant: "error",
      });
    },
  });
};

export const useUploadThumbnail = () => {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (file: File) => modulesAPI.uploadThumbnail(file),
    onError: (error: any) => {
      enqueueSnackbar(error.message || "Failed to upload thumbnail", {
        variant: "error",
      });
    },
  });
};
