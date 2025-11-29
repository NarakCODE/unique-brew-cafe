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
        (Cookies as any)._clear();
    });

    it("should store tokens in cookies when setAuth is called", () => {
        fc.assert(
            fc.property(
                fc.string(), // accessToken
                fc.string(), // refreshToken
                fc.record({
                    _id: fc.string(),
                    name: fc.string(),
                    email: fc.emailAddress(),
                    role: fc.constantFrom("user", "admin", "moderator"),
                }), // user
                (accessToken, refreshToken, user) => {
                    // Arrange
                    const authData = {
                        accessToken,
                        refreshToken,
                        user: user as any,
                    };

                    // Act
                    useAuthStore.getState().setAuth(authData);

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
                _id: "1",
                name: "User",
                email: "user@example.com",
                role: "user",
            } as any,
        };
        useAuthStore.getState().setAuth(authData);

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
