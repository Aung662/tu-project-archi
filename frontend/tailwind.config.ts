import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8dc0ff',
          400: '#579cff', 500: '#2f78f5', 600: '#1a5be0', 700: '#1748b6',
          800: '#193f90', 900: '#1a3872', 950: '#142446',
        },
      },
    },
  },
  plugins: [],
};
export default config;
