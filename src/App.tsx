import { useState } from 'react';

export default function App() {
  // 狀態管理：目前選中的 Tab (預設為 'schedule')
  const [activeTab, setActiveTab] = useState('schedule');
  
  // 狀態管理：Supabase 設定 (方便你隨時填入)
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // 定義五個 Tabs
  const tabs = [
    { id: 'schedule', icon: 'fa-calendar-alt', label: '行程' },
    { id: 'navigation', icon: 'fa-map-location-dot', label: '導航' },
    { id: 'bookings', icon: 'fa-ticket-alt', label: '憑證' },
    { id: 'list', icon: 'fa-list-check', label: '清單' },
    { id: 'expenses', icon: 'fa-coins', label: '記帳' }
  ];

  return (
    // 最外層容器：模擬手機螢幕尺寸 (Mobile-first)，背景米黃
    <div className="max-w-md mx-auto min-h-screen bg-sakura-beige shadow-2xl relative flex flex-col font-zen text-sakura-dark">
      
      {/* --- Header 區塊 --- */}
      {/* 這裡使用了你設計的 header-bg.jpg，請確保檔案在 public 資料夾中 */}
      <header 
        className="h-40 bg-cover bg-center rounded-b-[2rem] shadow-sm relative flex flex-col justify-end p-5"
        style={{ backgroundImage: "url('/header-bg.jpg')", backgroundColor: "#FFD1DC" }} // 加上備用底色
      >
        {/* 加上一層微透明漸層讓文字更清楚 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-b-[2rem]"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-2xl font-bold tracking-wider drop-shadow-md">日本賞櫻之旅</h1>
          <p className="text-sm font-medium opacity-90 drop-shadow-md mt-1">
            <i className="fa-solid fa-plane-departure mr-2"></i>
            2026/4/1 - 2026/4/6
          </p>
        </div>
      </header>

      {/* --- 常駐置頂 Tabs 導覽列 --- */}
      <nav className="sticky top-0 z-50 bg-sakura-beige/95 backdrop-blur-sm border-b-2 border-sakura-pink/30 px-2 py-3">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-sakura-brown scale-110 font-bold' 
                  : 'text-sakura-brown/50 hover:text-sakura-brown/80'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-1 ${
                activeTab === tab.id ? 'bg-sakura-pink shadow-inner text-white' : ''
              }`}>
                <i className={`fa-solid ${tab.icon} text-lg`}></i>
              </div>
              <span className="text-[10px] tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* --- 內容顯示區塊 --- */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {/* 這裡先用簡單的文字代替，之後我們會逐一開發每個分頁 */}
        {activeTab === 'schedule' && <div className="text-center mt-10 text-sakura-brown font-bold">🌸 行程頁面開發中...</div>}
        {activeTab === 'navigation' && <div className="text-center mt-10 text-sakura-brown font-bold">🗺️ 導航頁面開發中...</div>}
        {activeTab === 'bookings' && <div className="text-center mt-10 text-sakura-brown font-bold">🎫 憑證頁面開發中...</div>}
        {activeTab === 'list' && <div className="text-center mt-10 text-sakura-brown font-bold">🛍️ 清單頁面開發中...</div>}
        {activeTab === 'expenses' && <div className="text-center mt-10 text-sakura-brown font-bold">💰 記帳頁面開發中...</div>}

        {/* --- Supabase 設定與 Debug 區塊 (僅供開發與設定用) --- */}
        <div className="mt-16 bg-white/60 p-4 rounded-2xl border border-sakura-pink/50 shadow-sm text-sm">
          <h3 className="font-bold text-sakura-brown mb-3 border-b border-sakura-pink pb-2">
            <i className="fa-solid fa-gear mr-2"></i>系統設定 (Supabase)
          </h3>
          <input 
            type="text" 
            placeholder="請填入 Supabase URL" 
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            className="w-full mb-2 p-2 rounded-xl bg-sakura-beige/50 border border-sakura-brown/20 focus:outline-none focus:ring-2 focus:ring-sakura-pink"
          />
          <input 
            type="text" 
            placeholder="請填入 Supabase Anon Key" 
            value={supabaseKey}
            onChange={(e) => setSupabaseKey(e.target.value)}
            className="w-full mb-3 p-2 rounded-xl bg-sakura-beige/50 border border-sakura-brown/20 focus:outline-none focus:ring-2 focus:ring-sakura-pink"
          />
          
          {/* Debug / Safety Render 區 */}
          <div className="text-center mt-4 text-xs font-bold text-sakura-brown/70 bg-sakura-pink/20 py-2 rounded-lg">
            Debug / Safety Render<br/>
            🌸Tiffany & Benjamin🌸
          </div>
        </div>
      </main>

    </div>
  );
}
