/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sakura: {
          light: '#FFF0F5',
          DEFAULT: '#FFC0CB',
          dark: '#FFB6C1',
        },
        beige: '#F5F5DC',
        cocoa: '#D2B48C',
        sky: '#ADD8E6',
      },
      fontFamily: {
        maru: ['"Zen Maru Gothic"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
