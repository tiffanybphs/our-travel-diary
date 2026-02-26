/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sakura-pink': '#FFD1DC',    // 粉紅
        'sakura-beige': '#FFF5E1',   // 米黃
        'sakura-brown': '#A98467',   // 淡可可棕
        'sakura-blue': '#CDE4F7',    // 淡粉藍
        'sakura-dark': '#5C4033',    // 深棕色（用於主文字，確保易讀）
      },
      fontFamily: {
        'zen': ['"Zen Maru Gothic"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
