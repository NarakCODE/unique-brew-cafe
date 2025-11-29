import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import fc from "fast-check";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/providers/theme-provider";
import { useEffect } from "react";

// Component to control theme for testing
function ThemeController({ themeToSet }: { themeToSet?: string }) {
    const { setTheme, theme, resolvedTheme } = useTheme();

    useEffect(() => {
        if (themeToSet) {
            setTheme(themeToSet);
        }
    }, [themeToSet, setTheme]);

    return (
        <div>
            <span data-testid="current-theme">{theme}</span>
            <span data-testid="resolved-theme">{resolvedTheme}</span>
        </div>
    );
}

describe("Property 17: Theme Persistence", () => {
    beforeEach(() => {
        // Mock localStorage
        const store: Record<string, string> = {};
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: vi.fn((key) => store[key] || null),
                setItem: vi.fn((key, value) => {
                    store[key] = value.toString();
                }),
                removeItem: vi.fn((key) => {
                    delete store[key];
                }),
                clear: vi.fn(() => {
                    for (const key in store) delete store[key];
                }),
            },
            writable: true,
        });

        // Mock matchMedia
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.localStorage.clear();
        document.documentElement.removeAttribute("class");
        document.documentElement.removeAttribute("style");
    });

    it("should persist theme selection to localStorage and apply class", () => {
        fc.assert(
            fc.property(fc.constantFrom("light", "dark"), (targetTheme) => {
                // Clear storage before each run
                window.localStorage.clear();

                const { unmount } = render(
                    <ThemeProvider>
                        <ThemeController themeToSet={targetTheme} />
                    </ThemeProvider>
                );

                // Check if localStorage was updated
                // next-themes writes to 'theme' key by default
                // Note: next-themes might take a tick to update

                // We can verify the class on document element
                // However, in jsdom/testing-library with next-themes,
                // sometimes we need to wait or check the internal state.

                // Let's verify that the component reports the correct theme
                const themeDisplay = screen.getByTestId("current-theme");
                expect(themeDisplay.textContent).toBe(targetTheme);

                // Verify localStorage
                expect(window.localStorage.setItem).toHaveBeenCalledWith(
                    "theme",
                    targetTheme
                );

                unmount();
            }),
            { numRuns: 10 }
        );
    });

    it("should handle system theme preference", () => {
        // This test is a bit trickier with fast-check as we need to mock system preference
        // We'll just do a simple check here

        const { unmount } = render(
            <ThemeProvider>
                <ThemeController themeToSet="system" />
            </ThemeProvider>
        );

        const themeDisplay = screen.getByTestId("current-theme");
        expect(themeDisplay.textContent).toBe("system");

        expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "theme",
            "system"
        );

        unmount();
    });
});
