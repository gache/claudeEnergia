import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — deep navy/blue for energy dashboards
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#1e2d6b",
          950: "#0f172a",
        },
        // Sidebar specific — deep navy
        navy: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#1e3a6e",
          800: "#172554",
          900: "#0f1f45",
          950: "#080f2a",
        },
        // HC accent — teal/cyan
        hc: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        // HP accent — warm amber/orange
        hp: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Success / savings
        savings: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        // Legacy green (kept for compatibility)
        energia: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Sora", "var(--font-sora)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "var(--font-jetbrains)", "Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "card":    "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)",
        "card-md": "0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.07)",
        "card-lg": "0 10px 15px -3px rgba(0,0,0,.08), 0 4px 6px -4px rgba(0,0,0,.05)",
        "glow-hc": "0 0 20px rgba(6,182,212,.25)",
        "glow-hp": "0 0 20px rgba(245,158,11,.20)",
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease-out",
        "slide-up":    "slideUp 0.5s ease-out",
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-in":    "scaleIn 0.3s ease-out",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "shimmer":     "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" },             "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        scaleIn:   { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        glowPulse: { "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(59,130,246,0.6)" } },
        shimmer:   { "0%": { backgroundPosition: "-1000px 0" }, "100%": { backgroundPosition: "1000px 0" } },
      },
      backgroundImage: {
        "gradient-brand":   "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 50%, #080f2a 100%)",
        "gradient-hc":      "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        "gradient-hp":      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-savings": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
