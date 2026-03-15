import { NAV_THEME } from "@/theme";

const THEME_VARIABLES = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  popover: "var(--popover)",
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  destructive: "var(--destructive)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  radius: "var(--radius)",
} as const;

export { NAV_THEME, THEME_VARIABLES };
