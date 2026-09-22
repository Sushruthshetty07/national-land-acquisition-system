/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2545',
          dark: '#081c33',
          blue: '#134074',
          accent: '#1d4ed8',
          gold: '#c59b27',
          goldLight: '#fef3c7',
          green: '#1b4931',
          greenLight: '#dcfce7',
          orange: '#d97706',
          cream: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
