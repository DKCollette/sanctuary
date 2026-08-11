import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        brand: {
          50: "#f0e6ff",
          100: "#d4bfff",
          200: "#b894ff",
          300: "#9c6aff",
          400: "#8040ff",
          500: "#6b21a8",
          600: "#581c87",
          700: "#3b0764",
          800: "#2e1065",
          900: "#1e1b4b",
        },
        gold: {
          50: "#fff9e6",
          100: "#ffedb3",
          200: "#ffe180",
          300: "#ffd54d",
          400: "#ffc91a",
          500: "#e6b800",
          600: "#b38f00",
          700: "#806600",
          800: "#4d3d00",
          900: "#1a1400",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 4s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "sacred-in": "sacredEntrance 1.2s ease-out forwards",
        "sacred-breath": "sacredBreath 6s ease-in-out infinite",
        "nebula-drift": "nebulaDrift 20s ease-in-out infinite",
        "star-twinkle": "starTwinkle 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        sacredEntrance: {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.97)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
        },
        sacredBreath: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        nebulaDrift: {
          "0%, 100%": { opacity: "0.3", transform: "translate(0, 0) scale(1)" },
          "25%": { opacity: "0.6", transform: "translate(30px, -20px) scale(1.05)" },
          "50%": { opacity: "0.4", transform: "translate(-20px, 30px) scale(0.95)" },
          "75%": { opacity: "0.5", transform: "translate(40px, 10px) scale(1.02)" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.5)" },
          "20%": { opacity: "0.2" },
          "40%": { opacity: "1", transform: "scale(1)" },
          "60%": { opacity: "0.3" },
          "80%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;