"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { UserRole, AuthResponse } from "@/types/auth";

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthResponse["user"] | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    hasRole: (role: UserRole | UserRole[]) => boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    const hasRole = (role: UserRole | UserRole[]) => {
        if (!store.user) return false;
        if (Array.isArray(role)) {
            return role.includes(store.user.role);
        }
        return store.user.role === role;
    };

    const value = {
        isAuthenticated: store.isAuthenticated,
        user: store.user,
        login: store.setAuth,
        logout: store.logout,
        hasRole,
        isLoading: store.isLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
