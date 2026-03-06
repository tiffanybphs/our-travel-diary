import React, { useState, useEffect } from 'react';
import { Header } from './components/Common/Header';
import { BudgetBar } from './components/Common/BudgetBar';
import { MainLayout } from './components/Layout/MainLayout';
import { DailyTimeline } from './views/DailyTimeline';
import { ExpenseTracker } from './modules/Expenses/ExpenseTracker';
import { TransportGuide } from './modules/Navigation/TransportGuide';
import { BookingManager } from './modules/Bookings/BookingManager';
import { ShoppingList } from './modules/Shopping/ShoppingList';
import { supabase } from './supabaseClient'; 

const TRIP_ID = 'tokyo-cherry-blossom-2026';

export default function App() {
  // --- 全域狀態 ---
  const [activeTab, setActiveTab] = useState('schedule');
  const [currentUser, setCurrentUser] = useState('Tiffany'); // M7: 5人切換
  const [isOnline, setIsOnline] = useState(navigator.onLine); // M5: 離線狀態
  const [lastSync, setLastSync] = useState(new Date().toISOString());

  // M1: 個人化資訊 (統一由頂層向下傳遞)
  const waistSize = "57cm"; 

  // --- M5: 全域離線監聽器 ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- M7: 全域 Supabase 實時訂閱 (一人更新，全體同步) ---
  useEffect(() => {
    const channel = supabase
      .channel('public:all')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        setLastSync(new Date().toISOString());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F8] max-w-md mx-auto relative overflow-hidden font-sans">
      
      {/* M1 & M7: 包含 Excel 導出、使用者切換與 57cm 提示 */}
      <Header 
        user={currentUser} 
        waist={waistSize} 
        lastSync={lastSync} 
        onUserChange={setCurrentUser} 
      />

      {/* M6: 預算條 (0.052 匯率換算 + 花瓣吹走動畫) */}
      <BudgetBar tripId={TRIP_ID} />

      <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="pb-24 pt-4 px-4 h-full overflow-y-auto no-scrollbar">
          
          {/* M2 & M4: 行程瀑布流 (內建 00:00-07:00 睡眠區塊與待編入區) */}
          {activeTab === 'schedule' && <DailyTimeline tripId={TRIP_ID} />}
          
          {/* M3: 交通導航 (純網頁 API 呼叫，無需安裝地圖 App) */}
          {activeTab === 'transport' && <TransportGuide tripId={TRIP_ID} />}
          
          {/* 預訂憑證管理 */}
          {activeTab === 'bookings' && <BookingManager tripId={TRIP_ID} />}
          
          {/* M6: 實時記帳 (HKD/JPY) */}
          {activeTab === 'expenses' && <ExpenseTracker tripId={TRIP_ID} payer={currentUser} />}
          
          {/* M4 & M7: 購物清單 (傳入腰圍資訊以供衣物代購參考) */}
          {activeTab === 'shopping' && <ShoppingList tripId={TRIP_ID} waist={waistSize} />}
          
        </div>
      </MainLayout>

      {/* M5: 離線 UI 警示底條 */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-2xl text-center text-[10px] font-bold tracking-widest animate-pulse z-50 shadow-2xl border border-white/10">
          ⚠️ OFFLINE MODE · 變更將在恢復連線後同步
        </div>
      )}
    </div>
  );
}
