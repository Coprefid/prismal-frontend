import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#8195fa',
          500: '#4f6cf5', // primary
          600: '#2f56ee',
          700: '#2447cc',
          800: '#1e3a8a',
          900: '#1e3a8a',
        },
        accent: {
          50: '#eafff7',
          100: '#c6f7e9',
          200: '#92f0d6',
          300: '#5fe6c1',
          400: '#36d7aa',
          500: '#16c091', // accent green
          600: '#0d9f78',
          700: '#0d7f61',
          800: '#0f664e',
          900: '#0e4d3c',
        },
        // Gradient stops inspired by logo (purple → blue → cyan)
        logo: {
          start: '#8A2BE2', // purple
          mid: '#3A5BFF',   // blue
          end: '#86E2EA',   // cyan
        },
      },
      boxShadow: {
        card: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.06)',
      },
      maxWidth: {
        screen: '120rem',
      },
    },
  },
  plugins: [],
};
export default config;
