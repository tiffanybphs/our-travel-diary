import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { ScheduleItem } from '../types';

/**
 * 🌸 旅遊手帳：Supabase 實時同步 Hook (企業級修正版)
 * 完全涵蓋 M7-2 (協作), M4-2 (待定區排序), M1-5 (離線狀態感知)
 */
export const useSupabaseData = (
  tripId: string, 
  onRemoteUpdate?: (items: ScheduleItem[]) => void // 橋接 useOptimistic.ts
) => {
  const [serverItems, setServerItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🌸 M1-5: PWA 離線/連線狀態感知
  const [isConnected, setIsConnected] = useState(navigator.onLine);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('tripId', tripId)
        // 🛡️ M4-2 修正: 確保 startTime 為 null (待定區) 的卡片永遠排在最後面
        .order('startTime', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setServerItems(data || []);
      if (onRemoteUpdate) onRemoteUpdate(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId, onRemoteUpdate]);

  useEffect(() => {
    fetchInitialData();

    // 🌸 M1-5: 註冊原生瀏覽器網路狀態監聽
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 🌸 M7-2: 建立專屬 WebSocket 實時監聽通道
    const channel = supabase
      .channel(`rt-schedule-${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedules', filter: `tripId=eq.${tripId}` },
        (payload) => {
          console.log('🌸 收到遠端同步信號:', payload);
          
          setServerItems((prev) => {
            let next = [...prev];
            if (payload.eventType === 'INSERT') {
              next.push(payload.new as ScheduleItem);
            } else if (payload.eventType === 'UPDATE') {
              next = next.map(item => item.id === payload.new.id ? (payload.new as ScheduleItem) : item);
            } else if (payload.eventType === 'DELETE') {
              next = next.filter(item => item.id !== payload.old.id);
            }
            
            // 🛡️ 接收遠端數據後再次排序，確保骨牌算法不會因為數據亂序而崩潰
            next.sort((a, b) => {
              if (!a.startTime) return 1; // 待定區往後擺
              if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
            });

            // 將最新鮮的數據傳遞給樂觀更新 Hook (useOptimistic.ts)
            if (onRemoteUpdate) onRemoteUpdate(next);
            return next;
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsConnected(true);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setIsConnected(false);
      });

    // 清除監聽，避免 Memory Leak
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchInitialData, tripId]);

  return { serverItems, loading, error, isConnected, refresh: fetchInitialData };
};
