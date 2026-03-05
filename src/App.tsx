import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from './components/Layout/MainLayout';
import { DailyTimeline } from './views/DailyTimeline';
import { ExpenseTracker } from './modules/Expenses/ExpenseTracker';
import { TransportGuide } from './modules/Navigation/TransportGuide';
import { BookingManager } from './modules/Bookings/BookingManager';
import { ShoppingList } from './modules/Shopping/ShoppingList';
import { Toast } from './components/ui/Toast';
import { supabase } from './supabaseClient'; // M7: 實時同步核心

const TRIP_ID = 'tokyo-cherry-blossom-2026';
const TRAVEL_MATES = ['Tiffany', 'Benjamin', 'Alice', 'Bob', 'Charlie'];

export default function App() {
  // --- 1. 核心狀態與身份 (M1, M7) ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [currentUser, setCurrentUser] = useState('Tiffany');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date().toISOString());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- 2. M7: 實時訂閱邏輯 (Real-time Sync) ---
  useEffect(() => {
    // 訂閱 Supabase 頻道，當任何旅伴修改資料時觸發更新
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => setLastSync(new Date().toISOString()))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, () => setLastSync(new Date().toISOString()))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- 3. M5: 離線與同步 UI 提醒 ---
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // --- 4. M2: 初始化設定 (Tiffany & 旅伴專用) ---
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FFF8F8] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl border border-rose-100/50">
          <div className="text-4xl mb-6">🌸</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Tokyo 2026</h2>
          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.2em] mb-8 text-center">Travelers Collaboration Hub</p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-2 uppercase">請選擇你的身份</label>
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_MATES.map(mate => (
                  <button 
                    key={mate}
                    onClick={() => setCurrentUser(mate)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border ${currentUser === mate ? 'bg-rose-400 text-white border-rose-400 shadow-lg' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-rose-50'}`}
                  >
                    {mate}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setIsInitialized(true)} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl">
              開啟手帳
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- 5. 模組分發 (M2-M7) ---
  const renderModule = () => {
    const props = { tripId: TRIP_ID, currentUser, isOnline };
    switch (activeTab) {
      case 'schedule':  return <DailyTimeline {...props} />;
      case 'transport': return <TransportGuide {...props} />;
      case 'bookings':  return <BookingManager {...props} />;
      case 'expenses':  return <ExpenseTracker {...props} />;
      case 'shopping':  return <ShoppingList {...props} />;
      default:          return <DailyTimeline {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBFB] flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      
      {/* 🌸 M1: 頂部視覺與 Header */}
      <header className="relative h-56 flex flex-col justify-end px-6 pb-6 shadow-lg overflow-hidden">
        <img src="/header-bg.jpg" alt="Tokyo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex justify-between items-start">
            <div className="bg-rose-400/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
              <img src="/home.png" className="w-3 h-3 invert" alt="home" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">2026 Cherry Blossom</span>
            </div>
            {!isOnline && <div className="p-2 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"><WifiOff size={14} className="text-white"/></div>}
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-white italic tracking-tight">Konnichiwa, {currentUser}</h1>
              <p className="text-[10px] text-white/60 font-medium">同步時間: {new Date(lastSync).toLocaleTimeString()}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Tiffany 57cm</span>
              <span className="text-[8px] text-white/40 font-bold uppercase">Optimized for M1-M7</span>
            </div>
          </div>
        </div>
      </header>

      {/* 🌸 M1-3: 主體導航整合 */}
      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </main>
      </MainLayout>

      {/* 全局 UI 組件 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* M7-4: 安全底線與 PWA 標識 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-200 via-rose-400 to-rose-200 opacity-20 pointer-events-none" />
    </div>
  );
}

// 輔助圖示組件
function WifiOff({ size, className }: { size: number, className: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>;
}
