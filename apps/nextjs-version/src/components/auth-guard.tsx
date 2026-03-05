"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<
    "checking" | "authorized" | "unauthorized"
  >(() => {
    if (typeof window === "undefined") {
      return "checking";
    }

    return window.localStorage.getItem("accessToken")
      ? "authorized"
      : "unauthorized";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("accessToken");
    const nextState = token ? "authorized" : "unauthorized";
    setAuthState(nextState);

    if (nextState === "unauthorized") {
      router.replace("/login");
    }
  }, [router]);

  if (authState !== "authorized") {
    return (
      <div className="flex bg-background h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
