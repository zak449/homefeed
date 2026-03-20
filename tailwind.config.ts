import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        "#FFFFFF",
        surface:   "#FFFFFF",
        ink:       "#0F0F0F",
        muted:     "#6B7280",
        border:    "#E5E7EB",
        accent:    "#0F0F0F",
        "accent-hover": "#333333",
        hot:       "#EF4444",
        cold:      "#3B82F6",
        money:     "#16A34A",
        purple:    "#7C3AED",
        tag:       "#F3F4F6",
        subtle:    "#FAFAFA",
        // Social layer colors
        social:    "#FF6B2C",   // warm orange — the "conversation" accent
        "social-light": "#FFF7ED",
        "social-muted": "#FDBA74",
      },
      fontFamily: {
        display: ['"DM Sans"', "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        sans:    ['"Inter"', "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        card:        "0 0 0 1px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)",
        "card-hover": "0 0 0 1px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        nav:         "0 1px 0 rgba(0,0,0,0.04)",
        modal:       "0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        button:      "0 1px 2px rgba(0,0,0,0.05)",
        glow:        "0 0 20px rgba(255,107,44,0.15)",
      },
      fontSize: {
        "2xs":     ["0.625rem", { lineHeight: "1" }],
        "price":   ["1.75rem", { lineHeight: "1.1", fontWeight: "600", letterSpacing: "-0.025em" }],
        "price-sm": ["1.125rem", { lineHeight: "1.1", fontWeight: "600", letterSpacing: "-0.025em" }],
      },
      letterSpacing: {
        "tighter": "-0.03em",
        "display": "-0.04em",
      },
      keyframes: {
        "activity-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "activity-pulse": "activity-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
