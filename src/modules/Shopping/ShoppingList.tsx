import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CheckCircle2, Circle, Search, 
  Store, User, Ruler, Tag, Trash2, Plus, 
  Sparkles, WifiOff, Users
} from 'lucide-react';
import { useSupabaseData } from '../../hooks/useSupabase';
import { jpyToHkd } from '../../utils/currency';
import { supabase } from '../../supabaseClient';

const TRAVELMATES = ['Tiffany', 'Benjamin', 'Alice', 'Bob', 'Charlie'];

export const ShoppingList: React.FC<{ tripId: string }> = ({ tripId }) => {
  // M7-2: 雲端同步代購清單
  const { serverItems: shoppingItems, isConnected } = useSupabaseData(tripId, 'shopping_list');
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', priceJPY: '', requester: 'Tiffany' });

  // M1-5: 離線暫存佇列 (確保地下室購物不斷線)
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // 結合雲端與離線暫存資料
  const allItems = useMemo(() => {
    return [...offlineQueue, ...shoppingItems].filter(item => {
      if (filter === 'pending') return !item.is_completed;
      if (filter === 'completed') return item.is_completed;
      return true;
    });
  }, [shoppingItems, offlineQueue, filter]);

  // M4 & M6: 精準計算待買項目的總估值 (自動換算 HKD)
  const totalEstimatedHKD = useMemo(() => {
    const pendingItems = [...offlineQueue, ...shoppingItems].filter(item => !item.is_completed);
    return pendingItems.reduce((sum, item) => sum + (item.price_jpy ? jpyToHkd(item.price_jpy) : 0), 0);
  }, [shoppingItems, offlineQueue]);

  // M7-2: 處理新增代購項目 (支援離線)
  const handleAddItem = async () => {
    if (!newItem.name) return;
    
    const entry = {
      id: crypto.randomUUID(), // PWA 離線唯一 ID
      trip_id: tripId,
      name: newItem.name,
      price_jpy: parseInt(newItem.priceJPY) || 0,
      requester: newItem.requester,
      is_completed: false,
      created_at: new Date().toISOString(),
      isPendingSync: !isConnected
    };

    if (isConnected) {
      await supabase.from('shopping_list').insert([entry]);
    } else {
      setOfflineQueue(prev => [entry, ...prev]);
    }

    setNewItem({ name: '', priceJPY: '', requester: 'Tiffany' });
    setIsAdding(false);
  };

  // 處理打勾完成與刪除
  const toggleComplete = async (id: string, currentStatus: boolean, isPending: boolean) => {
    if (isPending) return; // 離線暫存數據暫不允許修改狀態，等待連線
    await supabase.from('shopping_list').update({ is_completed: !currentStatus }).eq('id', id);
  };

  const deleteItem = async (id: string, isPending: boolean) => {
    if (isPending) {
      setOfflineQueue(prev => prev.filter(i => i.id !== id));
      return;
    }
    await supabase.from('shopping_list').delete().eq('id', id);
  };

  // 網路恢復時自動同步
  useEffect(() => {
    if (isConnected && offlineQueue.length > 0) {
      const syncOfflineData = async () => {
        const dataToSync = offlineQueue.map(({ isPendingSync, ...rest }) => rest);
        await supabase.from('shopping_list').insert(dataToSync);
        setOfflineQueue([]);
      };
      syncOfflineData();
    }
  }, [isConnected, offlineQueue]);

  // M1-5 & M4: 零安裝外部導航
  const findStore = (itemName: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(itemName + ' 東京')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      
      {/* 🌸 M1: Tiffany 私人尺寸卡 (強化個性化) */}
      <section className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Ruler size={16} /> Tiffany's Profile
          </h3>
          <Sparkles size={18} className="opacity-70" />
        </div>
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-md border border-white/20">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">完美腰圍</p>
            <p className="text-2xl font-black italic mt-1">57 <span className="text-sm">cm</span></p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-md border border-white/20">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">日系對照</p>
            <p className="text-2xl font-black italic mt-1">S <span className="text-sm opacity-80">/ 36</span></p>
          </div>
        </div>
        <p className="text-[10px] mt-4 opacity-80 font-bold bg-white/10 inline-block px-3 py-1 rounded-full">
          💡 購買 Wacoal 或和服時可直接出示此畫面
        </p>
      </section>

      {/* 🛍️ 5人代購清單管理 */}
      <section className="bg-white rounded-[2rem] p-5 shadow-sm border border-rose-50">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-gray-700 flex items-center gap-2 uppercase tracking-widest">
            <ShoppingBag size={18} className="text-rose-400" /> 代購清單
            {offlineQueue.length > 0 && <WifiOff size={14} className="text-amber-500 animate-pulse" />}
          </h3>
          <div className="text-right">
            <p className="text-[9px] font-bold text-gray-400 uppercase">待買估值</p>
            <p className="text-sm font-black text-rose-500">HKD ${totalEstimatedHKD}</p>
          </div>
        </div>

        {/* 篩選與新增控制區 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1 bg-gray-50 p-1 rounded-full">
            {['pending', 'completed', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all uppercase ${
                  filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
                }`}
              >
                {f === 'pending' ? '未買' : f === 'completed' ? '已買' : '全部'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-2 rounded-full transition-all ${isAdding ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white shadow-lg shadow-gray-200'}`}
          >
            <Plus size={18} className={isAdding ? 'rotate-45' : ''} />
          </button>
        </div>

        {/* M7-2: 新增代購面板 (支援金額輸入與對象選擇) */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <input 
                placeholder="物品名稱 (例: EVE止痛藥)"
                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-200 shadow-sm"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">預估 ¥</span>
                <input 
                  type="number" placeholder="日幣金額 (選填)"
                  className="w-full bg-white border-none rounded-xl pl-16 pr-4 py-3 text-sm focus:ring-2 focus:ring-rose-200 shadow-sm"
                  value={newItem.priceJPY}
                  onChange={(e) => setNewItem({ ...newItem, priceJPY: e.target.value })}
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Users size={14} className="text-gray-400 flex-shrink-0" />
                {TRAVELMATES.map(mate => (
                  <button
                    key={mate}
                    onClick={() => setNewItem({...newItem, requester: mate})}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold flex-shrink-0 transition-all ${
                      newItem.requester === mate ? 'bg-rose-400 text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    幫 {mate} 買
                  </button>
                ))}
              </div>

              <button 
                onClick={handleAddItem}
                className="w-full bg-rose-400 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all mt-2"
              >
                新增至清單
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 購物清單列表 */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {allItems.map((item) => (
              <motion.div 
                layout key={item.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  item.is_completed ? 'bg-gray-50/50 border-transparent opacity-60 grayscale' : 'bg-white border-rose-50 hover:shadow-sm'
                } ${item.isPendingSync ? 'border-dashed border-amber-200' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleComplete(item.id, item.is_completed, item.isPendingSync)}>
                    {item.is_completed ? <CheckCircle2 className="text-emerald-400" size={22} /> : <Circle className="text-gray-200" size={22} />}
                  </button>
                  <div>
                    <p className={`text-sm font-bold flex items-center gap-2 ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                      {item.isPendingSync && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 rounded">待同步</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-rose-400 uppercase flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full">
                        <User size={10} /> {item.requester}
                      </span>
                      {item.price_jpy > 0 && (
                        <span className="text-[10px] font-bold text-gray-400">
                          ¥{item.price_jpy.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {!item.is_completed && (
                    <button onClick={() => findStore(item.name)} className="p-2 text-sky-400 hover:bg-sky-50 rounded-lg transition-colors">
                      <Store size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteItem(item.id, item.isPendingSync)} className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {allItems.length === 0 && !isAdding && (
            <div className="py-12 text-center text-gray-300 flex flex-col items-center">
              <Search size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-bold">清單空空如也，準備好大開殺戒了嗎？</p>
            </div>
          )}
        </div>
      </section>

      {/* ℹ️ M4-3: 退稅與行李提醒 */}
      <div className="bg-sky-50 rounded-[2rem] p-5 border border-sky-100 flex gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm h-fit">
          <Tag className="text-sky-500" size={24} />
        </div>
        <div>
          <h4 className="text-xs font-black text-sky-700 uppercase tracking-widest">Tax-Free 攻略</h4>
          <p className="text-[11px] text-sky-600 mt-1 leading-relaxed font-medium">
            消費滿 <span className="font-bold">¥5,000</span> 即可退稅。液體類化妝水請務必放進托運行李！
          </p>
        </div>
      </div>
    </div>
  );
};
