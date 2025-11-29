import { AuthResponse } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthResponse["user"] | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // actions
    setAuth: (data: AuthResponse) => void;
    updateAccessToken: (token: string) => void;
    logout: () => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

// Custom storage adapter for cookies
const cookieStorage: StateStorage = {
    getItem: (name: string): string | null => {
        return Cookies.get(name) || null;
    },
    setItem: (name: string, value: string): void => {
        Cookies.set(name, value, {
            expires: 7, // 7 days
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
    },
    removeItem: (name: string): void => {
        Cookies.remove(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (data) =>
                set({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    user: data.user,
                    isAuthenticated: true,
                    error: null,
                }),

            updateAccessToken: (token) =>
                set({
                    accessToken: token,
                }),

            logout: () =>
                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                    error: null,
                }),

            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => cookieStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
