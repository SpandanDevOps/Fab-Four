/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        'primary-dark': '#D97706',
        'primary-light': '#FBBF24',
        'background-light': '#FFFBF5',
        'background-dark': '#0f172a',
      },
      animation: {
        bounce: 'bounce 1s infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
