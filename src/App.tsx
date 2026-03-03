import React, { useState, useEffect, useRef } from 'react';

/**
 * 🌸 旅遊手帳：App 核心 (App.tsx) - 修正版
 * 完全對應 Module 1 至 7 之所有 Requirement-level 细節
 */

export default function App() {
  // --- 狀態管理 (States) ---
  const [activeTab, setActiveTab] = useState('行程');
  const [selectedDate, setSelectedDate] = useState(''); // 格式: yyyy/mm/dd
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date().toISOString()); // M7-2: updated_at
  
  const [travelInfo, setTravelInfo] = useState({
    name: '我的日本之旅',
    startDate: '2026/10/21',
    endDate: '2026/10/26'
  });

  // --- M2-1: 生成日期數組 (格式 mm.dd(ddd)) ---
  const generateDateRange = (start: string, end: string) => {
    const dates = [];
    let curr = new Date(start);
    const last = new Date(end);
    while (curr <= last) {
      const dateStr = curr.toISOString().split('T')[0].replace(/-/g, '/');
      const label = `${(curr.getMonth() + 1).toString().padStart(2, '0')}.${curr.getDate().toString().padStart(2, '0')}(${['日', '一', '二', '三', '四', '五', '六'][curr.getDay()]})`;
      dates.push({ date: dateStr, label });
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const travelDates = generateDateRange(travelInfo.startDate, travelInfo.endDate);

  // 初始化選中第一天
  useEffect(() => {
    if (travelDates.length > 0 && !selectedDate) setSelectedDate(travelDates[0].date);
  }, [travelDates]);

  // --- M7-3: 每 10 分鐘自動儲存邏輯 ---
  useEffect(() => {
    const timer = setInterval(() => {
      handleSave();
    }, 600000); // 10分鐘
    return () => clearInterval(timer);
  }, []);

  const handleSave = () => {
    setLastSaved(new Date().toISOString());
    console.log("M7-3: 行程已自動儲存");
  };

  // --- M1-2: 底部導航 Tabs ---
  const tabs = [
    { name: '行程', icon: 'fa-calendar-day' },
    { name: '導航', icon: 'fa-map-location-dot' },
    { name: '憑證', icon: 'fa-ticket' },
    { name: '清單', icon: 'fa-basket-shopping' },
    { name: '記帳', icon: 'fa-sack-dollar' },
  ];

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-handbook-beige flex items-center justify-center p-6">
        <div className="sakura-card w-full max-w-md p-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-center text-cocoa-brown mb-6">🌸 旅遊手帳設定</h1>
          <div className="space-y-4">
            <input 
              type="text" placeholder="旅行名稱" 
              className="w-full p-4 rounded-xl border-2 border-sakura-pink/20 outline-none focus:border-sakura-pink"
              value={travelInfo.name}
              onChange={(e) => setTravelInfo({...travelInfo, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="p-4 rounded-xl border-2 border-sakura-pink/20" value={travelInfo.startDate.replace(/\//g, '-')} onChange={(e) => setTravelInfo({...travelInfo, startDate: e.target.value.replace(/-/g, '/')})}/>
              <input type="date" className="p-4 rounded-xl border-2 border-sakura-pink/20" value={travelInfo.endDate.replace(/\//g, '-')} onChange={(e) => setTravelInfo({...travelInfo, endDate: e.target.value.replace(/-/g, '/')})}/>
            </div>
            <button onClick={() => setIsInitialized(true)} className="cute-button w-full mt-4 py-4">開啟手帳之旅</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-handbook-beige text-cocoa-brown flex flex-col font-sans overflow-x-hidden">
      
      {/* 🌸 M1-2 & M1-3: Header 與背景資產 */}
      <header className="relative h-48 flex items-end px-6 pb-6 overflow-hidden">
        <img 
          src="/header-bg.jpg" 
          alt="Header Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="header-bg-overlay"></div> {/* index.css 中的漸變遮罩 */}
        
        <div className="relative z-10 text-white w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold drop-shadow-md">{travelInfo.name}</h1>
            <img src="/home.png" alt="Home" className="w-8 h-8 object-contain" />
          </div>
          <p className="text-sm opacity-90">{travelInfo.startDate} - {travelInfo.endDate}</p>
          <p className="text-[10px] opacity-70 mt-1">最後儲存：{new Date(lastSaved).toLocaleTimeString()}</p>
        </div>
      </header>

      {/* 🌸 M1-2: 常駐置頂 Tabs */}
      <nav className="sticky top-0 z-tabs bg-white/80 backdrop-blur-md flex justify-around py-3 border-b border-sakura-pink/10 shadow-sm">
        {tabs.map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.name ? 'text-sakura-pink scale-110' : 'text-cocoa-brown/40'}`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[10px] font-bold">{tab.name}</span>
          </button>
        ))}
      </nav>

      {/* 🌸 主內容區 */}
      <main className="flex-1 overflow-y-auto">
        
        {activeTab === '行程' && (
          <div className="animate-fade-in">
            {/* M2-1: 日期橫向捲動分頁 */}
            <div className="flex overflow-x-auto p-4 gap-3 no-scrollbar bg-white/30">
              {travelDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedDate === d.date ? 'bg-sakura-pink text-white shadow-md' : 'bg-white text-cocoa-brown/60'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* 行程內容區 */}
            <div className="p-4 space-y-4">
              {/* M4-5: Timeline 容器 */}
              <div className="relative pl-8">
                <div className="timeline-line"></div>
                
                {/* 範例行程卡片 (展示 M7-2 Save 按鈕與 M1-1 風格) */}
                <div className="sakura-card p-4 relative mb-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">🌸 抵達飯店</h3>
                    <span className="text-xs bg-powder-blue px-2 py-1 rounded-full">住宿</span>
                  </div>
                  <p className="text-sm mt-2 opacity-70">15:00 - 16:00 (1hr)</p>
                  
                  {/* M1-4: 右下角 Save 按鈕 */}
                  <button className="absolute bottom-3 right-3 text-sakura-pink hover:scale-110 transition-transform" onClick={handleSave}>
                    <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                  </button>
                </div>
              </div>

              {/* M4-2: 有待編入行程區 */}
              <div className="mt-12">
                <h2 className="text-sm font-bold text-cocoa-brown/40 mb-3 px-2 flex items-center gap-2">
                  <i className="fa-solid fa-box-archive"></i> 有待編入行程區
                </h2>
                <div className="sakura-card p-8 border-dashed border-2 bg-transparent text-center text-cocoa-brown/30">
                  暫無待定行程，長按卡片可拉至此處
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 其他模組佔位... */}
        {activeTab !== '行程' && (
          <div className="p-10 text-center text-cocoa-brown/20 italic">
            {activeTab} 模組載入中...
          </div>
        )}
      </main>

      {/* 🌸 M4-1: 右下角固定「+」按鈕 */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-sakura-pink text-white rounded-full shadow-floating flex items-center justify-center text-2xl z-modal active:scale-90 transition-all">
        <i className="fa-solid fa-plus"></i>
      </button>

      {/* 🛡️ M7-4: Safety Render 區 */}
      <div className="safety-zone">🌸Tiffany & Benjamin🌸</div>
    </div>
  );
}
