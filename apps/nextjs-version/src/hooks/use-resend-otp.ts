import { useMutation } from "@tanstack/react-query"
import { resendOtp } from "@/api/auth"
import { toast } from "sonner"
import { ResendOtpResponse } from "@/types/auth"
import { ApiErrorResponse } from "@/types/api"

interface UseResendOtpOptions {
  onSuccess?: (data: ResendOtpResponse) => void
  onError?: (error: Error) => void
}

export function useResendOtp(options?: UseResendOtpOptions) {
  const mutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toast.success(data.message || "OTP resent successfully")
      if (options?.onSuccess) {
        options.onSuccess(data)
      }
    },
    onError: (error: Error | ApiErrorResponse) => {
      const message = (error as any).message || "An unexpected error occurred"
      toast.error(message)
      if (options?.onError) {
        options.onError(error as Error)
      }
    },
  })

  return {
    resendOtp: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
