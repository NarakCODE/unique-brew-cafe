import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Custom redirects from original middleware
  if (pathname === "/login") {
    // We strictly use /sign-in, so we redirect there.
    // If we want to support localization for this redirect, we should probably
    // let next-intl handle the prefixing or do it manually.
    // For now, let's redirect to the root path-relative /sign-in which next-intl will pick up?
    // No, if I return a Redirect response, it ends there.
    // I'll redirect to /sign-in, and the browser will request /sign-in,
    // which will then be matched by next-intl and redirected to /en/sign-in.
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/auth/sign-up", request.url));
  }

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
