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
        bg: "#FFFFFF",
        surface: "#F8F8F8",
        ink: "#1A1A1A",
        secondary: "#6E6E6E",
        tertiary: "#9E9E9E",
        divider: "#F0F0F0",
        accent: "#1A1A1A",
        highlight: "#F5F0EB",
        active: "#E8E0D8",
        // Legacy aliases — map old tokens to new system
        muted: "#6E6E6E",
        border: "#F0F0F0",
        tag: "#F8F8F8",
        subtle: "#F8F8F8",
        social: "#1A1A1A",
        hot: "#1A1A1A",
        cold: "#6E6E6E",
        money: "#6E6E6E",
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
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
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        'card': '0 0 0 0.5px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.02)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
        'glow': '0 2px 8px rgba(0,0,0,0.06)',
        'modal': '0 4px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
