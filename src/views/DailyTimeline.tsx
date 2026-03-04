import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleCard } from '../components/ScheduleCard';
import { BudgetBar } from '../components/BudgetBar';
import { Header } from '../components/Common/Header';
import { Toast } from '../components/ui/Toast';
import { useSupabaseData } from '../hooks/useSupabase';
import { useOptimisticSchedule } from '../hooks/useOptimistic';
import { exportToExcel } from '../utils/excelExport';
import { supabase } from '../supabaseClient';
import { Layers, MapPin } from 'lucide-react';

export const DailyTimeline: React.FC<{ tripId: string; userId: string }> = ({ tripId, userId }) => {
  const [activeDay, setActiveDay] = useState<string>('2026-03-20');
  
  // M7-2: 雲端同步與樂觀更新
  const { serverItems, isConnected } = useSupabaseData(tripId);
  const { data, updateSchedule, isSyncing, syncError } = useOptimisticSchedule(serverItems, supabase, userId);

  // M5 & M4-2: 數據分類
  const days = useMemo(() => Array.from(new Set(data.filter(i => i.dayDate).map(i => i.dayDate!))).sort(), [data]);
  const currentDayItems = data.filter(item => item.dayDate === activeDay && item.startTime);
  const unscheduledItems = data.filter(item => !item.startTime);

  // M6: 預算統計 (換算為 HKD)
  const totalSpentHKD = useMemo(() => 
    data.reduce((sum, item) => sum + (item.costJPY ? item.costJPY * 0.052 : 0), 0)
  , [data]);

  const handleExport = () => {
    exportToExcel(data, days, "東京櫻花手帳");
  };

  return (
    <>
      <Toast 
        isVisible={!isConnected || !!syncError} 
        message={syncError || "目前處於離線狀態，變更將於連線後同步"} 
        type={syncError ? 'error' : 'offline'} 
      />

      <Header 
        days={days} 
        activeDay={activeDay} 
        setActiveDay={setActiveDay} 
        isConnected={isConnected}
        onExport={handleExport}
      />

      <div className="px-4 pt-6 space-y-8">
        {/* M6: 櫻花預算條 */}
        <BudgetBar spentHKD={totalSpentHKD} totalBudgetHKD={15000} />

        {/* M2 & M3: 骨牌時間軸與交通細節 */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-black text-gray-700 tracking-widest uppercase">今日行程</h2>
            <span className="text-[10px] bg-rose-50 text-rose-400 px-2 py-1 rounded font-bold">
              {currentDayItems.length} 項活動
            </span>
          </div>

          <div className="space-y-4 relative">
            <AnimatePresence mode="popLayout">
              {currentDayItems.map((item) => (
                <ScheduleCard 
                  key={item.id} 
                  item={item} 
                  onUpdate={updateSchedule} 
                  isSyncing={isSyncing} 
                />
              ))}
            </AnimatePresence>

            {currentDayItems.length === 0 && (
              <div className="py-16 text-center bg-white/50 rounded-[2rem] border border-dashed border-rose-200">
                <MapPin className="mx-auto text-rose-200 mb-2" size={32} />
                <p className="text-sm font-bold text-gray-400">這天還是空白的，該排點行程囉！</p>
              </div>
            )}
          </div>
        </section>

        {/* M4-2: 待定區 (不會參與骨牌連動) */}
        {unscheduledItems.length > 0 && (
          <section className="bg-rose-50/60 p-5 rounded-[2rem] border border-rose-100">
            <h3 className="flex items-center gap-2 font-black text-rose-500 text-xs mb-4 tracking-widest uppercase">
              <Layers size={14} /> 待編入行程清單
            </h3>
            <div className="space-y-3 opacity-90">
              {unscheduledItems.map((item) => (
                <ScheduleCard key={item.id} item={item} onUpdate={updateSchedule} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
