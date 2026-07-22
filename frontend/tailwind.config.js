/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#16a34a',
          'green-dark': '#15803d',
          'green-light': '#22c55e',
        },
        // Dynamic primary color using CSS variables
        primary: {
          DEFAULT: 'var(--primary-color, #16a34a)',
          hover: 'var(--primary-hover, #15803d)',
          light: 'var(--primary-light, #22c55e)',
          dark: 'var(--primary-dark, #15803d)',
          '50': 'var(--primary-50, #f0fdf4)',
          '100': 'var(--primary-100, #dcfce7)',
          '200': 'var(--primary-200, #bbf7d0)',
          '300': 'var(--primary-300, #86efac)',
          '400': 'var(--primary-400, #4ade80)',
          '500': 'var(--primary-500, #22c55e)',
          '600': 'var(--primary-600, #16a34a)',
          '700': 'var(--primary-700, #15803d)',
          '800': 'var(--primary-800, #166534)',
          '900': 'var(--primary-900, #14532d)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 12px 40px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}