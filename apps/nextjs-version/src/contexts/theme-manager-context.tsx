"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  useThemePersistence,
  ThemeSettings,
} from "@/hooks/use-theme-persistence";
import { colorThemes, tweakcnThemes } from "@/config/theme-data";
import { baseColors } from "@/config/theme-customizer-constants";
import type { ThemePreset, ImportedTheme } from "@/types/theme-customizer";

interface ThemeManagerContextType {
  // Persistence state
  selectedTheme: string;
  selectedTweakcnTheme: string;
  selectedRadius: string;
  importedTheme: ImportedTheme | null;
  brandColorsValues: Record<string, string>;
  isHydrated: boolean;

  // Setters (that persist)
  setSelectedTheme: (theme: string) => void;
  setSelectedTweakcnTheme: (theme: string) => void;
  setSelectedRadius: (radius: string) => void;
  setImportedTheme: (theme: ImportedTheme | null) => void;
  setBrandColorsValues: (colors: Record<string, string>) => void; // Direct setter if needed

  // Logic
  resetTheme: () => void;
  applyTheme: (themeValue: string, darkMode: boolean) => void;
  applyTweakcnTheme: (themePreset: ThemePreset, darkMode: boolean) => void;
  applyImportedTheme: (themeData: ImportedTheme, darkMode: boolean) => void;
  applyRadius: (radius: string) => void;
  handleColorChange: (cssVar: string, value: string) => void;
  updateBrandColorsFromTheme: (styles: Record<string, string>) => void;

  // Theme provider state
  theme: string;
  setTheme: (theme: "dark" | "light" | "system") => void;
  isDarkMode: boolean;
}

const ThemeManagerContext = createContext<ThemeManagerContextType | null>(null);

export function ThemeManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const {
    settings,
    updateSettings,
    resetSettings: resetPersistence,
    isHydrated,
  } = useThemePersistence();

  // Derived state from settings
  const {
    selectedTheme,
    selectedTweakcnTheme,
    selectedRadius,
    importedTheme,
    brandColorsValues,
  } = settings;

  // Simple, reliable theme detection
  const isDarkMode = React.useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }, [theme]);

  // --- Handlers that update persistence ---

  const handleSetSelectedTheme = useCallback(
    (value: string) => {
      updateSettings({
        selectedTheme: value,
        selectedTweakcnTheme: "",
        importedTheme: null,
      });
    },
    [updateSettings],
  );

  const handleSetSelectedTweakcnTheme = useCallback(
    (value: string) => {
      updateSettings({
        selectedTweakcnTheme: value,
        selectedTheme: "",
        importedTheme: null,
      });
    },
    [updateSettings],
  );

  const handleSetSelectedRadius = useCallback(
    (value: string) => {
      updateSettings({ selectedRadius: value });
    },
    [updateSettings],
  );

  const handleSetImportedTheme = useCallback(
    (value: ImportedTheme | null) => {
      updateSettings({
        importedTheme: value,
        selectedTheme: "",
        selectedTweakcnTheme: "",
      });
    },
    [updateSettings],
  );

  const handleSetBrandColorsValues = useCallback(
    (values: Record<string, string>) => {
      updateSettings({ brandColorsValues: values });
    },
    [updateSettings],
  );

  // --- Theme Application Logic ---

  const resetThemeLogic = useCallback(() => {
    const root = document.documentElement;
    const allPossibleVars = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
      "border",
      "input",
      "ring",
      "radius",
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
      "sidebar",
      "sidebar-background",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
      "font-sans",
      "font-serif",
      "font-mono",
      "shadow-2xs",
      "shadow-xs",
      "shadow-sm",
      "shadow",
      "shadow-md",
      "shadow-lg",
      "shadow-xl",
      "shadow-2xl",
      "spacing",
      "tracking-normal",
      "card-header",
      "card-content",
      "card-footer",
      "muted-background",
      "accent-background",
      "destructive-background",
      "warning",
      "warning-foreground",
      "success",
      "success-foreground",
      "info",
      "info-foreground",
    ];

    allPossibleVars.forEach((varName) =>
      root.style.removeProperty(`--${varName}`),
    );

    const inlineStyles = root.style;
    for (let i = inlineStyles.length - 1; i >= 0; i--) {
      const property = inlineStyles[i];
      if (property.startsWith("--")) {
        root.style.removeProperty(property);
      }
    }
  }, []);

  const resetTheme = useCallback(() => {
    // 1. Reset logic (DOM)
    resetThemeLogic();
    // 2. Reset persistence
    resetPersistence();
    // 3. Reset defaults
    document.documentElement.style.setProperty("--radius", "0.5rem");
  }, [resetThemeLogic, resetPersistence]);

  const updateBrandColorsFromTheme = useCallback(
    (styles: Record<string, string>) => {
      const newValues: Record<string, string> = {};
      baseColors.forEach((color) => {
        const cssVar = color.cssVar.replace("--", "");
        if (styles[cssVar]) {
          newValues[color.cssVar] = styles[cssVar];
        }
      });
      handleSetBrandColorsValues(newValues);
    },
    [handleSetBrandColorsValues],
  );

  const applyTheme = useCallback(
    (themeValue: string, darkMode: boolean) => {
      const themeObj = colorThemes.find((t) => t.value === themeValue);
      if (!themeObj) return;

      resetThemeLogic();
      const styles = darkMode
        ? themeObj.preset.styles.dark
        : themeObj.preset.styles.light;
      const root = document.documentElement;

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });

      updateBrandColorsFromTheme(styles);
    },
    [resetThemeLogic, updateBrandColorsFromTheme],
  );

  const applyTweakcnTheme = useCallback(
    (themePreset: ThemePreset, darkMode: boolean) => {
      resetThemeLogic();
      const styles = darkMode
        ? themePreset.styles.dark
        : themePreset.styles.light;
      const root = document.documentElement;

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });

      updateBrandColorsFromTheme(styles);
    },
    [resetThemeLogic, updateBrandColorsFromTheme],
  );

  const applyImportedTheme = useCallback(
    (themeData: ImportedTheme, darkMode: boolean) => {
      const root = document.documentElement;
      const themeVars = darkMode ? themeData.dark : themeData.light;

      Object.entries(themeVars).forEach(([variable, value]) => {
        root.style.setProperty(`--${variable}`, value);
      });

      const newBrandColors: Record<string, string> = {};
      baseColors.forEach((color) => {
        const varName = color.cssVar.replace("--", "");
        if (themeVars[varName]) {
          newBrandColors[color.cssVar] = themeVars[varName];
        }
      });
      handleSetBrandColorsValues(newBrandColors);
    },
    [handleSetBrandColorsValues],
  );

  const applyRadius = useCallback((radius: string) => {
    document.documentElement.style.setProperty("--radius", radius);
  }, []);

  const handleColorChange = useCallback(
    (cssVar: string, value: string) => {
      document.documentElement.style.setProperty(cssVar, value);

      // Update state & persist
      const current = settings.brandColorsValues || {};
      handleSetBrandColorsValues({ ...current, [cssVar]: value });
    },
    [settings.brandColorsValues, handleSetBrandColorsValues],
  );

  // --- Initial Hydration / Effect ---
  // Apply the theme to DOM whenever settings change or we hydrate
  // We need a ref to avoid loops or applying constantly, but settings change triggers it.
  // Actually, we should apply when `isHydrated` becomes true, and whenever relevant settings change.

  useEffect(() => {
    if (!isHydrated) return;

    // Apply radius
    applyRadius(selectedRadius);

    // Apply theme
    if (importedTheme) {
      applyImportedTheme(importedTheme, isDarkMode);
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find(
        (t) => t.value === selectedTweakcnTheme,
      )?.preset;
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode);
      }
    } else if (selectedTheme && selectedTheme !== "default") {
      applyTheme(selectedTheme, isDarkMode);
    }
  }, [
    isHydrated,
    isDarkMode,
    selectedTheme,
    selectedTweakcnTheme,
    importedTheme,
    selectedRadius,
  ]); // Intentionally omitting apply functions as they are stable

  const value = {
    selectedTheme,
    selectedTweakcnTheme,
    selectedRadius,
    importedTheme,
    brandColorsValues,
    isHydrated,

    setSelectedTheme: handleSetSelectedTheme,
    setSelectedTweakcnTheme: handleSetSelectedTweakcnTheme,
    setSelectedRadius: handleSetSelectedRadius,
    setImportedTheme: handleSetImportedTheme,
    setBrandColorsValues: handleSetBrandColorsValues,

    resetTheme,
    applyTheme,
    applyTweakcnTheme,
    applyImportedTheme,
    applyRadius,
    handleColorChange,
    updateBrandColorsFromTheme,

    theme: theme as string,
    setTheme,
    isDarkMode,
  };

  return (
    <ThemeManagerContext.Provider value={value}>
      {children}
    </ThemeManagerContext.Provider>
  );
}

export function useThemeManagerContext() {
  const context = useContext(ThemeManagerContext);
  if (!context) {
    throw new Error(
      "useThemeManagerContext must be used within a ThemeManagerProvider",
    );
  }
  return context;
}
