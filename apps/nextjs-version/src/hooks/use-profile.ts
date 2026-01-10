import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getProfile, updateProfileImage } from "@/api/profile"
import { ApiErrorResponse, ApiResponse } from "@/types/api"

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  })

  return {
    user: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error as ApiErrorResponse | null,
    refetch: query.refetch,
  }
}

interface UseUpdateProfileImageOptions {
  onSuccess?: (data: ApiResponse<{ profileImage: string }>) => void
  onError?: (error: ApiErrorResponse) => void
}

export function useUpdateProfileImage(options?: UseUpdateProfileImageOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (data) => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] })

      if (options?.onSuccess) {
        options.onSuccess(data)
      }
    },
    onError: (error: ApiErrorResponse) => {
      if (options?.onError) {
        options.onError(error)
      }
    },
  })

  return {
    updateProfileImage: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
