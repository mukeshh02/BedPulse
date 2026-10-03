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
          50: '#F1F5EF', 100: '#E5EDE2', 200: '#CEDDCB',
          300: '#ABC2A9', 400: '#789986', 500: '#355C45',
          600: '#285744', 700: '#183E33', 800: '#16372D',
          900: '#122D25', 950: '#0A1E18',
        },
        surface: {
          canvas: '#F8FAF9',
          card: '#FFFFFF',
        }
      },
      boxShadow: {
        'soft-glow': '0 10px 35px rgba(24, 62, 51, 0.06)',
        'blue-glow': '0 8px 25px rgba(24, 62, 51, 0.25)',
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
