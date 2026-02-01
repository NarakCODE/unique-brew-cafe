"use client";

import * as React from "react";

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset";
  collapsible: "offcanvas" | "icon" | "none";
  side: "left" | "right";
}

export interface SidebarContextValue {
  config: SidebarConfig;
  updateConfig: (config: Partial<SidebarConfig>) => void;
}

const SIDEBAR_STORAGE_KEY = "theme-customizer-settings";

const defaultConfig: SidebarConfig = {
  variant: "inset",
  collapsible: "offcanvas",
  side: "left",
};

function getStoredSidebarConfig(): SidebarConfig {
  if (typeof window === "undefined") return defaultConfig;

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.sidebarConfig) {
        return { ...defaultConfig, ...parsed.sidebarConfig };
      }
    }
  } catch (error) {
    console.warn("Failed to parse sidebar config from localStorage:", error);
  }

  return defaultConfig;
}

function saveSidebarConfig(config: SidebarConfig): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed.sidebarConfig = config;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn("Failed to save sidebar config to localStorage:", error);
  }
}

export const SidebarContext = React.createContext<SidebarContextValue | null>(
  null,
);

export function SidebarConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = React.useState<SidebarConfig>(defaultConfig);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    const stored = getStoredSidebarConfig();
    setConfig(stored);
    setIsHydrated(true);
  }, []);

  const updateConfig = React.useCallback(
    (newConfig: Partial<SidebarConfig>) => {
      setConfig((prev) => {
        const updated = { ...prev, ...newConfig };
        // Only persist after hydration
        if (isHydrated) {
          saveSidebarConfig(updated);
        }
        return updated;
      });
    },
    [isHydrated],
  );

  return (
    <SidebarContext.Provider value={{ config, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error(
      "useSidebarConfig must be used within a SidebarConfigProvider",
    );
  }
  return context;
}
