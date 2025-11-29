/**
 * Dashboard Hooks - Server State Management
 * Uses TanStack Query for fetching dashboard statistics
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dashboardKeys = {
    all: ["dashboard"] as const,
    stats: () => [...dashboardKeys.all, "stats"] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get dashboard statistics
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => api.reports.dashboard(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
