"use client";

import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearSessionRole } from "@/lib/session";

/**
 * Shown when an authenticated user with a non-admin role attempts to access
 * a dashboard route.  Provides a clear explanation and an action to either
 * go to the public landing page or sign out.
 */
export function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = () => {
    // Clear all session data so the next login starts fresh
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearSessionRole();
    router.replace("/sign-in");
  };

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-6 p-8 md:gap-10 md:p-16 text-center">
      {/* Icon */}
      <div className="flex items-center justify-center rounded-full bg-destructive/10 p-6">
        <ShieldX className="h-16 w-16 text-destructive" aria-hidden="true" />
      </div>

      {/* Copy */}
      <div className="max-w-md space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Error 403 &mdash; Forbidden
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Access Denied
        </h1>
        <p className="text-muted-foreground">
          The dashboard is only accessible to admin accounts. Your account does
          not have the required permissions to view this page.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          className="cursor-pointer min-w-40"
          onClick={() => router.push("/landing")}
        >
          Go to Shop
        </Button>
        <Button
          variant="outline"
          className="cursor-pointer min-w-40"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
