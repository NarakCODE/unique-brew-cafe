"use client";

import * as React from "react";
import type { ImportedTheme } from "@/types/theme-customizer";
import type { SidebarConfig } from "@/contexts/sidebar-context";

const STORAGE_KEY = "theme-customizer-settings";

export interface ThemeSettings {
  selectedTheme: string;
  selectedTweakcnTheme: string;
  selectedRadius: string;
  importedTheme: ImportedTheme | null;
  brandColorsValues: Record<string, string>;
  sidebarConfig: SidebarConfig;
}

const defaultSettings: ThemeSettings = {
  selectedTheme: "default",
  selectedTweakcnTheme: "",
  selectedRadius: "0.5rem",
  importedTheme: null,
  brandColorsValues: {},
  sidebarConfig: {
    variant: "inset",
    collapsible: "offcanvas",
    side: "left",
  },
};

export function getStoredSettings(): ThemeSettings {
  if (typeof window === "undefined") return defaultSettings;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to parse theme settings from localStorage:", error);
  }

  return defaultSettings;
}

export function saveSettings(settings: Partial<ThemeSettings>): void {
  if (typeof window === "undefined") return;

  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save theme settings to localStorage:", error);
  }
}

export function clearSettings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hook to manage theme persistence
 * Provides initial values from localStorage and auto-saves on changes
 */
export function useThemePersistence() {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [settings, setSettings] =
    React.useState<ThemeSettings>(defaultSettings);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    const stored = getStoredSettings();
    setSettings(stored);
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever settings change (after hydration)
  const updateSettings = React.useCallback(
    (newSettings: Partial<ThemeSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        saveSettings(updated);
        return updated;
      });
    },
    [],
  );

  const resetSettings = React.useCallback(() => {
    clearSettings();
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isHydrated,
    defaultSettings,
  };
}
