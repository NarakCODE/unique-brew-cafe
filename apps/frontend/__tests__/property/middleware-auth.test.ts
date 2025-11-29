import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import fc from "fast-check";
import { middleware } from "@/middleware";
import { NextResponse, NextRequest } from "next/server";

// Mock NextResponse
vi.mock("next/server", async () => {
    return {
        NextResponse: {
            redirect: vi.fn((url) => ({
                type: "redirect",
                url: url.toString(),
            })),
            next: vi.fn(() => ({ type: "next" })),
        },
        NextRequest: vi.fn(),
    };
});

describe("Property 4: Protected Route Authorization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should redirect unauthenticated users to login when accessing protected routes", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "/dashboard",
                    "/dashboard/orders",
                    "/dashboard/products"
                ),
                (path) => {
                    const req = {
                        nextUrl: { pathname: path },
                        url: `http://localhost${path}`,
                        cookies: {
                            get: () => undefined, // No auth cookie
                        },
                    } as unknown as NextRequest;

                    middleware(req);

                    expect(NextResponse.redirect).toHaveBeenCalled();
                    const redirectUrl = (NextResponse.redirect as Mock).mock
                        .lastCall![0];
                    expect(redirectUrl.toString()).toContain("/login");

                    vi.clearAllMocks();
                }
            )
        );
    });

    it("should allow authenticated users to access general dashboard routes", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "/dashboard",
                    "/dashboard/orders",
                    "/dashboard/products"
                ),
                fc.constantFrom("user", "admin", "moderator"),
                (path, role) => {
                    const authState = {
                        state: {
                            accessToken: "token",
                            user: { role },
                        },
                    };

                    const req = {
                        nextUrl: { pathname: path },
                        url: `http://localhost${path}`,
                        cookies: {
                            get: () => ({ value: JSON.stringify(authState) }),
                        },
                    } as unknown as NextRequest;

                    middleware(req);

                    expect(NextResponse.next).toHaveBeenCalled();

                    vi.clearAllMocks();
                }
            )
        );
    });

    it("should redirect non-admin users from admin-only routes", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "/dashboard/users",
                    "/dashboard/settings",
                    "/dashboard/reports"
                ),
                fc.constantFrom("user", "moderator"),
                (path, role) => {
                    const authState = {
                        state: {
                            accessToken: "token",
                            user: { role },
                        },
                    };

                    const req = {
                        nextUrl: { pathname: path },
                        url: `http://localhost${path}`,
                        cookies: {
                            get: () => ({ value: JSON.stringify(authState) }),
                        },
                    } as unknown as NextRequest;

                    middleware(req);

                    expect(NextResponse.redirect).toHaveBeenCalled();
                    const redirectUrl = (NextResponse.redirect as Mock).mock
                        .lastCall![0];
                    expect(redirectUrl.toString()).toContain("/unauthorized");

                    vi.clearAllMocks();
                }
            )
        );
    });

    it("should allow admin users to access admin-only routes", () => {
        fc.assert(
            fc.property(
                fc.constantFrom(
                    "/dashboard/users",
                    "/dashboard/settings",
                    "/dashboard/reports"
                ),
                (path) => {
                    const authState = {
                        state: {
                            accessToken: "token",
                            user: { role: "admin" },
                        },
                    };

                    const req = {
                        nextUrl: { pathname: path },
                        url: `http://localhost${path}`,
                        cookies: {
                            get: () => ({ value: JSON.stringify(authState) }),
                        },
                    } as unknown as NextRequest;

                    middleware(req);

                    expect(NextResponse.next).toHaveBeenCalled();

                    vi.clearAllMocks();
                }
            )
        );
    });
});
