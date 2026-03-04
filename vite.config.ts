import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

/**
 * 🌸 旅遊手帳：Vite & PWA 配置文件
 * 嚴格遵守「不安裝軟體」限制，透過瀏覽器實現原生體驗
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // M7-2: 採取「即時更新」策略，確保 5 人協作時，只要有人修改代碼，所有人打開網頁即是最新版
      registerType: 'autoUpdate', 
      
      // M1-5: 透過 Web Manifest 讓網頁「偽裝」成 App
      manifest: {
        name: '東京櫻花手帳 2026',
        short_name: '櫻花手帳',
        description: 'Tiffany & Benjamin 專屬櫻花季協作工具',
        theme_color: '#FFF1F2', // 櫻花粉 (Module 1)
        background_color: '#FFFFFF',
        display: 'standalone', // 關鍵：移除網址列，讓用戶感覺不到這是網頁
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },

      // M5: 離線運作邏輯 (Workbox)
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // 確保 15 分鐘網格導出所需的 xlsx 庫也能被緩存
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        
        // 針對 Supabase API 的緩存處理，確保離線時不白屏
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst', // 優先連網獲取 5 人同步數據，沒網則看舊的
            options: {
              cacheName: 'supabase-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 保存 24 小時
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // M7: 優化建置體積，確保在手機瀏覽器上加載速度極快
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
          utils: ['xlsx', '@supabase/supabase-js']
        }
      }
    }
  }
});
