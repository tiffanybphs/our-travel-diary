import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // M1-5: 實現原生 App 感的 PWA 配置
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.png', 'splash.jpeg'],
      manifest: {
        name: '櫻花旅遊手帳',
        short_name: '旅遊手帳',
        description: 'Tiffany & Benjamin 專屬旅遊協作工具',
        theme_color: '#FFB7C5',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true, // M1-2: 允許手機透過區域網路訪問，進行實機觸控測試
    port: 3000,
    strictPort: true
  }
});
