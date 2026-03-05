import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RegisterPayload, RegisterResponse } from "@/types/auth"
import { writeVerifyOtpQuery } from "@/lib/query-schemas"

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void
  onError?: (error: Error) => void
}

export function useRegister(options?: UseRegisterOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      const response = await fetch(`${baseUrl}/auth/register/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to initiate registration")
      }

      const registerResponse = data as RegisterResponse

      toast.success(registerResponse.message || "OTP sent successfully")

      if (options?.onSuccess) {
        options.onSuccess(registerResponse)
      } else {
        // Default behavior if no onSuccess provided
        // Redirect to verify-otp with email as query param
        if (typeof window !== "undefined") {
          sessionStorage.setItem("registrationData", JSON.stringify(payload))
        }

        const query = writeVerifyOtpQuery({
          email: registerResponse.data.email,
        })
        router.push(`/verify-otp?${query}`)
      }

      return registerResponse
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An error occurred during registration")
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
    register,
    isLoading,
    error,
  }
}
