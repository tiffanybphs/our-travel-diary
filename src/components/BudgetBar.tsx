import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower, AlertCircle, TrendingUp } from 'lucide-react';
import { getBudgetStatus, formatCurrency } from '../utils/currency';

interface BudgetBarProps {
  spentHKD: number;
  totalBudgetHKD: number;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({ spentHKD, totalBudgetHKD }) => {
  const { progress, isOverBudget, remaining } = getBudgetStatus(spentHKD, totalBudgetHKD);
  const petals = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-xl border-b-4 border-rose-100 mb-8 relative overflow-hidden">
      {/* 背景裝飾：浮水印感 */}
      <Flower className="absolute -right-4 -bottom-4 text-rose-50/50" size={100} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Budget Tracker</span>
            <h2 className="text-2xl font-black text-gray-800 mt-1">
              {formatCurrency(spentHKD, 'HKD')}
              <span className="text-sm text-gray-400 font-medium ml-2">/ {totalBudgetHKD}</span>
            </h2>
          </div>
          <div className={`text-right px-3 py-1 rounded-xl ${isOverBudget ? 'bg-rose-100' : 'bg-emerald-50'}`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Remaining</p>
            <p className={`text-sm font-black ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              {remaining < 0 ? `-$${Math.abs(remaining)}` : `$${remaining}`}
            </p>
          </div>
        </div>

        {/* 進度條與櫻花特效 (M6-2) */}
        <div className="relative h-3 bg-gray-100 rounded-full mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className={`h-full rounded-full ${isOverBudget ? 'bg-rose-400' : 'bg-rose-300'} shadow-inner`}
          />
          
          {/* 🌸 櫻花花瓣：超支則吹走動畫 */}
          <div className="absolute -top-4 left-0 w-full flex justify-between px-2">
            {petals.map((p) => (
              <motion.div
                key={p}
                animate={isOverBudget ? {
                  y: [0, 20, 40],
                  x: [0, 30, 60],
                  rotate: [0, 90, 180],
                  opacity: 0,
                  scale: [1, 0.8, 0]
                } : {
                  y: [0, -2, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: isOverBudget ? 1.5 : 4,
                  repeat: isOverBudget ? 0 : Infinity,
                  delay: p * 0.15
                }}
              >
                <Flower size={18} className={isOverBudget ? 'text-rose-200' : 'text-rose-300'} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        </div>

        {isOverBudget && (
          <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="flex items-center gap-2 text-rose-500 text-[11px] font-bold mt-4">
            <AlertCircle size={14} />
            <span>警告：預算已超支！Tiffany 該放過那支吹風機了。</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
