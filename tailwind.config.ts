import type { Config } from "tailwindcss";

/**
 * Gwaky design tokens — viral-design overhaul.
 *
 * Anchor color: Tea Magenta (#FF2E93). Distinctively un-corporate, screenshottable,
 * unclaimed in the real-estate category. Replaces the previous burnt orange #FF4D00,
 * which was visually under-deployed and chromatically dissonant on the cold near-black bg.
 *
 * Positive accent: Lime Spill (#C8FF3E) — used for streaks, money signals, "boiling" tea.
 * Background: Tea Stain (#0F0A14) — warm-ink near-black that lets magenta sing.
 *
 * See DESIGN_VISION.md for full rationale. Legacy color aliases at the bottom of the
 * `colors` block keep existing components compiling — they all redirect to the new palette.
 */

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand anchor + accents ───────────────────────────
        tea: {
          DEFAULT: "#FF2E93", // Tea Magenta — the brand
          50:  "#FFF0F8",
          100: "#FFD9EC",
          200: "#FFB1D8",
          300: "#FF7DBC",
          400: "#FF52A6",
          500: "#FF2E93", // ← anchor
          600: "#E61E80",
          700: "#B81568",
          800: "#7A0E45",
          900: "#3D0723",
        },
        lime: {
          DEFAULT: "#C8FF3E", // Lime Spill — streak / verified / boiling
          50:  "#F7FFE0",
          100: "#EEFFC2",
          200: "#DDFF85",
          300: "#C8FF3E", // ← positive accent
          400: "#A7E61E",
          500: "#85B815",
          600: "#5F8810",
          700: "#3D5808",
        },
        steam: {
          DEFAULT: "#FFF7E8", // Warm white — highlight / cream
          subtle:  "#F5EDD8",
        },
        flag: {
          DEFAULT: "#FF3B3B",
          glow:    "rgba(255, 59, 59, 0.18)",
        },
        mint: {
          DEFAULT: "#5EEAD4", // Trust — verified neighbor
          glow:    "rgba(94, 234, 212, 0.18)",
        },

        // ─── Surfaces ────────────────────────────────────────
        // Layered, warm-ink near-black with real depth between tiers.
        bg:       "#0F0A14", // app background — Tea Stain
        surface:  "#181221", // card on bg
        elevated: "#231A2E", // card on card / sheet
        overlay:  "#2D2240", // top of stack — dropdowns, modals
        scrim:    "rgba(8, 5, 12, 0.78)", // backdrop behind sheets/modals

        // ─── Type ────────────────────────────────────────────
        // Higher-contrast text tiers — old `tertiary` failed WCAG AA on dark bg.
        ink:       "rgba(255, 247, 232, 0.96)",
        secondary: "rgba(255, 247, 232, 0.74)", // body, captions  (>= 4.5:1 on bg)
        tertiary:  "rgba(255, 247, 232, 0.56)", // hints (raised from .38 → .56 for AA)
        muted:     "rgba(255, 247, 232, 0.42)", // disabled / decorative only

        // ─── Strokes ─────────────────────────────────────────
        divider:        "rgba(255, 247, 232, 0.10)",
        border:         "rgba(255, 247, 232, 0.14)",
        "border-strong":"rgba(255, 247, 232, 0.22)",

        // ─── Functional aliases (semantic names that point at brand) ───
        accent:        "#FF2E93", // → tea
        "accent-warm": "#FFB1D8",
        "accent-pop":  "#C8FF3E", // → lime
        trust:         "#5EEAD4",
        hot:           "#FF2E93",
        cold:          "rgba(255, 247, 232, 0.56)",
        money:         "#C8FF3E",
        "red-flag":    "#FF3B3B",
        glow:          "rgba(255, 46, 147, 0.16)",

        // ─── Legacy aliases (kept for backwards-compat with existing components) ───
        // Existing component code references these; we point them at the new palette
        // so nothing breaks at compile time. New code should use brand names directly.
        amber:           "#FF2E93", // ← was #FF4D00
        highlight:       "#231A2E",
        active:          "#231A2E",
        tag:             "#231A2E",
        subtle:          "#181221",
        social:          "rgba(255, 247, 232, 0.96)",
        "social-light":  "rgba(255, 247, 232, 0.10)",
      },

      fontFamily: {
        sans:    ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        // Tightened hierarchy — bigger gaps between tiers so eye has somewhere to rest.
        'mega':     ['3.75rem',  { lineHeight: '0.96', letterSpacing: '-0.04em',  fontWeight: '700' }],
        'display':  ['2.625rem', { lineHeight: '1.04', letterSpacing: '-0.035em', fontWeight: '700' }],
        'headline': ['1.625rem', { lineHeight: '1.18', letterSpacing: '-0.025em', fontWeight: '700' }],
        'title':    ['1.0625rem',{ lineHeight: '1.4',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'body':     ['0.9375rem',{ lineHeight: '1.55', fontWeight: '400' }],
        'caption':  ['0.8125rem',{ lineHeight: '1.45', fontWeight: '500' }],
        'tag':      ['0.6875rem',{ lineHeight: '1',    letterSpacing: '0.06em',   fontWeight: '700' }],
      },

      borderRadius: {
        'card':   '14px',  // softer, more consumer-app
        'button': '10px',
        'avatar': '12px',
        'pill':   '9999px',
        'sheet':  '24px',
        'full':   '9999px',
      },

      boxShadow: {
        // Subtle layering shadows — used on surface + elevated tiers
        'soft':       '0 1px 2px rgba(0,0,0,0.32), 0 4px 16px rgba(0,0,0,0.22)',
        'hover':      '0 6px 18px rgba(0,0,0,0.42), 0 16px 40px rgba(0,0,0,0.28)',
        'card':       '0 0 0 1px rgba(255,247,232,0.06), 0 1px 3px rgba(0,0,0,0.28)',
        'card-hover': '0 6px 22px rgba(0,0,0,0.42), 0 18px 56px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,46,147,0.18)',
        'elevated':   '0 10px 30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,247,232,0.06)',
        'modal':      '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,247,232,0.08)',

        // Brand glows — used sparingly on the things that should pop
        'glow':       '0 0 32px rgba(255,46,147,0.20)',
        'glow-tea':   '0 0 28px rgba(255,46,147,0.30), 0 0 64px rgba(255,46,147,0.16)',
        'glow-lime':  '0 0 28px rgba(200,255,62,0.30), 0 0 64px rgba(200,255,62,0.14)',
        'glow-flag':  '0 0 28px rgba(255,59,59,0.28)',
        'glow-mint':  '0 0 24px rgba(94,234,212,0.25)',

        // Compatibility aliases for existing component code
        'glow-amber': '0 0 48px rgba(255,46,147,0.22)',
        'nav':        '0 1px 0 rgba(255,247,232,0.06)',
        'nav-amber':  '0 -1px 24px rgba(255,46,147,0.18)',
        'glass':      '0 4px 30px rgba(0,0,0,0.28)',
      },

      backdropBlur: {
        'glass': '20px',
        'sheet': '28px',
      },

      minHeight: {
        'hero': '480px',
      },

      // Motion timings — used by the new animation utilities in globals.css
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap':   'cubic-bezier(0.22, 1, 0.36, 1)',
        'pop':    'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '180': '180ms',
        '320': '320ms',
        '420': '420ms',
        '600': '600ms',
      },

      // Background gradients used by Tea Temperature gauge + accents
      backgroundImage: {
        'tea-gradient':  'linear-gradient(135deg, #FF2E93 0%, #FF7DBC 100%)',
        'lime-gradient': 'linear-gradient(135deg, #C8FF3E 0%, #A7E61E 100%)',
        'temp-gradient': 'linear-gradient(90deg, #5EEAD4 0%, #FF7DBC 50%, #FF2E93 80%, #C8FF3E 100%)',
        'tea-radial':    'radial-gradient(circle at 50% 0%, rgba(255,46,147,0.18) 0%, transparent 60%)',
      },

      keyframes: {
        // Tea gauge needle / dial sweep
        'gauge-sweep': {
          '0%':   { transform: 'rotate(-90deg)' },
          '100%': { transform: 'var(--tw-rotate, rotate(0deg))' },
        },
        // Boil — rapid magenta-to-lime pulse for boiling tea
        'boil': {
          '0%, 100%': { 'box-shadow': '0 0 24px rgba(200,255,62,0.4)',  filter: 'brightness(1)' },
          '50%':      { 'box-shadow': '0 0 36px rgba(255,46,147,0.6)',  filter: 'brightness(1.15)' },
        },
        // Spill-in — comment slides up + magenta flash
        'spill-in': {
          '0%':   { opacity: '0', transform: 'translateY(14px)', 'box-shadow': '0 0 0 0 rgba(255,46,147,0.4)' },
          '60%':  { opacity: '1', transform: 'translateY(0)',    'box-shadow': '0 0 0 6px rgba(255,46,147,0.18)' },
          '100%': { opacity: '1', transform: 'translateY(0)',    'box-shadow': '0 0 0 0 rgba(255,46,147,0)' },
        },
        // Streak ring — slow rotation under streak counter
        'streak-ring': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Live ping — for "12 watching now" indicators
        'tea-ping': {
          '0%':   { transform: 'scale(1)',   opacity: '0.85' },
          '70%':  { transform: 'scale(2.4)', opacity: '0' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        // Number tick — used by <LiveCount /> on increment
        'count-up': {
          '0%':   { transform: 'translateY(0.4em)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        // Hot badge entrance
        'badge-pop': {
          '0%':   { transform: 'scale(0.6) rotate(-12deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.18) rotate(4deg)',  opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)',     opacity: '1' },
        },
        'tea-pulse': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' },
        },
        // Background glow shimmer behind hero metrics
        'tea-shimmer': {
          '0%, 100%': { opacity: '0.28', transform: 'translate3d(0,0,0) scale(1)' },
          '50%':      { opacity: '0.55', transform: 'translate3d(0,-4px,0) scale(1.04)' },
        },
      },

      animation: {
        'gauge-sweep': 'gauge-sweep 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'boil':        'boil 1.6s ease-in-out infinite',
        'spill-in':    'spill-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'streak-ring': 'streak-ring 12s linear infinite',
        'tea-ping':    'tea-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
        'count-up':    'count-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        'badge-pop':   'badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'tea-pulse':   'tea-pulse 2.4s ease-in-out infinite',
        'tea-shimmer': 'tea-shimmer 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
