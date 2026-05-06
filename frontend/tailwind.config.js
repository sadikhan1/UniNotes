/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          base:    '#0b1117',
          surface: '#10141a',
          muted:   '#0d1218',
        },
      },
    },
  },
  plugins: [],
}
