import React, { useState } from 'react';

/**
 * 🌸 旅遊手帳：行程卡片組件 (ScheduleCard.tsx) - 終極合規版
 * 嚴格執行 Module 1 至 7 之細節規範
 */

interface TransportLeg {
  type: '徒歩' | '地鐵' | '巴士' | 'JR' | '飛機';
  detail: string;
  duration?: number; // 分鐘
}

interface ScheduleCardProps {
  id: string;
  startTime: string; 
  endTime: string;   
  duration: number;   // M2-3: 持續時間 (分鐘)，用於骨牌效應計算
  title: string;
  category: '景點' | '美食' | '交通' | '住宿' | '購物';
  location?: string;
  note?: string;
  costJPY?: number;   // M6-3: 預設為日幣
  transportLegs?: TransportLeg[];
  onUpdate: (id: string, updates: any) => void; // 統一更新入口
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  id, startTime, endTime, duration, title, category, location, note, costJPY, transportLegs, onUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // M2-5: 類別配置
  const categoryConfig = {
    '景點': { icon: 'fa-camera-retro', color: 'bg-sakura-pink' },
    '美食': { icon: 'fa-utensils', color: 'bg-orange-300' },
    '交通': { icon: 'fa-train-subway', color: 'bg-powder-blue' },
    '住宿': { icon: 'fa-hotel', color: 'bg-cocoa-brown-light' },
    '購物': { icon: 'fa-bag-shopping', color: 'bg-pink-300' },
  };

  return (
    <div className="sakura-card relative mb-4 overflow-hidden animate-fade-in transition-all">
      {/* 🌸 卡片頂部 (Collapsed State) */}
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer active:bg-sakura-pink/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* M2-2: 緊湊型時間顯示 */}
        <div className="flex flex-col items-center min-w-[55px] border-r border-cocoa-brown/5 pr-2">
          <span className="text-xs font-bold text-cocoa-brown">{startTime}</span>
          <div className="w-full h-[1px] bg-sakura-pink/20 my-1"></div>
          <span className="text-[10px] text-cocoa-brown/40">{endTime}</span>
        </div>

        {/* 類別圖標 */}
        <div className={`${categoryConfig[category].color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform`}>
          <i className={`fa-solid ${categoryConfig[category].icon}`}></i>
        </div>

        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-cocoa-brown text-sm truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] bg-white px-2 py-0.5 rounded-full border border-cocoa-brown/10">
              {duration} min
            </span>
            {location && (
              <p className="text-[9px] text-cocoa-brown/40 truncate italic">
                <i className="fa-solid fa-location-dot mr-1"></i>{location}
              </p>
            )}
          </div>
        </div>

        <i className={`fa-solid fa-chevron-down text-[10px] text-sakura-pink transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {/* 🌸 手風琴展開區 (Expanded State) */}
      <div className={`accordion-content ${isOpen ? 'max-h-[800px] border-t border-sakura-pink/5' : 'max-h-0'}`}>
        <div className="p-4 space-y-4 bg-handbook-beige/30">
          
          {/* M2-3: 骨牌效應調整器 - 調整此處會推移後續所有行程 */}
          <div className="bg-white/60 p-3 rounded-xl">
            <label className="text-[10px] font-bold text-cocoa-brown/50 block mb-2 uppercase">⏱️ 停留時間調整 (影響後續行程)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="15" max="240" step="15"
                value={duration}
                onChange={(e) => onUpdate(id, { duration: parseInt(e.target.value) })}
                className="flex-1 accent-sakura-pink h-1.5"
              />
              <span className="text-xs font-bold text-sakura-pink w-12">{duration}m</span>
            </div>
          </div>

          {/* M3-1 & M3-2: 交通路徑細節 */}
          {category === '交通' && transportLegs && (
            <div className="space-y-2 pl-2 border-l-2 border-powder-blue/30">
              {transportLegs.map((leg, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="bg-powder-blue text-white px-2 py-0.5 rounded text-[9px] mt-0.5">{leg.type}</span>
                  <div className="flex-1">
                    <p className="font-medium">{leg.detail}</p>
                    {leg.duration && <p className="text-[9px] text-cocoa-brown/40">預計時間: {leg.duration} min</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* M6-3: 記帳連動 (JPY -> HKD 提示) */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-lg p-2 border border-sakura-pink/10">
              <span className="text-[9px] text-cocoa-brown/40 block">預算 (JPY)</span>
              <div className="flex items-center">
                <i className="fa-solid fa-yen-sign text-xs text-sakura-pink mr-2"></i>
                <input 
                  type="number" className="bg-transparent text-sm w-full outline-none" 
                  value={costJPY} onChange={(e) => onUpdate(id, { costJPY: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex-1 bg-sakura-pink/5 rounded-lg p-2 border border-sakura-pink/5 items-center flex justify-center">
              <span className="text-[10px] text-sakura-pink font-bold italic">
                ≈ HKD {( (costJPY || 0) * 0.052 ).toFixed(1)} {/* 範例匯率 */}
              </span>
            </div>
          </div>

          {/* 備註區 */}
          <textarea 
            className="w-full bg-white/80 rounded-xl p-3 text-xs border border-sakura-pink/10 focus:border-sakura-pink outline-none min-h-[60px]"
            placeholder="點擊輸入備註或必買物品..."
            value={note}
            onChange={(e) => onUpdate(id, { note: e.target.value })}
          />

          {/* M1-4 & M7-2: 動作按鈕 */}
          <div className="flex justify-between items-center pt-2">
            <button className="text-[10px] text-cocoa-brown/40 flex items-center gap-1 active:scale-95 transition-transform">
              <i className="fa-solid fa-trash-can"></i> 刪除
            </button>
            <div className="flex gap-2">
              <button className="bg-powder-blue/20 text-powder-blue p-2 rounded-full w-8 h-8 flex items-center justify-center active:scale-95">
                <i className="fa-solid fa-map-pin"></i>
              </button>
              <button 
                onClick={() => onUpdate(id, { lastSaved: new Date().toISOString() })}
                className="cute-button py-2 px-4 text-[11px] shadow-sm active:scale-95"
              >
                <i className="fa-solid fa-cloud-arrow-up mr-1"></i> 儲存修改
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🛡️ M7-4: Safety Zone */}
      <div className="safety-zone opacity-0 pointer-events-none absolute bottom-0">🌸Tiffany & Benjamin🌸</div>
    </div>
  );
};
