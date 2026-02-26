import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Map, Ticket, ShoppingBag, Wallet, Plus, Save, Settings } from 'lucide-react';

// --- 配置區：請在此填入你的 Supabase 資料 ---
const SUPABASE_URL = "https://sofrkrzjaoitgwtjqhfj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnJrcnpqYW9pdGd3dGpxaGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzUxMTksImV4cCI6MjA4NTc1MTExOX0.U7U_vqygT8RaT9dO-dXde2t5kNardyKaOGuxDko3Ss8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [activeTab, setActiveTab] = useState('行程');
  const [showConfig, setShowConfig] = useState(false);

  // 🌸 UI 櫻花風格組件
  const SakuraCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-3xl shadow-sm border-2 border-sakura-light p-4 mb-4 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen font-maru bg-beige pb-20">
      {/* 1. Header: 旅遊名稱與背景 */}
      <header className="relative h-48 bg-sakura overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('/header-bg.jpg')] bg-cover bg-center" />
        <div className="relative z-10 p-6 flex flex-col justify-end h-full text-[#5D4037]">
          <h1 className="text-2xl font-bold drop-shadow-sm">🌸 日本賞櫻之旅</h1>
          <p className="text-sm opacity-80">2026/03/25 - 2026/04/02</p>
        </div>
        {/* Debug 區 */}
        <div className="absolute top-2 right-2 text-[10px] bg-white/50 px-2 py-1 rounded-full">
          🌸 Tiffany & Benjamin 🌸
        </div>
      </header>

      {/* 2. 常駐置頂 Tabs */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-sakura-light flex justify-around py-2 shadow-sm">
        {[
          { name: '行程', icon: <Calendar size={20}/> },
          { name: '導航', icon: <Map size={20}/> },
          { name: '憑證', icon: <Ticket size={20}/> },
          { name: '清單', icon: <ShoppingBag size={20}/> },
          { name: '記賬', icon: <Wallet size={20}/> }
        ].map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.name ? 'text-sakura-dark scale-110' : 'text-cocoa/60'}`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.name}</span>
          </button>
        ))}
      </nav>

      {/* 3. 內容渲染區 */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === '行程' && (
          <div className="animate-fade-in">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {['03.25(Wed)', '03.26(Thu)', '03.27(Fri)'].map(date => (
                <button key={date} className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-sakura text-sm">
                  {date}
                </button>
              ))}
            </div>
            <SakuraCard>
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-sky text-white text-[10px] px-2 py-0.5 rounded-full">景點活動</span>
                  <h3 className="font-bold text-lg mt-1">上野公園櫻花祭</h3>
                  <p className="text-xs text-cocoa">09:00 - 11:30 (150 min)</p>
                </div>
                <button className="text-sakura-dark"><Plus size={20}/></button>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="bg-sakura-light text-sakura-dark text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Save size={14}/> Save
                </button>
              </div>
            </SakuraCard>
          </div>
        )}

        {/* 其它 Tab 暫略，待後續細化 */}
        <div className="text-center text-cocoa/40 mt-10">
          {activeTab} 模組開發中...
        </div>
      </main>

      {/* 4. 右下角新增按鈕 */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-sakura-dark text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95">
        <Plus size={32} />
      </button>

      {/* 5. 配置按鈕 (填寫 Supabase Key) */}
      <button 
        onClick={() => setShowConfig(true)}
        className="fixed bottom-6 left-6 w-10 h-10 bg-white/80 rounded-full shadow-sm flex items-center justify-center text-cocoa"
      >
        <Settings size={20} />
      </button>
    </div>
  );
}
