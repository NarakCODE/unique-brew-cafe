"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 29 * 60 * 1000; // 29 minutes (1 minute warning)

export function SessionTimeoutHandler() {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const lastActivityRef = useRef<number>(0);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
        logout();
        setShowWarning(false);
        router.push("/login?reason=timeout");
    }, [logout, router]);

    const startTimers = useCallback(() => {
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true);
        }, WARNING_MS);

        logoutTimeoutRef.current = setTimeout(() => {
            handleLogout();
        }, TIMEOUT_MS);
    }, [handleLogout]);

    const resetSession = useCallback(() => {
        if (!isAuthenticated) return;

        lastActivityRef.current = Date.now();
        setShowWarning(false);
        startTimers();
    }, [isAuthenticated, startTimers]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Initial setup
        lastActivityRef.current = Date.now();
        startTimers();

        // Event listeners for activity
        const events = ["mousedown", "keydown", "scroll", "touchstart"];

        // Throttle the reset to avoid performance issues
        let throttleTimer: NodeJS.Timeout | null = null;
        const handleActivity = () => {
            if (!throttleTimer) {
                throttleTimer = setTimeout(() => {
                    resetSession();
                    throttleTimer = null;
                }, 1000); // Throttle to 1 second
            }
        };

        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            if (warningTimeoutRef.current)
                clearTimeout(warningTimeoutRef.current);
            if (logoutTimeoutRef.current)
                clearTimeout(logoutTimeoutRef.current);
            if (throttleTimer) clearTimeout(throttleTimer);
        };
    }, [isAuthenticated, startTimers, resetSession]);

    return (
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expiring</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your session is about to expire due to inactivity. You
                        will be logged out in 1 minute. Click &quot;Stay Logged
                        In&quot; to continue your session.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={resetSession}>
                        Stay Logged In
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
