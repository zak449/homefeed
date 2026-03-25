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
        bg: "#0A0A0F",
        surface: "#1E1E2A",
        elevated: "#282838",
        ink: "rgba(255,255,255,0.92)",
        secondary: "rgba(255,255,255,0.60)",
        tertiary: "rgba(255,255,255,0.38)",
        divider: "rgba(255,255,255,0.12)",
        accent: "#FF4D00",
        "accent-warm": "#FFAA00",
        trust: "#0D9488",
        // Legacy aliases
        highlight: "#282838",
        active: "#282838",
        muted: "rgba(255,255,255,0.55)",
        border: "rgba(255,255,255,0.12)",
        tag: "#282838",
        subtle: "#1E1E2A",
        social: "rgba(255,255,255,0.92)",
        "social-light": "rgba(255,255,255,0.12)",
        hot: "#FF4D00",
        cold: "rgba(255,255,255,0.55)",
        money: "#FFAA00",
        amber: "#FF4D00",
        "red-flag": "#FF3B3B",
        glow: "rgba(255,77,0,0.10)",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.035em', fontWeight: '700' }],
        'headline': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '600' }],
        'title': ['1.0625rem', { lineHeight: '1.4', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'avatar': '8px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.15)',
        'hover': '0 4px 12px rgba(0,0,0,0.3), 0 12px 36px rgba(0,0,0,0.25)',
        'card': '0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.3), 0 12px 48px rgba(0,0,0,0.25)',
        'glow': '0 0 32px rgba(255,77,0,0.12)',
        'glow-amber': '0 0 48px rgba(255,77,0,0.18)',
        'modal': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'nav': '0 1px 0 rgba(255,255,255,0.04)',
        'nav-amber': '0 -1px 24px rgba(212,118,60,0.12)',
        'elevated': '0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
        'glass': '0 4px 30px rgba(0,0,0,0.2)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      minHeight: {
        'hero': '480px',
      },
    },
  },
  plugins: [],
};

export default config;
