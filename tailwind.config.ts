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
        bg:        "#FAF9F6",
        surface:   "#FFFFFF",
        ink:       "#1A1A2E",
        muted:     "#8B8B8B",
        border:    "#EEECE8",
        accent:    "#E8503A",
        "accent-hover": "#D4432F",
        hot:       "#F97316",
        cold:      "#3B82F6",
        money:     "#22C55E",
        purple:    "#8B5CF6",
        tag:       "#F5F3EF",
        warm:      "#FFF8F0",
        cream:     "#FDF6EC",
      },
      fontFamily: {
        display:   ['"DM Sans"', "system-ui", "sans-serif"],
        sans:      ['"Inter"', "system-ui", "sans-serif"],
        editorial: ['"Instrument Serif"', "Georgia", "serif"],
        mono:      ['"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:        "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 12px 28px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)",
        nav:         "0 1px 2px rgba(0,0,0,0.03)",
        modal:       "0 25px 60px rgba(0,0,0,0.12)",
        glow:        "0 0 20px rgba(232, 80, 58, 0.15)",
      },
      fontSize: {
        "price":   ["2rem", { lineHeight: "1", fontWeight: "700" }],
        "price-sm": ["1.25rem", { lineHeight: "1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};

export default config;
