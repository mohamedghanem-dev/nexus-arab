import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme (default)
        bg: {
          DEFAULT: '#080d1a',
          2: '#0d1220',
          3: '#111827',
        },
        accent: {
          DEFAULT: '#2563eb',  // blue-600
          light: '#60a5fa',    // blue-400
          cyan: '#06b6d4',     // cyan-500
          glow: 'rgba(37,99,235,0.35)',
        },
        ink: {
          DEFAULT: '#ffffff',
          2: 'rgba(255,255,255,0.70)',
          3: 'rgba(255,255,255,0.45)',
          4: 'rgba(255,255,255,0.25)',
        },
        glass: {
          border: 'rgba(255,255,255,0.08)',
          bg: 'rgba(255,255,255,0.04)',
        },
        // Light theme
        light: {
          bg: '#f0f4ff',
          bg2: '#e8eeff',
          text: '#0f172a',
          text2: '#334155',
          border: 'rgba(37,99,235,0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      backgroundImage: {
        'grad-blue': 'linear-gradient(135deg, #2563eb, #06b6d4)',
        'grad-dark': 'linear-gradient(180deg, #080d1a 0%, #0d1220 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22,1,0.36,1)',
        'fade-in': 'fadeIn 0.5s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(37,99,235,0.3)' },
          to:   { boxShadow: '0 0 40px rgba(37,99,235,0.6)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};

export default config;
