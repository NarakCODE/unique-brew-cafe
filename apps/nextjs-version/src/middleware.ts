import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_ROLE_COOKIE } from "./lib/session";

const handleI18nRouting = createMiddleware(routing);

/**
 * Route patterns that require the user to be authenticated AND have the
 * "admin" role.  We strip the locale prefix before matching.
 */
const ADMIN_ONLY_PATTERNS = [
  /^\/dashboard(\/.*)?$/,
  /^\/products(\/.*)?$/,
  /^\/categories(\/.*)?$/,
  /^\/stores(\/.*)?$/,
  /^\/users(\/.*)?$/,
  /^\/orders(\/.*)?$/,
  /^\/reports(\/.*)?$/,
  /^\/announcements(\/.*)?$/,
  /^\/support(\/.*)?$/,
  /^\/settings(\/.*)?$/,
  /^\/calendar(\/.*)?$/,
  /^\/tasks(\/.*)?$/,
  /^\/mail(\/.*)?$/,
  /^\/chat(\/.*)?$/,
];
const SUPPORTED_LOCALES = ["en", "kh"];

/**
 * Strips the locale segment from the beginning of the pathname so we can do
 * locale-agnostic route matching.
 */
function stripLocale(pathname: string): string {
  for (const locale of SUPPORTED_LOCALES) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function isAdminOnlyPath(pathname: string): boolean {
  const stripped = stripLocale(pathname);
  return ADMIN_ONLY_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Legacy redirect: /login → /sign-in
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 2. Legacy redirect: /register → /auth/sign-up
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/auth/sign-up", request.url));
  }

  // 3. Role-Based Access Control (RBAC) for admin-only dashboard routes.
  //    We read the `user_role` cookie that is written by the client at login.
  //    If the cookie is missing or is not "admin", we redirect to /unauthorized.
  if (isAdminOnlyPath(pathname)) {
    const roleCookie = request.cookies.get(SESSION_ROLE_COOKIE);
    const role = roleCookie?.value;

    if (!role) {
      // No role cookie → user is not authenticated at all.
      // Redirect to sign-in and preserve the intended destination.
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (role !== "admin") {
      // Authenticated but not an admin → access denied.
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 4. Let next-intl handle locale-aware routing for everything else.
  return handleI18nRouting(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/",
    "/(kh|en)/:path*",
    // Enable redirects that do not contain the locale
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
