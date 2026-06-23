import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#faf6f1',
          100: '#f3ebe0',
          200: '#e8d5c4',
          300: '#d4b896',
          400: '#b8956a',
          500: '#a07a4f',
          600: '#8b6f47',
          700: '#6b5637',
          800: '#4a3a2a',
          900: '#2d2419',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'wood': '0 4px 20px rgba(139, 111, 71, 0.15)',
        'wood-lg': '0 10px 40px rgba(139, 111, 71, 0.25)',
        'glow': '0 0 30px rgba(217, 119, 6, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;