/**
 * Session utilities for role-based cookie storage.
 *
 * Since the access token is stored in localStorage (not readable by middleware),
 * we store the user's role in a cookie so middleware can enforce RBAC on
 * protected routes without needing to hit the auth API on every request.
 *
 * Security note: This cookie is NOT httpOnly (it must be writable from client-side
 * JS). Treat it as a convenience hint for routing only — never as a security token.
 * The actual backend API still validates the Bearer token on every request.
 */

export const SESSION_ROLE_COOKIE = "user_role";

/**
 * Writes the user role into a cookie so Next.js middleware can read it
 * for route-level access control.
 */
export function setSessionRole(role: string): void {
  if (typeof document === "undefined") return;
  // SameSite=Lax prevents CSRF while still working with navigations.
  document.cookie = `${SESSION_ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`; // 7 days
}

/**
 * Removes the role cookie on logout.
 */
export function clearSessionRole(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_ROLE_COOKIE}=; path=/; SameSite=Lax; Max-Age=0`;
}

/**
 * Reads the role cookie on the client side.
 */
export function getSessionRole(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_ROLE_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
