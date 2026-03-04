import React from 'react';
import { Download, Globe, WifiOff } from 'lucide-react';
import { formatHandbookDate } from '../../utils/dateUtils';

interface HeaderProps {
  days: string[];
  activeDay: string;
  setActiveDay: (day: string) => void;
  isConnected: boolean;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ days, activeDay, setActiveDay, isConnected, onExport }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-rose-100/50 pt-safe">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Globe size={16} className="text-emerald-400" />
          ) : (
            <WifiOff size={16} className="text-rose-400 animate-pulse" />
          )}
          <h1 className="text-lg font-black text-gray-800 tracking-tight">東京櫻花手帳</h1>
        </div>
        <button 
          onClick={onExport}
          className="p-2 bg-gray-900 text-white rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
        >
          <Download size={14} /> <span className="text-[10px] font-bold">匯出</span>
        </button>
      </div>

      {/* M5: 多日切換 Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3 max-w-md mx-auto">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap ${
              activeDay === day 
                ? 'bg-rose-400 text-white shadow-md shadow-rose-200/50' 
                : 'bg-white text-gray-400 border border-rose-50'
            }`}
          >
            {formatHandbookDate(day)}
          </button>
        ))}
      </div>
    </header>
  );
};
