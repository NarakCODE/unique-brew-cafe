"use client";

import { useThemeManagerContext } from "@/contexts/theme-manager-context";

/**
 * Hook to access the ThemeManager context.
 * Provides all theme state (selected theme, radius, colors) and actions (applyTheme, resetTheme).
 *
 * Now backed by a Context Provider to ensure state is shared and persisted across the application.
 */
export function useThemeManager() {
  return useThemeManagerContext();
}
