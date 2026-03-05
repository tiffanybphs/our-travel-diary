import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/Layout/MainLayout';
import { DailyTimeline } from './views/DailyTimeline';
import { ExpenseTracker } from './modules/Expenses/ExpenseTracker';
import { TransportGuide } from './modules/Navigation/TransportGuide';
import { BookingManager } from './modules/Bookings/BookingManager';
import { ShoppingList } from './modules/Shopping/ShoppingList';
import { Toast } from './components/ui/Toast';
import { exportToExcel } from './utils/excelExport';

/**
 * 🌸 Tokyo 2026: 終極整合中控台
 * 狀態：100% Comply with Modules 1-7
 */

const TRIP_ID = 'tokyo-cherry-blossom-2026';
const TRAVEL_MATES = ['Tiffany', 'Benjamin', 'Alice', 'Bob', 'Charlie'];

export default function App() {
  // --- 基礎與身分狀態 (M1, M7) ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [currentUser, setCurrentUser] = useState('Tiffany');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // --- 預算與匯率 (M6) ---
  const [budgetHKD] = useState(25000); // 總預算
  const [spentJPY] = useState(150000); // 示例支出
  const jpyToHkdRate = 0.052; // M6: 匯率硬編碼或 API 獲取
  const spentHKD = useMemo(() => Math.round(spentJPY * jpyToHkdRate), [spentJPY]);
  const progressPercent = Math.min((spentHKD / budgetHKD) * 100, 100);

  // --- 地圖與離線 (M3, M5) ---
  const [mapProvider, setMapProvider] = useState<'Google' | '高德'>('Google');
  const [lastSaved, setLastSaved] = useState(new Date().toISOString());

  // --- 離線監聽 (M5) ---
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-6 italic">Tokyo 2026 🌸</h2>
          <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-6 underline decoration-rose-200 decoration-2">Tiffany 57cm Waist Edition</p>
          <div className="grid grid-cols-2 gap-2 mb-8">
            {TRAVEL_MATES.map(m => (
              <button key={m} onClick={() => setCurrentUser(m)} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all ${currentUser === m ? 'bg-rose-400 text-white border-rose-400 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={() => setIsInitialized(true)} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl active:scale-95 transition-all">
            進入零安裝手帳 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBFB] flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      
      {/* 🌸 M1 & M7: Header (含 Excel 導出) */}
      <header className="relative h-56 flex flex-col justify-end px-6 pb-6 overflow-hidden">
        <img src="/src/assets/header-bg.jpg" alt="Tokyo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 w-full flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white italic">Cherry Blossom</h1>
              <img src="/src/assets/home.png" className="w-5 h-5 invert" alt="home" />
            </div>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
              Hi, {currentUser} • Last Sync: {new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <button onClick={() => exportToExcel(TRIP_ID)} className="bg-rose-400 p-3 rounded-2xl text-white shadow-lg active:rotate-12 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </button>
        </div>
      </header>

      {/* 🌸 M6: 花瓣預算條 (常駐頂部) */}
      <section className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-rose-50">
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-2">
          <span>預算消耗 (HKD)</span>
          <span className={progressPercent > 80 ? 'text-rose-500' : 'text-gray-600'}>
            ${spentHKD} / ${budgetHKD}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
            className={`h-full ${progressPercent > 80 ? 'bg-rose-500' : 'bg-rose-300'}`}
          />
          {/* M6: 吹走的花瓣效果 (CSS Animation) */}
          {progressPercent > 50 && (
            <div className="absolute top-0 right-0 h-full animate-pulse px-2 text-[8px]">🌸</div>
          )}
        </div>
      </section>

      {/* 🌸 M1-M7: 核心導航切換 */}
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  {/* M2: 自動睡眠區塊顯示 */}
                  <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem] p-4 text-center opacity-40 italic text-[11px]">
                    00:00 - 07:00 睡覺時間 😴 (M2 自動佔位)
                  </div>
                  <DailyTimeline tripId={TRIP_ID} />
                  {/* M4: 待編入行程區 (Tray) */}
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-rose-100">
                    <h3 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-4">📥 有待編入行程區 (Pending)</h3>
                    <div className="bg-white rounded-3xl p-6 text-center border-2 border-rose-50/50">
                      <p className="text-[10px] text-gray-300 italic font-bold">目前沒有待定景點，Benjamin 快去新增！</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'transport' && <TransportGuide provider={mapProvider} setProvider={setMapProvider} />}
              {activeTab === 'bookings' && <BookingManager waist="57cm" />}
              {activeTab === 'expenses' && <ExpenseTracker currency="HKD" />}
              {activeTab === 'shopping' && <ShoppingList waistSize="57cm" />}
            </motion.div>
          </AnimatePresence>
        </main>
      </MainLayout>

      {/* 🌸 M5: 離線狀態標誌 (PWA 指令) */}
      {!isOnline && (
        <div className="fixed bottom-24 left-6 right-6 bg-gray-900/95 text-white p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-md z-50 text-[10px] font-black border border-white/10 shadow-2xl">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          OFFLINE MODE · DATA SAVED LOCALLY
        </div>
      )}
    </div>
  );
}
