"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ApiClientError } from "@/lib/api";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute - data is fresh
                        gcTime: 5 * 60 * 1000, // 5 minutes - garbage collection time (formerly cacheTime)
                        refetchOnWindowFocus: false,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                        retry: (failureCount, error) => {
                            // Don't retry on 4xx errors (client errors)
                            if (error instanceof ApiClientError) {
                                if (
                                    error.statusCode &&
                                    error.statusCode >= 400 &&
                                    error.statusCode < 500
                                ) {
                                    return false;
                                }
                            }
                            // Retry up to 3 times for other errors
                            return failureCount < 3;
                        },
                        retryDelay: (attemptIndex) =>
                            Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        retry: false, // Don't retry mutations by default
                        onError: (error) => {
                            // Global error handling for mutations
                            if (error instanceof ApiClientError) {
                                console.error("Mutation error:", {
                                    message: error.message,
                                    code: error.code,
                                    status: error.statusCode,
                                    details: error.details,
                                });
                            }
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            )}
        </QueryClientProvider>
    );
}
