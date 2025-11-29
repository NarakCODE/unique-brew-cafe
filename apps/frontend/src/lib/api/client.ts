import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { ApiResponse, ApiError } from "@/types/api";
import { useAuthStore } from "@/store/auth.store";

// API Configuration
import { API_BASE_URL } from "@/lib/utils/constants";
const API_TIMEOUT = 30000; // 30 seconds

// Custom error class for API errors
export class ApiClientError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public details?: Record<string, string>
    ) {
        super(message);
        this.name = "ApiClientError";
    }
}

// ============================================================================
// AXIOS IMPLEMENTATION
// ============================================================================

class AxiosApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: unknown) => void;
        reject: (reason?: unknown) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const { accessToken } = useAuthStore.getState();

                if (accessToken && config.headers) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiError>) => {
                const originalRequest = error.config as AxiosRequestConfig & {
                    _retry?: boolean;
                };

                // Handle 401 Unauthorized - Token expired
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        // Queue the request while refreshing
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(() => {
                                return this.client(originalRequest);
                            })
                            .catch((err) => {
                                return Promise.reject(err);
                            });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const { refreshToken } = useAuthStore.getState();

                        if (!refreshToken) {
                            throw new Error("No refresh token available");
                        }

                        // Attempt to refresh the token
                        const response = await axios.post<
                            ApiResponse<{
                                accessToken: string;
                                refreshToken: string;
                            }>
                        >(`${API_BASE_URL}/auth/refresh`, { refreshToken });

                        const {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                        } = response.data.data;

                        // Update tokens in the store
                        useAuthStore.getState().setAuth({
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken,
                            user: useAuthStore.getState().user!,
                        });

                        // Update the authorization header
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        }

                        // Process the failed queue
                        this.processQueue(null);

                        // Retry the original request
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Token refresh failed, logout the user
                        this.processQueue(refreshError);
                        useAuthStore.getState().logout();

                        // Redirect to login page (client-side only)
                        if (typeof window !== "undefined") {
                            window.location.href = "/login";
                        }

                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                // Transform axios error to our custom error
                const apiError = this.transformError(error);
                return Promise.reject(apiError);
            }
        );
    }

    private processQueue(error: unknown) {
        this.failedQueue.forEach((promise) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve();
            }
        });

        this.failedQueue = [];
    }

    private transformError(error: AxiosError<ApiError>): ApiClientError {
        if (error.response?.data) {
            const apiError = error.response.data;
            return new ApiClientError(
                apiError.error.message,
                error.response.status,
                apiError.error.code,
                apiError.error.details
            );
        }

        if (error.request) {
            return new ApiClientError(
                "No response received from server",
                undefined,
                "NETWORK_ERROR"
            );
        }

        return new ApiClientError(
            error.message || "An unexpected error occurred",
            undefined,
            "UNKNOWN_ERROR"
        );
    }

    // HTTP Methods
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<ApiResponse<T>>(url, config);
        return response.data.data;
    }

    async post<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.client.post<ApiResponse<T>>(
            url,
            data,
            config
        );
        return response.data.data;
    }

    async put<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.client.put<ApiResponse<T>>(
            url,
            data,
            config
        );
        return response.data.data;
    }

    async patch<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await this.client.patch<ApiResponse<T>>(
            url,
            data,
            config
        );
        return response.data.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<ApiResponse<T>>(url, config);
        return response.data.data;
    }

    // Get the underlying axios instance for advanced usage
    getClient(): AxiosInstance {
        return this.client;
    }
}

// ============================================================================
// FETCH IMPLEMENTATION
// ============================================================================

class FetchApiClient {
    private baseURL: string;
    private timeout: number;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: unknown) => void;
        reject: (reason?: unknown) => void;
    }> = [];

    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = API_TIMEOUT;
    }

    private async request<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const { accessToken } = useAuthStore.getState();

        // Setup headers
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (accessToken) {
            (
                headers as Record<string, string>
            ).Authorization = `Bearer ${accessToken}`;
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                return this.handleUnauthorized<T>(url, options);
            }

            // Parse response
            const data = await response.json();

            if (!response.ok) {
                throw this.transformError(data, response.status);
            }

            return data.data as T;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ApiClientError) {
                throw error;
            }

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    throw new ApiClientError(
                        "Request timeout",
                        undefined,
                        "TIMEOUT_ERROR"
                    );
                }
                throw new ApiClientError(
                    error.message,
                    undefined,
                    "FETCH_ERROR"
                );
            }

            throw new ApiClientError(
                "An unexpected error occurred",
                undefined,
                "UNKNOWN_ERROR"
            );
        }
    }

    private async handleUnauthorized<T>(
        url: string,
        options: RequestInit
    ): Promise<T> {
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            }).then(() => this.request<T>(url, options)) as Promise<T>;
        }

        this.isRefreshing = true;

        try {
            const { refreshToken } = useAuthStore.getState();

            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            // Refresh the token
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error("Token refresh failed");
            }

            const data = await response.json();
            const {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            } = data.data;

            // Update tokens
            useAuthStore.getState().setAuth({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: useAuthStore.getState().user!,
            });

            // Process the failed queue
            this.processQueue(null);

            // Retry the original request
            return this.request<T>(url, options);
        } catch (error) {
            this.processQueue(error);
            useAuthStore.getState().logout();

            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }

            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    private processQueue(error: unknown) {
        this.failedQueue.forEach((promise) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve();
            }
        });

        this.failedQueue = [];
    }

    private transformError(data: ApiError, status: number): ApiClientError {
        return new ApiClientError(
            data.error.message,
            status,
            data.error.code,
            data.error.details
        );
    }

    // HTTP Methods
    async get<T>(url: string, config?: RequestInit): Promise<T> {
        return this.request<T>(url, { ...config, method: "GET" });
    }

    async post<T>(
        url: string,
        data?: unknown,
        config?: RequestInit
    ): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(
        url: string,
        data?: unknown,
        config?: RequestInit
    ): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(
        url: string,
        data?: unknown,
        config?: RequestInit
    ): Promise<T> {
        return this.request<T>(url, {
            ...config,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(url: string, config?: RequestInit): Promise<T> {
        return this.request<T>(url, { ...config, method: "DELETE" });
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export both implementations
export const axiosClient = new AxiosApiClient();
export const fetchClient = new FetchApiClient();

// Default export (Axios)
export const apiClient = axiosClient;

// Export API base URL for direct usage if needed
export { API_BASE_URL };
