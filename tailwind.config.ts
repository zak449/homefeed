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
        coral:     "#FF6B6B",
        goldenrod: "#FFD93D",
        sage:      "#6BCB77",
        sky:       "#4D96FF",
        lavender:  "#C77DFF",
        clay:      "#FF9A3C",
        ink:       "#1A1A2E",
        cream:     "#FAFAF7",
      },
      fontFamily: {
        display: ["DM Serif Display", "Georgia", "serif"],
        sans:    ["DM Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
