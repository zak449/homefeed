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
        bg:        "#FAFAF7",
        surface:   "#FFFFFF",
        ink:       "#1A1A2E",
        muted:     "#6B7280",
        border:    "#E5E7EB",
        accent:    "#FF4D4F",
        "accent-hover": "#E6393B",
        hot:       "#FF6B35",
        cold:      "#3B82F6",
        money:     "#10B981",
        purple:    "#8B5CF6",
        tag:       "#F3F4F6",
      },
      fontFamily: {
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        sans:    ['"Inter"', "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:      "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        nav:       "0 1px 3px rgba(0,0,0,0.04)",
        modal:     "0 25px 50px rgba(0,0,0,0.15)",
      },
      fontSize: {
        "price":  ["2rem", { lineHeight: "1", fontWeight: "700" }],
        "price-sm": ["1.25rem", { lineHeight: "1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;
