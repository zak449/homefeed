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
        sans: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
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
        'soft': '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        'hover': '0 4px 12px rgba(0,0,0,0.06), 0 12px 36px rgba(0,0,0,0.08)',
        'card': '0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.08), 0 12px 48px rgba(0,0,0,0.06)',
        'glow': '0 0 32px rgba(212,118,60,0.08)',
        'glow-amber': '0 0 48px rgba(212,118,60,0.12)',
        'modal': '0 8px 32px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)',
        'nav': '0 1px 0 rgba(0,0,0,0.04)',
        'nav-amber': '0 -1px 24px rgba(212,118,60,0.08)',
        'elevated': '0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
        'glass': '0 4px 30px rgba(0,0,0,0.05)',
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
