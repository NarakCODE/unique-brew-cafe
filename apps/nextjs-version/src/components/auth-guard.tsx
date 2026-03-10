"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSessionRole } from "@/lib/session";

type AuthState = "checking" | "authorized" | "unauthorized" | "forbidden";

/**
 * AuthGuard — client-side enforcement layer for dashboard routes.
 *
 * This acts as a second line of defence after the middleware RBAC check.
 * It ensures that even if the middleware cookie check is somehow bypassed
 * (e.g., a stale cookie was cleared but localStorage still has a token),
 * the dashboard never renders for non-admin users.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>(() => {
    // SSR guard
    if (typeof window === "undefined") return "checking";

    const token = window.localStorage.getItem("accessToken");
    if (!token) return "unauthorized";

    const role = getSessionRole();
    return role === "admin" ? "authorized" : "forbidden";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");

    if (!token) {
      setAuthState("unauthorized");
      router.replace("/sign-in");
      return;
    }

    const role = getSessionRole();

    if (role === "admin") {
      setAuthState("authorized");
    } else {
      setAuthState("forbidden");
      router.replace("/unauthorized");
    }
  }, [router]);

  if (authState === "authorized") {
    return <>{children}</>;
  }

  // Show a spinner while we determine auth state (checking / redirecting)
  return (
    <div className="flex bg-background h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
