import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.png', 'splash.jpeg', 'src/assets/header-bg.jpg', 'src/assets/home.png'],
      manifest: {
        name: 'Tokyo 2026 櫻花導航',
        short_name: 'Tokyo2026',
        description: '5人東京實時協作手帳',
        theme_color: '#FFF8F8',
        background_color: '#FFF8F8',
        display: 'standalone', // 零安裝指令核心：呈現原生 App 體驗
        orientation: 'portrait',
        icons: [
          { src: 'icon.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache' }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': '/src' }
  }
});
