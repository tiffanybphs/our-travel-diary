import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Plus, WifiOff, Globe, 
  Map as MapIcon, Layers, Sparkles 
} from 'lucide-react';
import { ScheduleCard } from '../components/ScheduleCard';
import { BudgetBar } from '../components/BudgetBar';
import { useSupabaseData } from '../hooks/useSupabase';
import { useOptimisticSchedule } from '../hooks/useOptimistic';
import { exportToExcel } from '../utils/excelExport';
import { formatHandbookDate } from '../utils/dateUtils';
import { supabase } from '../supabaseClient';

export const DailyTimeline: React.FC<{ tripId: string; userId: string }> = ({ tripId, userId }) => {
  const [activeDay, setActiveDay] = useState<string>('2026-03-20');
  
  // M7-2: 實時協作與離線狀態監控
  const { serverItems, loading, isConnected } = useSupabaseData(tripId);
  const { data, updateSchedule, isSyncing, syncError } = useOptimisticSchedule(serverItems, supabase, userId);

  // M5: 提取所有天數
  const days = useMemo(() => Array.from(new Set(data.filter(i => i.dayDate).map(i => i.dayDate!))).sort(), [data]);
  
  // M4-2: 數據切片
  const currentDayItems = data.filter(item => item.dayDate === activeDay && item.startTime);
  const unscheduledItems = data.filter(item => !item.startTime);

  // M6: 精準港幣換算 (假設 1 JPY = 0.052 HKD)
  const totalSpentHKD = useMemo(() => 
    data.reduce((sum, item) => sum + (item.costJPY ? item.costJPY * 0.052 : 0), 0)
  , [data]);

  return (
    <div className="min-h-screen bg-[#FFFBFB] selection:bg-rose-100">
      {/* 🌸 頂部導航列：M1-4 與 M1-5 狀態感知 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-50 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isConnected ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {isConnected ? <Globe size={20} /> : <WifiOff size={20} className="animate-pulse" />}
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-800 tracking-tight">櫻花手帳 2026</h1>
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                {isSyncing ? '同步中...' : isConnected ? '已連線 (5人協作中)' : '離線模式'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => exportToExcel(data, days, "東京三月櫻")}
            className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200 active:scale-95 transition-all"
          >
            <Download size={20} />
          </button>
        </div>

        {/* M5: 日期選項卡 */}
        <div className="flex gap-2 overflow-x-auto mt-4 no-scrollbar max-w-md mx-auto">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all flex-shrink-0 ${
                activeDay === day 
                  ? 'bg-rose-400 text-white shadow-md' 
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {formatHandbookDate(day)}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* M6: 預算進度 */}
        <BudgetBar spentHKD={totalSpentHKD} totalBudgetHKD={15000} />

        {/* M2/M3: 今日行程流水線 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-black text-gray-700">
              <Sparkles size={18} className="text-rose-300" /> 行程流水線
            </h3>
            <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-1 rounded uppercase tracking-widest">
              {currentDayItems.length} 個行程
            </span>
          </div>
          
          <div className="space-y-3 relative">
            <AnimatePresence mode="popLayout">
              {currentDayItems.map((item) => (
                <ScheduleCard key={item.id} item={item} onUpdate={updateSchedule} isSyncing={isSyncing} />
              ))}
            </AnimatePresence>
            {currentDayItems.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-rose-100 rounded-[2rem]">
                <MapIcon className="mx-auto text-rose-100 mb-2" size={40} />
                <p className="text-sm text-gray-300 font-medium">今天還沒安排行程唷，去逛逛街？</p>
              </div>
            )}
          </div>
        </section>

        {/* M4-2: 待定區 (如同實體筆記本的便利貼) */}
        {unscheduledItems.length > 0 && (
          <section className="bg-rose-50/50 p-5 rounded-[2.5rem] border border-rose-100/50">
            <h3 className="flex items-center gap-2 font-black text-rose-400 text-sm mb-4 uppercase tracking-widest">
              <Layers size={16} /> 有待編入行程區
            </h3>
            <div className="space-y-3">
              {unscheduledItems.map((item) => (
                <ScheduleCard key={item.id} item={item} onUpdate={updateSchedule} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 🌸 錯誤提示 Toast (M1-4) */}
      <AnimatePresence>
        {syncError && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60]"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{syncError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部導航 */}
      <nav className="fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-rose-50 flex items-center justify-around px-6 z-50">
        <button className="text-rose-400 flex flex-col items-center gap-1">
          <Plus size={24} />
          <span className="text-[9px] font-black uppercase">Add Item</span>
        </button>
        <div className="w-[1px] h-8 bg-gray-100" />
        <p className="text-[10px] text-gray-400 font-bold max-w-[120px] text-center leading-tight">
          Tiffany 正在看：<br/><span className="text-rose-300">淺草雷門</span>
        </p>
      </nav>
    </div>
  );
};
