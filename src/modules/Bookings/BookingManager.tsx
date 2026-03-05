import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, Building, Utensils, Copy, CheckCircle2, 
  WifiOff, Navigation, ExternalLink, User 
} from 'lucide-react';
import { useSupabaseData } from '../../hooks/useSupabase';
import { jpyToHkd } from '../../utils/currency';

/**
 * 🌸 預訂憑證管理 (全面合規版：M1-M7)
 * 整合：航班、住宿、餐廳、導航、雙幣換算、協作
 */

const CATEGORY_STYLES = {
  flight: { icon: Plane, color: 'text-sky-500', bg: 'bg-sky-50', label: '航班' },
  hotel: { icon: Building, color: 'text-indigo-500', bg: 'bg-indigo-50', label: '住宿' },
  restaurant: { icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-50', label: '美食預約' }
};

export const BookingManager: React.FC<{ tripId: string }> = ({ tripId }) => {
  const { serverItems: bookings, isConnected } = useSupabaseData(tripId, 'bookings');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // M3: 生成 Google Maps 連結
  const openInMaps = (location: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* 🌸 離線感知 (M5) */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="bg-amber-100 text-amber-600 text-[10px] font-bold rounded-xl py-2 px-4 flex items-center justify-center gap-2 overflow-hidden"
          >
            <WifiOff size={12} /> 離線讀取中：憑證已保存於本地快取
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {bookings.map((booking) => {
          const style = CATEGORY_STYLES[booking.category as keyof typeof CATEGORY_STYLES] || CATEGORY_STYLES.hotel;
          const Icon = style.icon;

          return (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-5 shadow-sm border border-rose-50 overflow-hidden relative"
            >
              {/* 類別標籤 */}
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.color}`}>
                  <Icon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{style.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold">{booking.date}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{booking.time}</p>
                </div>
              </div>

              <h4 className="text-base font-black text-gray-800 mb-1">{booking.title}</h4>
              
              {/* M7: 預訂人資訊 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <User size={10} /> 預訂人：{booking.booked_by || 'Benjamin'}
                </span>
              </div>

              {/* M2/M6: 代碼與金額區 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">預約代碼</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black tracking-widest">{booking.reference}</span>
                    <button onClick={() => handleCopy(booking.reference, booking.id)} className="text-gray-400">
                      {copiedId === booking.id ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="bg-rose-50/30 p-3 rounded-2xl border border-rose-100/50">
                  <p className="text-[9px] text-rose-400 font-bold uppercase mb-1">預估消費/訂金</p>
                  <p className="text-sm font-black text-gray-800">¥ {booking.priceJPY?.toLocaleString() || '0'}</p>
                  <p className="text-[9px] font-bold text-rose-300">≈ HKD ${jpyToHkd(booking.priceJPY || 0)}</p>
                </div>
              </div>

              {/* M3: 地點與導航按鈕 */}
              {booking.location && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => openInMaps(booking.location)}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <Navigation size={14} /> 導航至此
                  </button>
                  {booking.url && (
                    <button 
                      onClick={() => window.open(booking.url, '_blank')}
                      className="w-12 bg-gray-100 text-gray-400 py-3 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* M1: 個性化提醒 (57cm 腰圍語境) */}
              {booking.category === 'restaurant' && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                  <div className="p-1.5 bg-white rounded-lg text-amber-500">
                    <Utensils size={12} />
                  </div>
                  <p className="text-[9px] text-amber-700 font-medium leading-relaxed">
                    這家餐廳評價極高！Tiffany 記得細嚼慢嚥，享受美食的同時也能輕鬆維持 <span className="font-bold underline">57cm</span> 的優雅。
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
