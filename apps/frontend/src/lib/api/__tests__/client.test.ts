import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, fetchClient, ApiClientError } from "../client";

// Mock the auth store
vi.mock("@/store/auth.store", () => ({
    useAuthStore: {
        getState: vi.fn(() => ({
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: {
                id: "1",
                email: "test@example.com",
                fullName: "Test User",
                role: "user",
            },
            setAuth: vi.fn(),
            updateAccessToken: vi.fn(),
            logout: vi.fn(),
        })),
    },
}));

// Mock axios
vi.mock("axios", () => {
    const mockAxios = {
        create: vi.fn(() => mockAxios),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    };
    return { default: mockAxios };
});

describe("API Client", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ApiClientError", () => {
        it("should create an error with all properties", () => {
            const error = new ApiClientError("Test error", 400, "TEST_ERROR", {
                field: "value",
            });

            expect(error.message).toBe("Test error");
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe("TEST_ERROR");
            expect(error.details).toEqual({ field: "value" });
            expect(error.name).toBe("ApiClientError");
        });
    });

    describe("AxiosApiClient", () => {
        it("should be defined", () => {
            expect(apiClient).toBeDefined();
        });

        it("should have HTTP methods", () => {
            expect(apiClient.get).toBeDefined();
            expect(apiClient.post).toBeDefined();
            expect(apiClient.put).toBeDefined();
            expect(apiClient.patch).toBeDefined();
            expect(apiClient.delete).toBeDefined();
        });

        it("should have getClient method", () => {
            expect(apiClient.getClient).toBeDefined();
            expect(typeof apiClient.getClient).toBe("function");
        });
    });

    describe("FetchApiClient", () => {
        it("should be defined", () => {
            expect(fetchClient).toBeDefined();
        });

        it("should have HTTP methods", () => {
            expect(fetchClient.get).toBeDefined();
            expect(fetchClient.post).toBeDefined();
            expect(fetchClient.put).toBeDefined();
            expect(fetchClient.patch).toBeDefined();
            expect(fetchClient.delete).toBeDefined();
        });
    });

    describe("API Configuration", () => {
        it("should use environment variable for API URL", () => {
            // The base URL should be defined
            expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
        });
    });
});
