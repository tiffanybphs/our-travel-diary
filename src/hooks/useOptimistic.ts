import { useState, useCallback } from 'react';
import { ScheduleItem } from '../types';
import { calculateDomino } from '../utils/dominoLogic';

/**
 * 🌸 旅遊手帳：樂觀更新與協作 Hook (企業級修正版)
 * 嚴格涵蓋 M7-2 (五人同步、防重複) 與 M1-4 (無延遲反饋與狀態指示)
 */
export const useOptimisticSchedule = (
  initialData: ScheduleItem[], 
  supabaseClient: any,
  currentUserId: string // M7-2: 追蹤是哪位旅伴做出的修改
) => {
  const [data, setData] = useState<ScheduleItem[]>(initialData);
  
  // M1-4: 新增同步狀態，讓 UI 可以顯示「儲存中...」或「同步失敗」的提示
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  /**
   * 🌸 核心更新：本地極速反應 -> 骨牌重算 -> 背景精準覆寫
   */
  const updateSchedule = useCallback(async (
    changedId: string, 
    updates: Partial<ScheduleItem>
  ) => {
    setIsSyncing(true);
    setSyncError(null);
    
    // 1. 備份安全狀態 (Rollback point)
    const previousData = [...data];

    // 2. 樂觀更新：立即套用使用者的修改
    const locallyUpdatedData = data.map(item => 
      item.id === changedId ? { ...item, ...updates } : item
    );

    // 3. 觸發骨牌連動 (M2-3)
    const finalOptimisticData = calculateDomino(locallyUpdatedData, changedId);
    
    // 4. M1-4 極速回饋：0.01 秒內更新畫面，使用者無須等待轉圈圈
    setData(finalOptimisticData);

    // 5. M7-2 背景同步與 Last-write-wins 處理
    try {
      const nowUTC = new Date().toISOString(); // 統一使用 UTC 防止 5 人時區錯亂
      
      // 找出被修改及被骨牌推移的項目
      const changedItems = finalOptimisticData.filter((newItem) => {
        const oldItem = previousData.find(old => old.id === newItem.id);
        return !oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem);
      }).map(item => ({
        ...item,
        updated_at: nowUTC,
        // M7-2: 可選 - 記錄最後修改者，便於未來在卡片上顯示 "Tiffany 編輯於 1分鐘前"
        ...(item.id === changedId ? { created_by: currentUserId } : {})
      }));

      if (changedItems.length > 0) {
        // M7-2 修正：加入 onConflict，確保是「覆寫」而不是「新增重複卡片」
        const { error } = await supabaseClient
          .from('schedules')
          .upsert(changedItems, { onConflict: 'id' });

        if (error) throw error;
      }
    } catch (error: any) {
      console.error("🌸 同步失敗，執行靜默回滾...", error);
      // 6. 網路異常處理：退回原狀並拋出錯誤給 UI 顯示 Toast
      setData(previousData);
      setSyncError("網路連線不穩，已恢復為上一步狀態");
    } finally {
      setIsSyncing(false);
    }
  }, [data, supabaseClient, currentUserId]);

  /**
   * 🌸 接收遠端推播 (當其他 4 人修改時)
   */
  const syncFromRemote = useCallback((remoteItems: ScheduleItem[]) => {
    // 這裡直接套用雲端最新鮮的資料，因為 Supabase 已處理好 Last-write-wins
    setData(remoteItems);
  }, []);

  return { 
    data, 
    isSyncing, 
    syncError, 
    updateSchedule, 
    syncFromRemote 
  };
};
