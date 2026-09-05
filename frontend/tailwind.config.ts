import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mm: ['var(--font-myanmar)', 'var(--font-jakarta)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#8b9dff', 500: '#6d8bff', 600: '#5b6ef0', 700: '#4a54d6',
          800: '#3a42a8', 900: '#2f3680', 950: '#1c2050',
        },
        plum: {
          400: '#c084fc', 500: '#a56bff', 600: '#9333ea', 700: '#7e22ce',
        },
        mint: {
          300: '#8ef4de', 400: '#5eead4', 500: '#33e6c4', 600: '#14b8a6',
        },
        ink: {
          900: '#070b16', 800: '#0b1220', 700: '#141b2e', 600: '#1c2540',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(109,139,255,0.6)',
        'glow-plum': '0 0 40px -10px rgba(165,107,255,0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
export default config;
