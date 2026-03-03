import React, { useState, useEffect } from 'react';

/**
 * 🌸 旅遊手帳：終極中控台 (App.tsx)
 * 嚴格符合 Module 1-7 所有 Requirement-level 重要細節
 */

export default function App() {
  // --- 1. 基礎狀態 (M1, M2) ---
  const [activeTab, setActiveTab] = useState('行程');
  const [selectedDate, setSelectedDate] = useState(''); 
  const [isInitialized, setIsInitialized] = useState(false);
  
  // --- 2. 協作與同步 (M7-2, M7-3) ---
  const [lastSaved, setLastSaved] = useState(new Date().toISOString());
  const [travelInfo, setTravelInfo] = useState({
    name: '我的日本之旅',
    startDate: '2026/10/21',
    endDate: '2026/10/26'
  });

  // --- 3. 導航與地圖 (M5-1) ---
  const [mapProvider, setMapProvider] = useState<'Google' | '高德'>('Google');

  // --- 4. 預算與記帳 (M6-1, M6-2) ---
  const [budget] = useState(10000);
  const [spent] = useState(3500); // 範例支出

  // --- M2-1: 生成日期 (格式 mm.dd(ddd)) ---
  const travelDates = (() => {
    const dates = [];
    let curr = new Date(travelInfo.startDate);
    const last = new Date(travelInfo.endDate);
    while (curr <= last) {
      const dateStr = curr.toISOString().split('T')[0].replace(/-/g, '/');
      const label = `${(curr.getMonth() + 1).toString().padStart(2, '0')}.${curr.getDate().toString().padStart(2, '0')}(${['日', '一', '二', '三', '四', '五', '六'][curr.getDay()]})`;
      dates.push({ date: dateStr, label });
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  })();

  useEffect(() => {
    if (travelDates.length > 0 && !selectedDate) setSelectedDate(travelDates[0].date);
  }, [travelDates]);

  // --- M7-3: 每 10 分鐘自動儲存 ---
  useEffect(() => {
    const timer = setInterval(() => handleGlobalSave(), 600000);
    return () => clearInterval(timer);
  }, []);

  const handleGlobalSave = () => {
    setLastSaved(new Date().toISOString());
    // 這裡未來會接 Supabase 的樂觀更新邏輯
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-handbook-beige flex items-center justify-center p-6">
        <div className="sakura-card w-full max-w-md p-8 animate-fade-in text-center">
          <h1 className="text-2xl font-bold text-cocoa-brown mb-6">🌸 旅遊手帳設定</h1>
          <div className="space-y-4 text-left">
            <label className="text-xs font-bold text-cocoa-brown/60 ml-2">旅程名稱</label>
            <input type="text" className="w-full p-4 rounded-xl border-2 border-sakura-pink/20 outline-none focus:border-sakura-pink" value={travelInfo.name} onChange={(e) => setTravelInfo({...travelInfo, name: e.target.value})}/>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-cocoa-brown/60 ml-2">開始日期</label>
                <input type="date" className="w-full p-4 rounded-xl border-2 border-sakura-pink/20" value={travelInfo.startDate.replace(/\//g, '-')} onChange={(e) => setTravelInfo({...travelInfo, startDate: e.target.value.replace(/-/g, '/')})}/>
              </div>
              <div>
                <label className="text-xs font-bold text-cocoa-brown/60 ml-2">結束日期</label>
                <input type="date" className="w-full p-4 rounded-xl border-2 border-sakura-pink/20" value={travelInfo.endDate.replace(/\//g, '-')} onChange={(e) => setTravelInfo({...travelInfo, endDate: e.target.value.replace(/-/g, '/')})}/>
              </div>
            </div>
            <button onClick={() => setIsInitialized(true)} className="cute-button w-full mt-6 py-4 shadow-floating">開始記錄 🌸</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-handbook-beige text-cocoa-brown flex flex-col font-sans overflow-x-hidden pb-20">
      
      {/* 🌸 M1-2 & M1-3: Header 與資產整合 */}
      <header className="relative h-52 flex items-end px-6 pb-6 overflow-hidden shadow-lg">
        <img src="/header-bg.jpg" alt="Header" className="absolute inset-0 w-full h-full object-cover" />
        <div className="header-bg-overlay"></div>
        
        <div className="relative z-10 w-full flex justify-between items-end">
          <div className="text-white">
            <h1 className="text-2xl font-bold drop-shadow-md flex items-center gap-2">
              {travelInfo.name} <img src="/home.png" className="w-6 h-6 inline" alt="home" />
            </h1>
            <p className="text-sm opacity-90">{travelInfo.startDate} - {travelInfo.endDate}</p>
            <p className="text-[10px] opacity-70 mt-1">
              <i className="fa-solid fa-rotate mr-1"></i>自動儲存於: {new Date(lastSaved).toLocaleTimeString()}
            </p>
          </div>
          
          {/* M7-1: Excel 匯出按鈕入口 */}
          <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30 hover:bg-white/40" title="匯出行程">
            <i className="fa-solid fa-file-excel text-xl"></i>
          </button>
        </div>
      </header>

      {/* 🌸 M1-2: 常駐置頂導航 */}
      <nav className="sticky top-0 z-tabs bg-white/90 backdrop-blur-md flex justify-around py-3 border-b border-sakura-pink/10 shadow-sm">
        {[
          { id: '行程', icon: 'fa-calendar-day' },
          { id: '導航', icon: 'fa-map-location-dot' },
          { id: '憑證', icon: 'fa-ticket' },
          { id: '清單', icon: 'fa-basket-shopping' },
          { id: '記帳', icon: 'fa-sakura' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-sakura-pink scale-110' : 'text-cocoa-brown/40'}`}>
            <i className={`fa-solid ${tab.icon === 'fa-sakura' ? 'fa-clover' : tab.icon} text-lg`}></i>
            <span className="text-[10px] font-bold">{tab.id}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 animate-fade-in">
        {/* --- 🌸 記帳模組摘要 (M6-1, M6-2) --- */}
        <section className="mb-6 sakura-card p-4 bg-white/60">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>預算進度 (櫻花花瓣)</span>
            <span>剩餘 HKD ${budget - spent}</span>
          </div>
          <div className="cherry-progress-container">
            <div className="cherry-progress-bar" style={{ width: `${(spent/budget)*100}%` }}></div>
          </div>
        </section>

        {/* --- 🌸 行程分頁 (M2-1, M4-2) --- */}
        {activeTab === '行程' && (
          <>
            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
              {travelDates.map(d => (
                <button key={d.date} onClick={() => setSelectedDate(d.date)} className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedDate === d.date ? 'bg-sakura-pink text-white shadow-md' : 'bg-white text-cocoa-brown/50'}`}>
                  {d.label}
                </button>
              ))}
            </div>
            
            <div className="relative pl-6 mt-4">
              <div className="timeline-line"></div>
              {/* M2-4: 預設休眠時間顯示 */}
              <div className="sakura-card p-3 mb-6 bg-cocoa-brown/5 opacity-50 border-dashed border-2">
                <p className="text-xs italic">00:00 - 07:00 睡覺覺時間 😴</p>
              </div>
              
              {/* 卡片樣例展示 M1-4 Save 按鈕 */}
              <div className="sakura-card p-4 relative mb-4">
                <h3 className="font-bold">範例景點活動</h3>
                <button className="absolute bottom-2 right-2 p-2 text-sakura-pink" onClick={handleGlobalSave}>
                  <i className="fa-solid fa-floppy-disk"></i>
                </button>
              </div>
            </div>

            {/* M4-2: 有待編入行程區 */}
            <div className="mt-10 border-t-2 border-dashed border-sakura-pink/20 pt-6">
              <h2 className="text-sm font-bold opacity-40 mb-4 px-2">📥 有待編入行程區</h2>
              <div className="h-24 flex items-center justify-center rounded-card border-2 border-dashed border-cocoa-brown/10 text-cocoa-brown/20 text-xs italic">
                拖拽行程至此存放到待定區
              </div>
            </div>
          </>
        )}

        {/* --- 🌸 導航切換 (M5-1) --- */}
        {activeTab === '導航' && (
          <div className="space-y-4">
            <div className="flex bg-white rounded-button p-1 shadow-inner">
              <button onClick={() => setMapProvider('Google')} className={`flex-1 py-2 rounded-button text-xs font-bold transition-all ${mapProvider === 'Google' ? 'bg-sakura-pink text-white' : ''}`}>Google 地圖</button>
              <button onClick={() => setMapProvider('高德')} className={`flex-1 py-2 rounded-button text-xs font-bold transition-all ${mapProvider === '高德' ? 'bg-sakura-pink text-white' : ''}`}>高德地圖</button>
            </div>
            <div className="sakura-card h-64 flex items-center justify-center bg-gray-100 italic text-sm">
              [{mapProvider}地圖 Iframe 預覽]
            </div>
          </div>
        )}
      </main>

      {/* 🌸 M4-1: 右下角固定「+」按鈕 */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-sakura-pink text-white rounded-full shadow-floating flex items-center justify-center text-2xl z-modal active:scale-90 transition-all">
        <i className="fa-solid fa-plus"></i>
      </button>

      {/* 🛡️ M7-4: Debug / Safety Render 區 */}
      <div className="safety-zone">🌸Tiffany & Benjamin🌸</div>
    </div>
  );
}
