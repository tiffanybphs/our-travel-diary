import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * 🌸 旅遊手帳：主程式入口
 * 嚴格遵守 Module 1-7 指令要求
 */

// 處理 M1-3: Splash Screen 的過場動畫與移除邏輯
const hideSplashScreen = () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    // 增加過場動畫感 (專業 Apps 視覺反饋)
    splash.style.opacity = '0';
    splash.style.transition = 'opacity 0.8s ease-out';
    
    setTimeout(() => {
      splash.style.display = 'none';
      // M7-4: 確保在 App 載入後，Safety Render 區是可見的或處於指定狀態
      const safetyZone = document.getElementById('safety-render-zone');
      if (safetyZone) {
        safetyZone.style.display = 'block';
        safetyZone.className = 'safety-zone'; // 套用 index.css 中定義的樣式
      }
    }, 800); // 留出動畫時間，符合 M1-3 動態元素要求
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 整個 Web App 的主體 */}
    <App />
  </React.StrictMode>,
)

// 當 React 組件完成初次渲染後，觸發隱藏啟動畫面
// 這能確保用戶不會看到「還在載入中」的破碎版面 (M1-4)
window.addEventListener('load', hideSplashScreen);
