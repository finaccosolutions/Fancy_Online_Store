/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e1eaf5',
          200: '#c3d5eb',
          300: '#a5c1e1',
          400: '#7d9dd0',
          500: '#1e40af',
          600: '#1e3a8a',
          700: '#1e3a8a',
          800: '#172554',
          900: '#0f1b3c',
        },
        brand: {
          blue: '#0a1e52',
          'blue-dark': '#051028',
          'blue-light': '#1e40af',
          yellow: '#fbbf24',
          'yellow-dark': '#f59e0b',
          'yellow-light': '#fcd34d',
        },
        admin: {
          primary: '#1e40af',
          'primary-dark': '#172554',
          secondary: '#fbbf24',
          background: '#f8fafc',
          sidebar: '#ffffff',
          card: '#ffffff',
          border: '#e2e8f0',
          text: '#1e293b',
          'text-dark': '#334155',
          'text-light': '#64748b',
          danger: '#dc2626',
          success: '#16a34a',
          warning: '#ea580c',
        },
      },
    },
  },
  plugins: [],
};
