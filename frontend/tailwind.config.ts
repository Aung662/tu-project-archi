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
          50: '#eef3ff', 100: '#dfe8ff', 200: '#c1d2ff', 300: '#a1b9ff',
          400: '#7897f7', 500: '#446ad8', 600: '#4266d2', 700: '#4063cc',
          800: '#2f4a96', 900: '#253b72', 950: '#1a2d55',
        },
        plum: {
          400: '#c084fc', 500: '#a56bff', 600: '#9333ea', 700: '#7e22ce',
        },
        mint: {
          300: '#8ef4de', 400: '#5eead4', 500: '#33e6c4', 600: '#14b8a6',
        },
        ink: {
          900: '#081120', 800: '#0d182a', 700: '#111e31', 600: '#1b2a40',
        },
      },
      boxShadow: {
        glow: '0 0 36px -12px rgba(63,95,199,0.36)',
        'glow-plum': '0 0 36px -12px rgba(15,118,110,0.3)',
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
