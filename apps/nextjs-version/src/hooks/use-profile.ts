import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfileImage,
  updateProfileSettingsFn,
} from "@/api/profile";
import { ApiErrorResponse, ApiResponse } from "@/types/api";
import {
  ChangePasswordRequest,
  DeleteAccountRequest,
  UpdateProfileSettingsRequest,
} from "@/types/profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

  return {
    user: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
  };
}

interface UseUpdateProfileImageOptions {
  onSuccess?: (data: ApiResponse<{ profileImage: string }>) => void;
  onError?: (error: ApiErrorResponse) => void;
}

export function useUpdateProfileImage(options?: UseUpdateProfileImageOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (data) => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: ApiErrorResponse) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  return {
    updateProfileImage: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: UpdateProfileSettingsRequest) =>
      updateProfileSettingsFn(request),
    onSuccess: (data) => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Profile updated successfully");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return {
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: (request: ChangePasswordRequest) => changePassword(request),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  return {
    changePassword: mutation.mutate,
    isChanging: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (request: DeleteAccountRequest) => deleteAccount(request),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Optionally logout or redirect
      queryClient.clear();
      router.push("/auth/login");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || "Failed to delete account");
    },
  });

  return {
    deleteAccount: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
