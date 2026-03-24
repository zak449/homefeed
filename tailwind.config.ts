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
        bg: "#0A0A0A",
        surface: "#141210",
        ink: "#F2F0ED",
        secondary: "#A09D9A",
        tertiary: "#5E5B58",
        divider: "#2A2520",
        accent: "#F2F0ED",
        highlight: "#1E1B16",
        active: "#252320",
        // Legacy aliases — map old tokens to new system
        muted: "#A09D9A",
        border: "#2A2520",
        tag: "#141210",
        subtle: "#141210",
        social: "#F2F0ED",
        "social-light": "#2A2520",
        hot: "#E8A87C",
        cold: "#A09D9A",
        money: "#A09D9A",
        amber: "#E8A87C",
        glow: "rgba(232,168,124,0.10)",
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
        'soft': '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
        'hover': '0 2px 8px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        'card': '0 0 0 1px rgba(255,255,255,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        'glow': '0 0 24px rgba(232,168,124,0.08)',
        'glow-amber': '0 0 32px rgba(232,168,124,0.15)',
        'modal': '0 4px 24px rgba(0,0,0,0.6)',
        'nav-amber': '0 -1px 16px rgba(232,168,124,0.08)',
      },
      minHeight: {
        'hero': '480px',
      },
    },
  },
  plugins: [],
};

export default config;
