"use client";

import React from "react";
import { Layout, Palette, RotateCcw, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { useSidebarConfig } from "@/contexts/sidebar-context";

import { tweakcnThemes } from "@/config/theme-data";
import { ThemeTab } from "./theme-tab";
import { LayoutTab } from "./layout-tab";
import { ImportModal } from "./import-modal";
import { cn } from "@/lib/utils";
import type { ImportedTheme } from "@/types/theme-customizer";

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  // Use the shared context state which handles persistence automatically
  const {
    applyImportedTheme,
    isDarkMode,
    resetTheme,
    applyRadius,
    applyTheme,
    applyTweakcnTheme,

    // State from context
    selectedTheme,
    setSelectedTheme,
    selectedTweakcnTheme,
    setSelectedTweakcnTheme,
    selectedRadius,
    setSelectedRadius,
    setImportedTheme,
    importedTheme,
  } = useThemeManager();

  const { config: sidebarConfig, updateConfig: updateSidebarConfig } =
    useSidebarConfig();

  const [activeTab, setActiveTab] = React.useState("theme");
  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const handleReset = () => {
    // 1. Reset theme state (this resets persistence too via the context)
    resetTheme();

    // 2. Clear selections in context
    setSelectedTheme("default");
    setSelectedTweakcnTheme("");
    setSelectedRadius("0.5rem");
    setImportedTheme(null);

    // 3. Reset sidebar to defaults
    updateSidebarConfig({
      variant: "inset",
      collapsible: "offcanvas",
      side: "left",
    });
  };

  const handleImport = (themeData: ImportedTheme) => {
    // Set imported theme in context
    setImportedTheme(themeData);
    // Clear other selections
    setSelectedTheme("");
    setSelectedTweakcnTheme("");

    // Apply the imported theme
    applyImportedTheme(themeData, isDarkMode);
  };

  const handleImportClick = () => {
    setImportModalOpen(true);
  };

  // We don't need a useEffect to apply themes on change or hydration here anymore,
  // because the ThemeManagerProvider helps handle that logic centrally!
  // However, for immediate feedback if the user interacts with the UI, the setters above persist.
  // The Context also has an effect to apply styles when state changes.
  // So NO effect needed here!

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={sidebarConfig.side === "left" ? "right" : "left"}
          className="w-[400px] p-0 gap-0 pointer-events-auto [&>button]:hidden overflow-hidden flex flex-col"
          onInteractOutside={(e) => {
            // Prevent the sheet from closing when dialog is open
            if (importModalOpen) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader className="space-y-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg font-semibold">
                Customizer
              </SheetTitle>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="cursor-pointer h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetDescription className="text-sm text-muted-foreground sr-only">
              Customize the them and layout of your dashboard.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="py-2">
                <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger
                    value="theme"
                    className="cursor-pointer data-[state=active]:bg-background"
                  >
                    <Palette className="h-4 w-4 mr-1" /> Theme
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="cursor-pointer data-[state=active]:bg-background"
                  >
                    <Layout className="h-4 w-4 mr-1" /> Layout
                  </TabsTrigger>
                </TabsList>
                {/* <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger value="theme" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Palette className="h-4 w-4 mr-1" /> Theme</TabsTrigger>
                  <TabsTrigger value="layout" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layout className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
                </TabsList> */}
              </div>

              <TabsContent value="theme" className="flex-1 mt-0">
                <ThemeTab
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  selectedTweakcnTheme={selectedTweakcnTheme}
                  setSelectedTweakcnTheme={setSelectedTweakcnTheme}
                  selectedRadius={selectedRadius}
                  setSelectedRadius={setSelectedRadius}
                  setImportedTheme={setImportedTheme}
                  onImportClick={handleImportClick}
                />
              </TabsContent>

              <TabsContent value="layout" className="flex-1 mt-0">
                <LayoutTab />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  );
}

// Floating trigger button - positioned dynamically based on sidebar side
export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  const { config: sidebarConfig } = useSidebarConfig();

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer",
        sidebarConfig.side === "left" ? "right-4" : "left-4",
      )}
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
}
