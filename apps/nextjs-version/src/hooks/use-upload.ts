import { useMutation } from "@tanstack/react-query";
import { uploadImage, UploadResponse } from "@/api/upload";
import { toast } from "sonner";

export const useUpload = () => {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: uploadImage,
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
};
