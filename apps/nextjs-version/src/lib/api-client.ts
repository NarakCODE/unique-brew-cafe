import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiErrorResponse } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    // If we have a structured API error response from the backend
    if (error.response?.data && typeof error.response.data === "object") {
      const apiError = error.response.data as ApiErrorResponse;

      // Handle unauthorized errors (optional: could emit an event or redirect)
      if (
        apiError.errorCode === "AUTH_UNAUTHORIZED" ||
        error.response.status === 401
      ) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      return Promise.reject(apiError);
    }

    // Fallback error object
    const fallbackError: ApiErrorResponse = {
      success: false,
      message: error.message || "An unexpected error occurred",
      errorCode: error.code || "UNKNOWN_ERROR",
      errors: [],
      stack: error.stack,
    };

    return Promise.reject(fallbackError);
  },
);
