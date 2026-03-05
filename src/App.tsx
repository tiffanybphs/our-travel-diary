import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/Layout/MainLayout';
import { DailyTimeline } from './views/DailyTimeline';
import { ExpenseTracker } from './modules/Expenses/ExpenseTracker';
import { TransportGuide } from './modules/Navigation/TransportGuide';
import { BookingManager } from './modules/Bookings/BookingManager';
import { ShoppingList } from './modules/Shopping/ShoppingList';
import { Toast } from './components/ui/Toast';
import { exportToExcel } from './utils/excelExport'; // M7-1

const TRIP_ID = 'tokyo-cherry-blossom-2026';
const TRAVEL_MATES = ['Tiffany', 'Benjamin', 'Alice', 'Bob', 'Charlie'];

export default function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [currentUser, setCurrentUser] = useState('Tiffany');
  const [isInitialized, setIsInitialized] = useState(false);
  const [mapProvider, setMapProvider] = useState<'Google' | '高德'>('Google'); // M5-1
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date().toISOString());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  // M7-1: 匯出 Excel 功能 (無需安裝軟體，瀏覽器直接下載)
  const handleExport = async () => {
    try {
      await exportToExcel(TRIP_ID);
      setToast({ message: 'Excel 匯出成功！', type: 'success' });
    } catch (e) {
      setToast({ message: '匯出失敗，請檢查網絡', type: 'error' });
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center border border-rose-100">
          <h1 className="text-2xl font-black text-gray-800 mb-6 italic">Tokyo 2026 🌸</h1>
          <div className="space-y-4">
            <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">身分驗證</p>
            <div className="grid grid-cols-2 gap-2">
              {TRAVEL_MATES.map(m => (
                <button key={m} onClick={() => setCurrentUser(m)} className={`py-3 rounded-xl text-xs font-bold border ${currentUser === m ? 'bg-rose-400 text-white border-rose-400 shadow-md' : 'bg-gray-50 text-gray-400 border-transparent'}`}>{m}</button>
              ))}
            </div>
            <button onClick={() => setIsInitialized(true)} className="w-full bg-gray-900 text-white font-black py-4 rounded-xl mt-4 active:scale-95 transition-all">開啟手帳</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffafa] flex flex-col max-w-md mx-auto relative">
      {/* 🌸 M1-2 & M7-1: Header 與 Excel 整合 */}
      <header className="relative h-52 flex items-end px-6 pb-6 overflow-hidden shadow-lg">
        <img src="/header-bg.jpg" alt="Header" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 w-full flex justify-between items-end">
          <div className="text-white">
            <h1 className="text-xl font-black italic drop-shadow-md flex items-center gap-2 uppercase tracking-tighter">
              Tokyo Trip <img src="/home.png" className="w-4 h-4 invert" alt="home" />
            </h1>
            <p className="text-[10px] font-bold opacity-80">Welcome, {currentUser} | 57cm Edition</p>
            <p className="text-[9px] opacity-50 mt-1 font-mono">Sync: {new Date(lastSync).toLocaleTimeString()}</p>
          </div>
          
          <div className="flex gap-2">
            {/* M5-1: 地圖切換按鈕 */}
            <button onClick={() => setMapProvider(prev => prev === 'Google' ? '高德' : 'Google')} className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/20 text-[10px] font-black text-white active:scale-90 transition-all uppercase">
              {mapProvider}
            </button>
            {/* M7-1: Excel 匯出 */}
            <button onClick={handleExport} className="bg-rose-400/90 backdrop-blur-md p-2 rounded-full text-white border border-white/30 shadow-lg active:scale-90 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* 🌸 核心模組展示 */}
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 pt-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
              {activeTab === 'schedule' && <DailyTimeline tripId={TRIP_ID} currentUser={currentUser} />}
              {activeTab === 'transport' && <TransportGuide tripId={TRIP_ID} provider={mapProvider} />}
              {activeTab === 'bookings' && <BookingManager tripId={TRIP_ID} />}
              {activeTab === 'expenses' && <ExpenseTracker tripId={TRIP_ID} />}
              {activeTab === 'shopping' && <ShoppingList tripId={TRIP_ID} currentUser={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </MainLayout>

      {/* M5: 離線狀態顯示 */}
      {!isOnline && (
        <div className="fixed bottom-24 left-6 right-6 bg-gray-900/95 text-white p-4 rounded-2xl flex items-center justify-center gap-3 backdrop-blur-md z-50 text-[10px] font-black tracking-widest border border-white/10">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          OFFLINE MODE · DATA SAVED LOCALLY
        </div>
      )}

      {/* 全局通知 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
