import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept so untouched auth/admin/profile pages keep rendering
        gdriveBg: "#f8f9fa",
        gdriveSurface: "#ffffff",
        gdriveSearchBg: "#edf2fc",
        gdrivePillActive: "#c2e7ff",
        gdrivePillText: "#001d35",
        gdriveBlue: "#0b57d0",
        gdriveBorder: "#e1e3e1",
        gdriveCardBg: "#f0f4f9",
        gdriveTextMain: "#1f1f1f",
        gdriveTextMuted: "#444746",
        background: "#f8f9fa",
        textMain: "#1f1f1f",
        textMuted: "#444746",
        borderDark: "#e1e3e1",
        secondary: "#00639b",
        // Vicharmitra academic glassmorphism palette
        canvas: "var(--vm-canvas)",
        surface: "var(--vm-surface)",
        "surface-glass": "var(--vm-surface-glass)",
        border: "var(--vm-border)",
        "text-main": "var(--vm-text-main)",
        "text-muted": "var(--vm-text-muted)",
        primary: {
          DEFAULT: "#6366F1",
          light: "#818CF8",
          dark: "#4F46E5",
        },
        accent: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          dark: "#0891B2",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "28px",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(99,102,241,0.4)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 6px rgba(99,102,241,0)" },
        },
        highlightWave: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "30%": { opacity: "1", transform: "scale(1.02)" },
          "100%": { opacity: "0.55", transform: "scale(1)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        slideUp: "slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        pulseGlow: "pulseGlow 1.6s ease-in-out infinite",
        highlightWave: "highlightWave 1.1s cubic-bezier(0.3,0.8,0.4,1) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
