import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F6FAFF",
        foreground: "#0F172A",
        card: "#FFFFFF",
        "card-foreground": "#0F172A",
        border: "rgba(255, 255, 255, 0.42)",
        input: "rgba(15, 23, 42, 0.08)",
        primary: {
          DEFAULT: "#4F8CFF",
          foreground: "#FFFFFF",
          hover: "#3A73E8",
          soft: "#EAF2FF"
        },
        secondary: "#EFF6FF",
        "secondary-foreground": "#0F172A",
        muted: "#F8FBFF",
        "muted-foreground": "#64748B",
        accent: "#EFF6FF",
        "accent-foreground": "#0F172A",
        success: "#34D399",
        warning: "#FF5A5F",
        danger: "#FF5A5F",
        ring: "#4F8CFF",
        mint: {
          DEFAULT: "#34D399",
          soft: "#E9FFF6",
          hover: "#10B981"
        },
        coral: {
          DEFAULT: "#FF5A5F",
          soft: "#FFEDEE",
          hover: "#E5484D"
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.62)",
          strong: "rgba(255, 255, 255, 0.78)",
          border: "rgba(255, 255, 255, 0.42)"
        },
        mutedText: "#64748B",
        borderSoft: "rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl2: "1.25rem",
        xl3: "1.5rem"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)",
        glass: "0 20px 60px rgba(79, 140, 255, 0.14)",
        card: "0 12px 40px rgba(15, 23, 42, 0.08)"
      },
      backdropBlur: {
        glass: "18px"
      }
    }
  },
  plugins: []
};

export default config;
