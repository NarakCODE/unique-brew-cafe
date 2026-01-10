import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { VerifyOtpPayload, VerifyOtpResponse } from "@/types/auth"

interface UseVerifyOtpOptions {
  onSuccess?: (data: VerifyOtpResponse) => void
  onError?: (error: Error) => void
}

export function useVerifyOtp(options?: UseVerifyOtpOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      const response = await fetch(`${baseUrl}/auth/register/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to verify OTP")
      }

      const verifyResponse = data as VerifyOtpResponse

      toast.success(verifyResponse.message || "Email verified successfully")

      if (options?.onSuccess) {
        options.onSuccess(verifyResponse)
      } else {
        // Default behavior: store tokens and redirect to dashboard
        localStorage.setItem("accessToken", verifyResponse.data.accessToken)
        localStorage.setItem("refreshToken", verifyResponse.data.refreshToken)
        localStorage.setItem("user", JSON.stringify(verifyResponse.data.user))
        router.push("/register-success")
      }

      return verifyResponse
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An error occurred during verification")
      setError(error)
      toast.error(error.message)

      if (options?.onError) {
        options.onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    verifyOtp,
    isLoading,
    error,
  }
}
