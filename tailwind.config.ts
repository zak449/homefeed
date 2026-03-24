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
        bg: "#111111",
        surface: "#1A1A1A",
        ink: "#F2F0ED",
        secondary: "#9A9A9A",
        tertiary: "#666666",
        divider: "#2A2A2A",
        accent: "#F2F0ED",
        highlight: "#1E1E1E",
        active: "#252525",
        // Legacy aliases
        muted: "#9A9A9A",
        border: "#2A2A2A",
        tag: "#1E1E1E",
        subtle: "#1E1E1E",
        social: "#F2F0ED",
        "social-light": "#2A2A2A",
        hot: "#D4763C",
        cold: "#9A9A9A",
        money: "#9A9A9A",
        amber: "#D4763C",
        glow: "rgba(212,118,60,0.08)",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
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
        'card': '16px',
        'button': '10px',
        'avatar': '12px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.15)',
        'hover': '0 4px 12px rgba(0,0,0,0.3), 0 12px 36px rgba(0,0,0,0.25)',
        'card': '0 0 0 1px rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.3), 0 12px 48px rgba(0,0,0,0.25)',
        'glow': '0 0 32px rgba(212,118,60,0.12)',
        'glow-amber': '0 0 48px rgba(212,118,60,0.18)',
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
