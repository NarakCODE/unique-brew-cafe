import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { useAuthStore } from "@/store/auth.store";
import Cookies from "js-cookie";

// Mock js-cookie
vi.mock("js-cookie", () => {
    let store: Record<string, string> = {};
    return {
        default: {
            set: vi.fn((key: string, value: string) => {
                store[key] = value;
            }),
            get: vi.fn((key: string) => store[key]),
            remove: vi.fn((key: string) => {
                delete store[key];
            }),
            // Helper to clear store for tests
            _clear: () => {
                store = {};
            },
        },
    };
});

describe("Property 1: Authentication Token Storage and Cleanup", () => {
    beforeEach(() => {
        useAuthStore.getState().logout();
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Cookies as any)._clear();
    });

    it("should store tokens in cookies when setAuth is called", () => {
        fc.assert(
            fc.property(
                fc.string(), // accessToken
                fc.string(), // refreshToken
                fc.record({
                    id: fc.string(),
                    fullName: fc.string(),
                    email: fc.emailAddress(),
                    role: fc.constantFrom("user", "admin", "moderator"),
                    status: fc.constantFrom("active", "suspended", "deleted"),
                    loyaltyTier: fc.constantFrom(
                        "bronze",
                        "silver",
                        "gold",
                        "platinum"
                    ),
                    totalOrders: fc.integer(),
                    totalSpent: fc.integer(),
                    createdAt: fc.string(),
                }), // user
                (accessToken, refreshToken, user) => {
                    // Arrange
                    const authData = {
                        accessToken,
                        refreshToken,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        user: user as any, // We still cast to any here because the generated user might not match exactly if we don't include all optional fields, but let's try to match it better.
                    };

                    // Act
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    useAuthStore.getState().setAuth(authData as any);

                    // Assert
                    expect(Cookies.set).toHaveBeenCalledWith(
                        "auth-storage",
                        expect.any(String),
                        expect.any(Object)
                    );

                    const lastCall = vi.mocked(Cookies.set).mock.calls[
                        vi.mocked(Cookies.set).mock.calls.length - 1
                    ];
                    const storedValue = JSON.parse(lastCall[1]);

                    expect(storedValue.state.accessToken).toBe(accessToken);
                    expect(storedValue.state.refreshToken).toBe(refreshToken);
                    expect(storedValue.state.isAuthenticated).toBe(true);
                }
            )
        );
    });

    it("should remove tokens from cookies (set to null) when logout is called", () => {
        // Arrange
        const authData = {
            accessToken: "access",
            refreshToken: "refresh",
            user: {
                id: "1",
                fullName: "User",
                email: "user@example.com",
                role: "user",
                status: "active",
                loyaltyTier: "bronze",
                totalOrders: 0,
                totalSpent: 0,
                createdAt: new Date().toISOString(),
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useAuthStore.getState().setAuth(authData as any);

        // Act
        useAuthStore.getState().logout();

        // Assert
        const lastCall = vi.mocked(Cookies.set).mock.calls[
            vi.mocked(Cookies.set).mock.calls.length - 1
        ];
        const storedValue = JSON.parse(lastCall[1]);

        expect(storedValue.state.accessToken).toBeNull();
        expect(storedValue.state.refreshToken).toBeNull();
        expect(storedValue.state.isAuthenticated).toBe(false);
    });
});
