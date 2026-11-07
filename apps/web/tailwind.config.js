import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).replace(/\\/g, '/');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    `${__dirname}/index.html`,
    `${__dirname}/src/**/*.{js,ts,jsx,tsx}`,
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0B1120',
        secondary: '#111827',
        accent: {
          blue: '#2563EB',
          cyan: '#38BDF8',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          800: '#1E293B',
          900: '#0F172A',
          950: '#080D1A',
        },
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

