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
        bg: "#FAFAF8",
        surface: "#FFFFFF",
        ink: "#1A1A1A",
        secondary: "#6B6B6B",
        tertiary: "#999999",
        divider: "#E8E6E3",
        accent: "#1A1A1A",
        highlight: "#F5F3F0",
        active: "#F0EDE8",
        // Legacy aliases
        muted: "#6B6B6B",
        border: "#E8E6E3",
        tag: "#F5F3F0",
        subtle: "#F5F3F0",
        social: "#1A1A1A",
        "social-light": "#E8E6E3",
        hot: "#D4763C",
        cold: "#6B6B6B",
        money: "#6B6B6B",
        amber: "#D4763C",
        glow: "rgba(212,118,60,0.08)",
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '800' }],
        'headline': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '16px',
        'button': '10px',
        'avatar': '12px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
        'card': '0 0 0 1px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06)',
        'glow': '0 0 24px rgba(212,118,60,0.06)',
        'glow-amber': '0 0 32px rgba(212,118,60,0.1)',
        'modal': '0 4px 24px rgba(0,0,0,0.12)',
        'nav-amber': '0 -1px 16px rgba(212,118,60,0.06)',
      },
      minHeight: {
        'hero': '480px',
      },
    },
  },
  plugins: [],
};

export default config;
