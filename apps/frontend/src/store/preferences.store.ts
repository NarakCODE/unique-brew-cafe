/**
 * Preferences Store - Client-Side State Management
 * Manages user preferences (theme, language, display settings, etc.)
 */

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = "grid" | "list";
type ItemsPerPage = 10 | 20 | 50 | 100;
type Language = "en" | "id";
type Currency = "USD" | "IDR";

export interface TablePreferences {
    visibleColumns: string[];
    columnOrder: string[];
    columnWidths: Record<string, number>;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

interface PreferencesState {
    // Display preferences
    viewMode: ViewMode;
    itemsPerPage: ItemsPerPage;
    showImages: boolean;
    compactMode: boolean;

    // Localization
    language: Language;
    currency: Currency;
    timezone: string;

    // Notifications preferences
    emailNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    promotionalEmails: boolean;

    // Accessibility
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: "small" | "medium" | "large";

    // Table preferences (for admin)
    // Table preferences (for admin)
    tablePreferences: Record<string, TablePreferences>;

    // Recent searches
    recentSearches: string[];
    maxRecentSearches: number;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setItemsPerPage: (count: ItemsPerPage) => void;
    setShowImages: (show: boolean) => void;
    setCompactMode: (compact: boolean) => void;

    setLanguage: (lang: Language) => void;
    setCurrency: (currency: Currency) => void;
    setTimezone: (timezone: string) => void;

    setEmailNotifications: (enabled: boolean) => void;
    setPushNotifications: (enabled: boolean) => void;
    setOrderUpdates: (enabled: boolean) => void;
    setPromotionalEmails: (enabled: boolean) => void;

    setHighContrast: (enabled: boolean) => void;
    setReducedMotion: (enabled: boolean) => void;
    setFontSize: (size: "small" | "medium" | "large") => void;

    setTablePreferences: (
        tableId: string,
        preferences: TablePreferences
    ) => void;
    getTablePreferences: (tableId: string) => TablePreferences | null;

    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;

    resetPreferences: () => void;
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const defaultState = {
    viewMode: "grid" as ViewMode,
    itemsPerPage: 20 as ItemsPerPage,
    showImages: true,
    compactMode: false,

    language: "en" as Language,
    currency: "USD" as Currency,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,

    highContrast: false,
    reducedMotion: false,
    fontSize: "medium" as const,

    tablePreferences: {},
    recentSearches: [],
    maxRecentSearches: 10,
};

// ============================================================================
// STORE
// ============================================================================

export const usePreferencesStore = create<PreferencesState>()(
    devtools(
        persist(
            (set, get) => ({
                ...defaultState,

                // Display actions
                setViewMode: (mode) => set({ viewMode: mode }),
                setItemsPerPage: (count) => set({ itemsPerPage: count }),
                setShowImages: (show) => set({ showImages: show }),
                setCompactMode: (compact) => set({ compactMode: compact }),

                // Localization actions
                setLanguage: (lang) => set({ language: lang }),
                setCurrency: (currency) => set({ currency: currency }),
                setTimezone: (timezone) => set({ timezone: timezone }),

                // Notification actions
                setEmailNotifications: (enabled) =>
                    set({ emailNotifications: enabled }),
                setPushNotifications: (enabled) =>
                    set({ pushNotifications: enabled }),
                setOrderUpdates: (enabled) => set({ orderUpdates: enabled }),
                setPromotionalEmails: (enabled) =>
                    set({ promotionalEmails: enabled }),

                // Accessibility actions
                setHighContrast: (enabled) => set({ highContrast: enabled }),
                setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
                setFontSize: (size) => set({ fontSize: size }),

                // Table preferences
                setTablePreferences: (tableId, preferences) =>
                    set((state) => ({
                        tablePreferences: {
                            ...state.tablePreferences,
                            [tableId]: preferences,
                        },
                    })),

                getTablePreferences: (tableId) => {
                    const state = get();
                    return state.tablePreferences[tableId] || null;
                },

                // Recent searches
                addRecentSearch: (query) =>
                    set((state) => {
                        const trimmedQuery = query.trim();
                        if (!trimmedQuery) return state;

                        // Remove duplicates and add to beginning
                        const filtered = state.recentSearches.filter(
                            (s) => s !== trimmedQuery
                        );
                        const newSearches = [trimmedQuery, ...filtered].slice(
                            0,
                            state.maxRecentSearches
                        );

                        return { recentSearches: newSearches };
                    }),

                clearRecentSearches: () => set({ recentSearches: [] }),

                // Reset all preferences
                resetPreferences: () => set(defaultState),
            }),
            {
                name: "preferences-storage",
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    // Only persist these fields
                    viewMode: state.viewMode,
                    itemsPerPage: state.itemsPerPage,
                    showImages: state.showImages,
                    compactMode: state.compactMode,
                    language: state.language,
                    currency: state.currency,
                    timezone: state.timezone,
                    emailNotifications: state.emailNotifications,
                    pushNotifications: state.pushNotifications,
                    orderUpdates: state.orderUpdates,
                    promotionalEmails: state.promotionalEmails,
                    highContrast: state.highContrast,
                    reducedMotion: state.reducedMotion,
                    fontSize: state.fontSize,
                    tablePreferences: state.tablePreferences,
                    recentSearches: state.recentSearches,
                }),
            }
        ),
        { name: "preferences-store" }
    )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectDisplayPreferences = (state: PreferencesState) => ({
    viewMode: state.viewMode,
    itemsPerPage: state.itemsPerPage,
    showImages: state.showImages,
    compactMode: state.compactMode,
});

export const selectLocalizationPreferences = (state: PreferencesState) => ({
    language: state.language,
    currency: state.currency,
    timezone: state.timezone,
});

export const selectNotificationPreferences = (state: PreferencesState) => ({
    emailNotifications: state.emailNotifications,
    pushNotifications: state.pushNotifications,
    orderUpdates: state.orderUpdates,
    promotionalEmails: state.promotionalEmails,
});

export const selectAccessibilityPreferences = (state: PreferencesState) => ({
    highContrast: state.highContrast,
    reducedMotion: state.reducedMotion,
    fontSize: state.fontSize,
});
