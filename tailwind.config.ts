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
        coral:     "#FF4040",
        goldenrod: "#FFD000",
        sage:      "#4DB861",
        sky:       "#3A8EF6",
        lavender:  "#A855F7",
        clay:      "#FF6B00",
        mint:      "#00C9A7",
        pink:      "#FF5FA0",
        ink:       "#111111",
        cream:     "#FFF9F0",
      },
      fontFamily: {
        display: ["Archivo Black", "Arial Black", "sans-serif"],
        sans:    ["Space Grotesk", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      borderWidth: {
        "3": "3px",
      },
      boxShadow: {
        brute:      "4px 4px 0px #111111",
        "brute-lg": "6px 6px 0px #111111",
        "brute-sm": "2px 2px 0px #111111",
        "brute-w":  "4px 4px 0px #ffffff",
      },
    },
  },
  plugins: [],
};

export default config;
