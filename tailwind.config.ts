import type { Config } from "tailwindcss";

/**
 * DW / FITNESS design tokens.
 * Canonical CSS variables live in `src/app/globals.css`; this file maps them
 * into Tailwind utilities and documents the mobile-first dark PWA contract.
 */
const config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "320px",
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        timer: {
          DEFAULT: "var(--timer)",
          foreground: "var(--timer-foreground)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgb(255 255 255 / 0.04) inset",
      },
      spacing: {
        nav: "4.75rem",
        "safe-b": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
} satisfies Config;

export default config;
