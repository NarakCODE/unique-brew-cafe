/**
 * Sanitizes error messages to prevent leaking sensitive information.
 * Specifically targets authentication errors.
 */
export function sanitizeErrorMessage(error: unknown): string {
    if (typeof error === "string") {
        return sanitizeString(error);
    }

    if (error instanceof Error) {
        return sanitizeString(error.message);
    }

    if (typeof error === "object" && error !== null && "message" in error) {
        return sanitizeString((error as Error).message);
    }

    return "An unexpected error occurred. Please try again.";
}

function sanitizeString(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Generic auth failure - prevent user enumeration
    if (
        lowerMessage.includes("invalid password") ||
        lowerMessage.includes("incorrect password") ||
        lowerMessage.includes("user not found") ||
        lowerMessage.includes("email not found") ||
        lowerMessage.includes("invalid credentials") ||
        lowerMessage.includes("wrong password")
    ) {
        return "Invalid email or password.";
    }

    // Account status
    if (
        lowerMessage.includes("account suspended") ||
        lowerMessage.includes("account disabled")
    ) {
        return "Your account has been suspended. Please contact support.";
    }

    // Rate limiting
    if (
        lowerMessage.includes("too many requests") ||
        lowerMessage.includes("rate limit")
    ) {
        return "Too many attempts. Please try again later.";
    }

    // Server errors
    if (
        lowerMessage.includes("internal server error") ||
        lowerMessage.includes("database error")
    ) {
        return "A system error occurred. Please try again later.";
    }

    return message;
}
