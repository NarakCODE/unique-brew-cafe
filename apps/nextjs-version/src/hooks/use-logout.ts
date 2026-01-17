import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { LogoutResponse } from "@/types/auth"

interface UseLogoutOptions {
  onSuccess?: (data: LogoutResponse) => void
  onError?: (error: Error) => void
}

export function useLogout(options?: UseLogoutOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const logout = async () => {
    setIsLoading(true)
    setError(null)

    // Get refresh token from local storage
    const refreshToken = localStorage.getItem("refreshToken")

    // If no refresh token, just client-side logout
    if (!refreshToken) {
      handleClientLogout()
      return
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

      const response = await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      // Even if API call fails, we should probably still log the user out on client side
      // but let's handle the response properly
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to logout")
      }

      const logoutResponse = data as LogoutResponse

      handleClientLogout()

      toast.success("Logged out successfully")

      if (options?.onSuccess) {
        options.onSuccess(logoutResponse)
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An error occurred during logout")
      setError(error)
      // On error, we still force logout on client side to prevent stuck state
      handleClientLogout()

      if (options?.onError) {
        options.onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    router.replace("/sign-in")
  }

  return {
    logout,
    isLoading,
    error,
  }
}
