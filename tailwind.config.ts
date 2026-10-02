import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EEF6FF',
          100: '#D9EBFF',
          200: '#B9DAFE',
          300: '#85BEFD',
          400: '#3892FE',
          500: '#1D77FF',
          600: '#1561D9',
          700: '#0F48A6',
          800: '#113E85',
          900: '#13366F',
        },
        surface: {
          canvas: '#F1F6FD',
          card: '#FFFFFF',
        }
      },
      boxShadow: {
        'soft-glow': '0 10px 35px rgba(29, 119, 255, 0.06)',
        'blue-glow': '0 8px 25px rgba(29, 119, 255, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
