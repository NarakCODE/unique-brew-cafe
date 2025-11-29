/**
 * UI Store - Client-Side State Management
 * Manages UI state like modals, sidebars, loading states, etc.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ============================================================================
// TYPES
// ============================================================================

interface UIState {
    // Sidebar
    isSidebarOpen: boolean;
    isSidebarCollapsed: boolean;

    // Modals
    activeModal: string | null;
    modalData: Record<string, unknown>;

    // Loading states
    globalLoading: boolean;
    loadingMessage: string | null;

    // Toasts/Notifications (UI notifications, not server notifications)
    toasts: Toast[];

    // Mobile menu
    isMobileMenuOpen: boolean;

    // Search
    isSearchOpen: boolean;
    searchQuery: string;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    toggleSidebarCollapsed: () => void;
    setSidebarCollapsed: (isCollapsed: boolean) => void;

    openModal: (modalId: string, data?: Record<string, unknown>) => void;
    closeModal: () => void;
    updateModalData: (data: Record<string, unknown>) => void;

    setGlobalLoading: (loading: boolean, message?: string) => void;

    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;

    toggleMobileMenu: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;

    toggleSearch: () => void;
    setSearchOpen: (isOpen: boolean) => void;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
}

export interface Toast {
    id: string;
    title?: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
}

// ============================================================================
// STORE
// ============================================================================

export const useUIStore = create<UIState>()(
    devtools(
        (set) => ({
            // Initial state
            isSidebarOpen: true,
            isSidebarCollapsed: false,
            activeModal: null,
            modalData: {},
            globalLoading: false,
            loadingMessage: null,
            toasts: [],
            isMobileMenuOpen: false,
            isSearchOpen: false,
            searchQuery: "",

            // Sidebar actions
            toggleSidebar: () =>
                set((state) => ({
                    isSidebarOpen: !state.isSidebarOpen,
                })),

            setSidebarOpen: (isOpen) =>
                set({
                    isSidebarOpen: isOpen,
                }),

            toggleSidebarCollapsed: () =>
                set((state) => ({
                    isSidebarCollapsed: !state.isSidebarCollapsed,
                })),

            setSidebarCollapsed: (isCollapsed) =>
                set({
                    isSidebarCollapsed: isCollapsed,
                }),

            // Modal actions
            openModal: (modalId, data = {}) =>
                set({
                    activeModal: modalId,
                    modalData: data,
                }),

            closeModal: () =>
                set({
                    activeModal: null,
                    modalData: {},
                }),

            updateModalData: (data) =>
                set((state) => ({
                    modalData: { ...state.modalData, ...data },
                })),

            // Loading actions
            setGlobalLoading: (loading, message = undefined) =>
                set({
                    globalLoading: loading,
                    loadingMessage: message,
                }),

            // Toast actions
            addToast: (toast) =>
                set((state) => ({
                    toasts: [
                        ...state.toasts,
                        {
                            ...toast,
                            id: Math.random().toString(36).substring(7),
                            duration: toast.duration || 5000,
                        },
                    ],
                })),

            removeToast: (id) =>
                set((state) => ({
                    toasts: state.toasts.filter((toast) => toast.id !== id),
                })),

            clearToasts: () =>
                set({
                    toasts: [],
                }),

            // Mobile menu actions
            toggleMobileMenu: () =>
                set((state) => ({
                    isMobileMenuOpen: !state.isMobileMenuOpen,
                })),

            setMobileMenuOpen: (isOpen) =>
                set({
                    isMobileMenuOpen: isOpen,
                }),

            // Search actions
            toggleSearch: () =>
                set((state) => ({
                    isSearchOpen: !state.isSearchOpen,
                })),

            setSearchOpen: (isOpen) =>
                set({
                    isSearchOpen: isOpen,
                }),

            setSearchQuery: (query) =>
                set({
                    searchQuery: query,
                }),

            clearSearch: () =>
                set({
                    searchQuery: "",
                    isSearchOpen: false,
                }),
        }),
        { name: "ui-store" }
    )
);

// ============================================================================
// SELECTORS (Optional, for better performance)
// ============================================================================

export const selectSidebarState = (state: UIState) => ({
    isOpen: state.isSidebarOpen,
    isCollapsed: state.isSidebarCollapsed,
});

export const selectModalState = (state: UIState) => ({
    activeModal: state.activeModal,
    modalData: state.modalData,
});

export const selectLoadingState = (state: UIState) => ({
    isLoading: state.globalLoading,
    message: state.loadingMessage,
});

export const selectToasts = (state: UIState) => state.toasts;
