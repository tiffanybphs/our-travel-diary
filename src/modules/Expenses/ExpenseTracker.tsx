import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, ShoppingBag, Utensils, 
  Train, MoreHorizontal, Wallet, ArrowRight, WifiOff, Users 
} from 'lucide-react';
import { BudgetBar } from '../../components/BudgetBar';
import { formatCurrency } from '../../utils/currency';
import { useSupabaseData } from '../../hooks/useSupabase';
import { supabase } from '../../supabaseClient';

// M7-2: 五人旅伴名單
const TRAVELMATES = ['Tiffany', 'Benjamin', 'Alice', 'Bob', 'Charlie'];

const CATEGORIES = [
  { id: 'shopping', name: '購物', icon: <ShoppingBag size={18} />, color: 'bg-rose-100 text-rose-500' },
  { id: 'food', name: '美食', icon: <Utensils size={18} />, color: 'bg-orange-100 text-orange-500' },
  { id: 'transport', name: '交通', icon: <Train size={18} />, color: 'bg-emerald-100 text-emerald-500' },
  { id: 'other', name: '其他', icon: <MoreHorizontal size={18} />, color: 'bg-gray-100 text-gray-500' },
];

export const ExpenseTracker: React.FC<{ tripId: string }> = ({ tripId }) => {
  const { serverItems: expenses, isConnected } = useSupabaseData(tripId, 'expenses');
  const [isAdding, setIsAdding] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.052); // M6-3: 可手動微調的匯率
  const [newExpense, setNewExpense] = useState({ 
    title: '', amountJPY: '', category: 'shopping', paidBy: 'Tiffany' 
  });

  // M1-5: 離線暫存狀態（PWA 斷網時的本地快取）
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // 計算總花費 (包含雲端數據 + 尚未同步的離線數據)
  const allExpenses = useMemo(() => [...expenses, ...offlineQueue], [expenses, offlineQueue]);
  
  const totalSpentHKD = useMemo(() => 
    allExpenses.reduce((sum, item) => sum + (item.amountJPY ? item.amountJPY * exchangeRate : 0), 0)
  , [allExpenses, exchangeRate]);

  // M7-2 & M1-5: 智慧新增（連線則上傳，斷網則存本地）
  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amountJPY) return;
    
    const entry = {
      id: crypto.randomUUID(), // PWA 本地生成唯一 ID
      trip_id: tripId,
      title: newExpense.title,
      amountJPY: parseInt(newExpense.amountJPY),
      category: newExpense.category,
      paid_by: newExpense.paidBy, // 記錄付款人
      created_at: new Date().toISOString(),
      isPendingSync: !isConnected // 標記是否為離線數據
    };

    if (isConnected) {
      await supabase.from('expenses').insert([entry]);
    } else {
      // 離線模式：存入本地暫存，等待網路恢復
      setOfflineQueue(prev => [entry, ...prev]);
    }

    setNewExpense({ title: '', amountJPY: '', category: 'shopping', paidBy: 'Tiffany' });
    setIsAdding(false);
  };

  // 監聽網路恢復，自動同步離線數據
  useEffect(() => {
    if (isConnected && offlineQueue.length > 0) {
      const syncOfflineData = async () => {
        const dataToSync = offlineQueue.map(({ isPendingSync, ...rest }) => rest);
        await supabase.from('expenses').insert(dataToSync);
        setOfflineQueue([]); // 清空暫存
      };
      syncOfflineData();
    }
  }, [isConnected, offlineQueue]);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* M6-1 & M6-2: 預算條與花瓣特效 */}
      <BudgetBar spentHKD={totalSpentHKD} totalBudgetHKD={15000} />

      {/* M6-3: 動態匯率調整卡片 */}
      <div className="bg-gradient-to-br from-rose-400 to-rose-300 p-4 rounded-[2rem] text-white shadow-xl flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">今日匯率設定</span>
          <div className="text-xl font-black mt-1">¥ 100 = $ {(exchangeRate * 100).toFixed(1)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <input 
            type="number" step="0.001"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
            className="w-20 bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-right text-sm font-bold text-white placeholder-white/50 focus:ring-2 focus:ring-white outline-none"
          />
          <span className="text-[9px] opacity-70 font-bold uppercase">點擊修改匯率</span>
        </div>
      </div>

      <section className="bg-white rounded-[2rem] p-5 shadow-sm border border-rose-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-700 flex items-center gap-2">
            <Wallet size={18} className="text-rose-400" /> 消費清單
            {offlineQueue.length > 0 && <WifiOff size={14} className="text-amber-500 animate-pulse" />}
          </h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-2 rounded-full transition-all ${isAdding ? 'bg-gray-100 text-gray-400' : 'bg-rose-400 text-white shadow-lg shadow-rose-200'}`}
          >
            <Plus size={20} className={isAdding ? 'rotate-45' : ''} />
          </button>
        </div>

        {/* M7-2: 新增帳目面板 (包含付款人選擇) */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 mb-6 p-4 bg-rose-50/50 rounded-2xl border border-rose-100"
            >
              <input 
                placeholder="消費項目 (例: 藥妝、晚餐)"
                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-200 shadow-sm"
                value={newExpense.title}
                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">¥</span>
                  <input 
                    type="number" placeholder="金額"
                    className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-200 shadow-sm"
                    value={newExpense.amountJPY}
                    onChange={(e) => setNewExpense({...newExpense, amountJPY: e.target.value})}
                  />
                </div>
                <select 
                  className="bg-white border-none rounded-xl px-3 text-sm shadow-sm"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              
              {/* 選擇付款人 */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Users size={14} className="text-gray-400 flex-shrink-0" />
                {TRAVELMATES.map(mate => (
                  <button
                    key={mate}
                    onClick={() => setNewExpense({...newExpense, paidBy: mate})}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all ${
                      newExpense.paidBy === mate ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {mate} 結帳
                  </button>
                ))}
              </div>

              <button 
                onClick={handleAddExpense}
                className="w-full bg-rose-400 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all mt-2"
              >
                {isConnected ? '確認紀錄' : '離線暫存紀錄'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 帳目列表 */}
        <div className="space-y-3">
          {allExpenses.map((exp) => {
            const cat = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[3];
            return (
              <motion.div 
                layout key={exp.id}
                className={`flex items-center justify-between p-3 rounded-2xl group transition-all ${
                  exp.isPendingSync ? 'bg-amber-50/50 border border-amber-100 border-dashed' : 'bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      {exp.title}
                      {exp.isPendingSync && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 rounded font-bold">待同步</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {exp.paid_by} 支付 · {new Date(exp.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800">¥ {exp.amountJPY?.toLocaleString()}</p>
                  <p className="text-[10px] text-rose-400 font-bold">≈ $ {(exp.amountJPY * exchangeRate).toFixed(1)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
