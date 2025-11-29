import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";

describe("Property 2: Authentication Error Message Safety", () => {
    it("should sanitize sensitive authentication error messages", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "User not found",
                    "Email not found",
                    "Invalid password",
                    "Incorrect password",
                    "Wrong password",
                    "Invalid credentials"
                ),
                (errorMessage) => {
                    const sanitized = sanitizeErrorMessage(errorMessage);
                    expect(sanitized).toBe("Invalid email or password.");
                }
            )
        );
    });

    it("should sanitize mixed case sensitive messages", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "USER NOT FOUND",
                    "invalid PASSWORD",
                    "Email Not Found"
                ),
                (errorMessage) => {
                    const sanitized = sanitizeErrorMessage(errorMessage);
                    expect(sanitized).toBe("Invalid email or password.");
                }
            )
        );
    });

    it("should preserve non-sensitive error messages", () => {
        fc.assert(
            fc.property(
                fc.string().filter((s) => {
                    const lower = s.toLowerCase();
                    return (
                        !lower.includes("password") &&
                        !lower.includes("user not found") &&
                        !lower.includes("email not found") &&
                        !lower.includes("credentials") &&
                        !lower.includes("account suspended") &&
                        !lower.includes("account disabled") &&
                        !lower.includes("rate limit") &&
                        !lower.includes("too many requests") &&
                        !lower.includes("internal server error") &&
                        !lower.includes("database error") &&
                        s.length > 0
                    );
                }),
                (errorMessage) => {
                    const sanitized = sanitizeErrorMessage(errorMessage);
                    expect(sanitized).toBe(errorMessage);
                }
            )
        );
    });
});
