/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sakura: { light: '#FFF0F5', DEFAULT: '#FFC0CB', dark: '#FFB6C1' },
        beige: '#F5F5DC', cocoa: '#D2B48C', sky: '#ADD8E6',
      },
      fontFamily: { maru: ['"Zen Maru Gothic"', 'sans-serif'] },
    },
  },
  plugins: [],
}
