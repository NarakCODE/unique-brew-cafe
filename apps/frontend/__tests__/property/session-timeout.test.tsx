import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SessionTimeoutHandler } from "@/components/auth/session-timeout-handler";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("@/providers/auth-provider", () => ({
    useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

describe("Property 18: Session Expiration", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should trigger logout and redirect after timeout period", () => {
        const mockLogout = vi.fn();
        const mockPush = vi.fn();

        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            logout: mockLogout,
        });

        (useRouter as Mock).mockReturnValue({
            push: mockPush,
        });

        render(<SessionTimeoutHandler />);

        // Fast-forward time past timeout (30 mins)
        act(() => {
            vi.advanceTimersByTime(30 * 60 * 1000 + 1000);
        });

        expect(mockLogout).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/login?reason=timeout");
    });

    it("should show warning before timeout", () => {
        const mockLogout = vi.fn();

        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            logout: mockLogout,
        });

        (useRouter as Mock).mockReturnValue({
            push: vi.fn(),
        });

        render(<SessionTimeoutHandler />);

        // Fast-forward time to warning (29 mins)
        act(() => {
            vi.advanceTimersByTime(29 * 60 * 1000 + 100);
        });

        // Check if dialog is open (by looking for text)
        expect(screen.getByText(/Session Expiring/i)).toBeInTheDocument();

        // Should not have logged out yet
        expect(mockLogout).not.toHaveBeenCalled();
    });

    it("should reset timer on activity", () => {
        const mockLogout = vi.fn();

        (useAuth as Mock).mockReturnValue({
            isAuthenticated: true,
            logout: mockLogout,
        });

        (useRouter as Mock).mockReturnValue({
            push: vi.fn(),
        });
        render(<SessionTimeoutHandler />);

        // Advance time a bit
        act(() => {
            vi.advanceTimersByTime(15 * 60 * 1000);
        });

        // Simulate activity
        act(() => {
            window.dispatchEvent(new Event("mousedown"));
        });

        // Advance time past original timeout but within new timeout
        act(() => {
            vi.advanceTimersByTime(16 * 60 * 1000); // Total 31 mins from start, but only 16 from reset
        });

        expect(mockLogout).not.toHaveBeenCalled();
    });
});
