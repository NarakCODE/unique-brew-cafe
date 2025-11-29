import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Get the auth cookie
    const authCookie = request.cookies.get("auth-storage");

    let isAuthenticated = false;
    let userRole = null;

    if (authCookie) {
        try {
            const parsed = JSON.parse(authCookie.value);
            // zustand persist stores data in { state: { ... }, version: 0 }
            if (parsed.state && parsed.state.accessToken) {
                isAuthenticated = true;
                userRole = parsed.state.user?.role;
            }
        } catch {
            // Invalid cookie
        }
    }

    const { pathname } = request.nextUrl;

    // Define protected routes
    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password");
    // Assuming dashboard is the main protected area
    const isDashboardPage =
        pathname.startsWith("/dashboard") || pathname === "/";
    // Actually "/" might be landing page, but if it's an admin dashboard app, maybe "/" redirects to dashboard or login.
    // The specs say "Create dashboard home page ... app/(dashboard)/page.tsx".
    // Usually "/" redirects to "/dashboard" or is the dashboard.

    // Redirect to dashboard if already authenticated and on auth page
    if (isAuthenticated && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect to login if not authenticated and on dashboard page
    // Note: If "/" is public, remove it from here. Assuming "/" is protected or redirects.
    // Let's assume "/" is public or handled separately, but "/dashboard" is definitely protected.
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (isAuthenticated && isDashboardPage) {
        // Admin-only routes
        const adminRoutes = [
            "/dashboard/users",
            "/dashboard/settings",
            "/dashboard/reports",
        ];
        const isAdminRoute = adminRoutes.some((route) =>
            pathname.startsWith(route)
        );

        if (isAdminRoute && userRole !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
