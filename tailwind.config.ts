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
        muted:     "#737373",
        border:    "#E5E5E5",
        accent:    "#0F0F0F",
        "accent-hover": "#333333",
        hot:       "#EF4444",
        cold:      "#2563EB",
        money:     "#16A34A",
        purple:    "#7C3AED",
        tag:       "#F5F5F5",
        subtle:    "#FAFAFA",
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
    },
  },
  plugins: [],
};

export default config;
