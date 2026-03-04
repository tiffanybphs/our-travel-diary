import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, MapPin, Train, Wallet, ChevronDown, ChevronUp, 
  Lock, Unlock, AlertCircle, Footprints, Bus, Coffee 
} from 'lucide-react';
import { ScheduleItem, Category } from '../types';
import { jpyToHkd } from '../utils/currency'; // 確保 M6-3 運作

interface ScheduleCardProps {
  item: ScheduleItem;
  onUpdate: (id: string, updates: Partial<ScheduleItem>) => void;
  isSyncing?: boolean;
}

const categoryStyles: Record<Category, { bg: string; border: string; accent: string }> = {
  '景點': { bg: 'bg-rose-50', border: 'border-rose-200', accent: 'bg-rose-500' },
  '美食': { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-500' },
  '購物': { bg: 'bg-sky-50', border: 'border-sky-200', accent: 'bg-sky-500' },
  '交通': { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500' },
  '其他': { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-500' },
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, onUpdate, isSyncing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isUnscheduled = !item.startTime; // M4-2 判斷
  const style = categoryStyles[item.category];

  // M2-4: 睡眠區檢查 (00:00 - 07:00)
  const isSleepZoneConflict = item.startTime && (item.startTime.startsWith('00') || item.startTime.startsWith('01'));

  return (
    <motion.div
      layout
      className={`relative mb-3 overflow-hidden rounded-2xl border-2 ${style.bg} ${style.border} shadow-sm`}
    >
      {/* M1-1: 頂部分類色條 */}
      <div className={`h-1.5 w-full ${style.accent}`} />

      <div className="p-4">
        {/* 頂部資訊列 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {!isUnscheduled ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white/60 px-2 py-1 rounded-lg">
                <Clock size={14} />
                <span>{item.startTime} - {item.endTime}</span>
                {isSleepZoneConflict && <AlertCircle size={14} className="text-amber-500 animate-pulse" />}
              </div>
            ) : (
              <span className="text-xs font-bold text-rose-400 bg-rose-100 px-2 py-1 rounded-lg">🌸 待編入行程</span>
            )}
          </div>

          {!isUnscheduled && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { isFixedTime: !item.isFixedTime }); }}
              className={`p-1.5 rounded-full ${item.isFixedTime ? 'bg-rose-500 text-white' : 'text-gray-400 bg-gray-100'}`}
            >
              {item.isFixedTime ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          )}
        </div>

        {/* 標題區域 */}
        <div className="flex justify-between items-start" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {item.title}
              {isSyncing && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </h3>
            {item.location && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 italic">
                <MapPin size={12} /> {item.location}
              </div>
            )}
          </div>
          <div className="text-gray-400">{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
        </div>

        {/* 展開詳情 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-dashed border-gray-300 space-y-4"
            >
              {/* M2-3: 時長滑桿 */}
              {!isUnscheduled && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>停留時長</span>
                    <span>{item.duration} 分鐘</span>
                  </div>
                  <input 
                    type="range" min="15" max="300" step="15"
                    value={item.duration}
                    onChange={(e) => onUpdate(item.id, { duration: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-rose-500"
                  />
                </div>
              )}

              {/* M3: 交通詳細細節 */}
              {item.transportLegs && item.transportLegs.length > 0 && (
                <div className="space-y-2 bg-white/50 p-3 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Train size={12} /> 交通轉乘 (Benjamin 專用)
                  </p>
                  {item.transportLegs.map((leg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      {leg.type === '步行' ? <Footprints size={14}/> : <Bus size={14}/>}
                      <span className="font-medium">{leg.type}</span>
                      <span className="text-gray-400">→</span>
                      <span>{leg.detail}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* M6-3: 雙幣預算顯示 */}
              {item.costJPY !== undefined && (
                <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Wallet size={14} /> 預估花費
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">¥ {item.costJPY.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-medium">約 HKD ${jpyToHkd(item.costJPY)}</div>
                  </div>
                </div>
              )}

              {/* 備註 (手寫感文字) */}
              {item.note && (
                <div className="text-sm text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100 italic">
                  " {item.note} "
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
