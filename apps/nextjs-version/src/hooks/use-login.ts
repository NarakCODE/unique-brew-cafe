import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoginPayload, LoginResponse } from "@/types/auth";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export function useLogin(options?: UseLoginOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use environment variable or default to localhost for development
      // The user specified {{baseUrl}}/auth/login
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to login");
      }

      const loginResponse = data as LoginResponse;

      // Store tokens - normally this would be in a cookie or more secure storage
      // For now, we'll assume the caller handles storage or we do it here if simple
      // Since the prompt asks to focus on login mutation, I'll leave storage logic simple or to the component/success callback

      toast.success("Logged in successfully");

      if (options?.onSuccess) {
        options.onSuccess(loginResponse);
      }

      return loginResponse;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An error occurred during login");
      setError(error);
      toast.error(error.message);

      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}
