import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { ApiClientError, apiClient } from "@/lib/api/client";

describe("Property 19: API Client & Error Handling", () => {
    it("should correctly store error details in ApiClientError", () => {
        fc.assert(
            fc.property(
                fc.string(),
                fc.integer(),
                fc.string(),
                fc.array(
                    fc.record({
                        field: fc.string(),
                        message: fc.string(),
                        code: fc.string(),
                    })
                ),
                (message, status, code, errors) => {
                    const error = new ApiClientError(
                        message,
                        status,
                        code,
                        errors
                    );
                    expect(error.message).toBe(message);
                    expect(error.statusCode).toBe(status);
                    expect(error.code).toBe(code);
                    expect(error.errors).toEqual(errors);
                    expect(error.name).toBe("ApiClientError");
                }
            )
        );
    });

    it("should have interceptors configured", () => {
        const client = apiClient.getClient();
        // Check if interceptors are present
        const requestInterceptors = client.interceptors.request as unknown as {
            handlers: unknown[];
        };
        const responseInterceptors = client.interceptors
            .response as unknown as { handlers: unknown[] };

        expect(requestInterceptors.handlers.length).toBeGreaterThan(0);
        expect(responseInterceptors.handlers.length).toBeGreaterThan(0);
    });
});
