/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌸 指令要求：粉紅 + 米黃 + 淡可可棕 + 淡粉藍
        'sakura-pink': {
          DEFAULT: '#FFB7C5',
          light: '#FFF0F3',
          dark: '#FF9EAF',
        },
        'handbook-beige': {
          DEFAULT: '#FFF8E7', // 指令：米黃
        },
        'cocoa-brown': {
          DEFAULT: '#8B736D', // 指令：淡可可棕
          light: '#C5B5B1',
        },
        'powder-blue': {
          DEFAULT: '#BBDDF0', // 指令：淡粉藍
        }
      },
      fontFamily: {
        // 📝 指令要求：Zen Maru Gothic
        sans: ['"Zen Maru Gothic"', 'sans-serif'],
      },
      borderRadius: {
        // 🃏 指令要求：日式圓角卡片 (加大圓角以符合可愛風)
        'card': '1.25rem',   // 20px
        'button': '999px',   // 藥丸型可愛按鈕
      },
      boxShadow: {
        'soft': '0 4px 15px -3px rgba(139, 115, 109, 0.1)',
        'floating': '0 10px 25px -5px rgba(255, 183, 197, 0.5)', // 櫻花粉懸浮影
      },
      // ✨ 新增：為了符合 M1-3/M1-4 的動態元素與過場動畫要求
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'floating-icon': 'float 3s ease-in-out infinite',
      },
      // 📱 確保手機優先 (Mobile-first) 的 z-index 階層
      zIndex: {
        'header': '50',
        'tabs': '40',
        'modal': '100',
      }
    },
  },
  plugins: [],
}
