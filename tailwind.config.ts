import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — professional deep blue
        brand: {
          50:  "#f0f7ff",
          100: "#e0efff",
          200: "#bae0ff",
          300: "#7fc8ff",
          400: "#47b0ff",
          500: "#0f4c75",
          600: "#0c3a5a",
          700: "#082d47",
          800: "#051f33",
          900: "#031620",
          950: "#001119",
        },
        // Sidebar specific — premium dark blue
        navy: {
          50:  "#f5f8fc",
          100: "#eef3f9",
          200: "#dce5f2",
          300: "#bfc9e0",
          400: "#8fa3cc",
          500: "#4f5a7a",
          600: "#374557",
          700: "#0f1f45",
          800: "#0a1530",
          900: "#050d20",
          950: "#030810",
        },
        // HC accent — professional cyan
        hc: {
          50:  "#ecfbff",
          100: "#d6f5ff",
          200: "#b0ebff",
          300: "#80deff",
          400: "#00b4d8",
          500: "#0096c7",
          600: "#0077b6",
          700: "#005fa3",
          800: "#004a88",
          900: "#003d6f",
        },
        // HP accent — sophisticated coral
        hp: {
          50:  "#fff5f0",
          100: "#ffe5d9",
          200: "#ffc9b3",
          300: "#ffb399",
          400: "#ff9f7f",
          500: "#ff7f50",
          600: "#e66a42",
          700: "#c95535",
          800: "#a84228",
          900: "#87331e",
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
        sans: ["Outfit", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Geist Mono", "JetBrains Mono", "system-ui", "monospace"],
        mono: ["JetBrains Mono", "var(--font-jetbrains)", "Fira Code", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "card":      "0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.08)",
        "card-md":   "0 4px 12px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.06)",
        "card-lg":   "0 10px 25px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.07)",
        "card-xl":   "0 20px 40px rgba(0,0,0,.12), 0 8px 16px rgba(0,0,0,.08)",
        "glow-hc":   "0 0 24px rgba(0,180,216,.35), inset 0 1px 0 rgba(255,255,255,.2)",
        "glow-hp":   "0 0 24px rgba(255,127,80,.30), inset 0 1px 0 rgba(255,255,255,.2)",
        "glow-brand":"0 0 24px rgba(15,76,117,.25), inset 0 1px 0 rgba(255,255,255,.15)",
      },
      animation: {
        // Entrada y salida
        "fade-in":     "fadeIn 0.4s ease-out",
        "fade-out":    "fadeOut 0.3s ease-in",
        "slide-up":    "slideUp 0.5s ease-out",
        "slide-down":  "slideDown 0.5s ease-out",
        "slide-in-l":  "slideInLeft 0.5s ease-out",
        "slide-in-r":  "slideInRight 0.5s ease-out",

        // Escala y zoom
        "scale-in":    "scaleIn 0.3s ease-out",
        "scale-out":   "scaleOut 0.3s ease-in",
        "pop-in":      "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",

        // Pulso y brillo
        "pulse-slow":  "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "shimmer":     "shimmer 2s infinite",
        "float":       "float 3s ease-in-out infinite",
        "bounce-sm":   "bounceSm 1.5s ease-in-out infinite",

        // Rotación y perspectiva
        "rotate-in":   "rotateIn 0.5s ease-out",
        "flip":        "flip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",

        // Stagger (para múltiples elementos)
        "stagger-1":   "slideUp 0.5s ease-out 0.05s forwards",
        "stagger-2":   "slideUp 0.5s ease-out 0.1s forwards",
        "stagger-3":   "slideUp 0.5s ease-out 0.15s forwards",
        "stagger-4":   "slideUp 0.5s ease-out 0.2s forwards",
        "stagger-5":   "slideUp 0.5s ease-out 0.25s forwards",
        "stagger-6":   "slideUp 0.5s ease-out 0.3s forwards",

        // Draw animations para gráficos
        "draw":        "draw 1.5s ease-in-out forwards",

        // Barra de progreso
        "fill-bar":    "fillBar 1.2s ease-out forwards",
      },
      keyframes: {
        // Básicas
        fadeIn:    { "0%": { opacity: "0" },             "100%": { opacity: "1" } },
        fadeOut:   { "0%": { opacity: "1" },             "100%": { opacity: "0" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInLeft:  { "0%": { opacity: "0", transform: "translateX(-30px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(30px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },

        // Escala
        scaleIn:   { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        scaleOut:  { "0%": { opacity: "1", transform: "scale(1)" }, "100%": { opacity: "0", transform: "scale(0.95)" } },
        popIn:     { "0%": { opacity: "0", transform: "scale(0.8)" }, "50%": { transform: "scale(1.05)" }, "100%": { opacity: "1", transform: "scale(1)" } },

        // Pulso y brillo
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59,130,246,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59,130,246,0.6)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        bounceSm: {
          "0%, 100%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-3px)" },
          "50%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(-2px)" },
        },

        // Rotación
        rotateIn: {
          "0%": { opacity: "0", transform: "rotate(-10deg) scale(0.95)" },
          "100%": { opacity: "1", transform: "rotate(0) scale(1)" },
        },
        flip: {
          "0%": { opacity: "0", transform: "rotateY(90deg)" },
          "100%": { opacity: "1", transform: "rotateY(0)" },
        },

        // Draw para gráficos
        draw: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },

        // Fill bar
        fillBar: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "gradient-brand":   "linear-gradient(135deg, #0f4c75 0%, #082d47 50%, #051f33 100%)",
        "gradient-hc":      "linear-gradient(135deg, #00b4d8 0%, #0096c7 100%)",
        "gradient-hp":      "linear-gradient(135deg, #ff7f50 0%, #e66a42 100%)",
        "gradient-savings": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-subtle":  "linear-gradient(to bottom, rgba(15,76,117,0.03) 0%, rgba(0,180,216,0.02) 100%)",
      },
      backdropBlur: {
        "xs": "2px",
        "sm": "4px",
        "md": "8px",
        "lg": "12px",
        "xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
