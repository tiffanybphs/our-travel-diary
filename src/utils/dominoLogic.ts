import { ScheduleItem } from '../types';

/**
 * 🌸 旅遊手帳：進階骨牌連動算法
 * 涵蓋 M2-3 (連動), M7-1 (15分網格對齊), M2-4 (睡眠保護)
 */

/** 將 "HH:mm" 轉分鐘 */
export const timeToMinutes = (time: string): number => {
  const [hrs, mins] = time.split(':').map(Number);
  return hrs * 60 + mins;
};

/** 分鐘轉 "HH:mm" */
export const minutesToTime = (totalMinutes: number): string => {
  const hrs = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/** * 🌸 M7-1 核心助手：強制對齊 15 分鐘網格
 * 確保匯出 Excel 時，每個行程都完美佔用整數個儲存格
 */
export const snapTo15 = (minutes: number): number => {
  return Math.round(minutes / 15) * 15;
};

/**
 * 🌸 骨牌算法實作
 */
export const calculateDomino = (
  items: ScheduleItem[],
  changedId: string | null // 如果是初始化則為 null
): ScheduleItem[] => {
  // 1. 過濾掉待定區項目 (M4-2) 並排序
  const scheduledItems = items
    .filter(item => item.startTime !== null)
    .sort((a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!));

  const result: ScheduleItem[] = [];
  let nextAvailableStart: number | null = null;

  for (let i = 0; i < scheduledItems.length; i++) {
    const current = { ...scheduledItems[i] };
    const currentStart = timeToMinutes(current.startTime!);
    
    // 確保 duration 也是 15 的倍數 (M7-1)
    current.duration = snapTo15(current.duration);

    // 處理第一個項目或固定點 (M2-3: isFixedTime)
    if (i === 0 || current.isFixedTime) {
      // 如果是固定點，我們不移動它的開始時間，但要更新它的結束時間
      current.endTime = minutesToTime(currentStart + current.duration);
      nextAvailableStart = currentStart + current.duration;
    } else {
      // 🌸 骨牌連動邏輯：
      // 如果前一個行程結束了，且此行程非固定，則自動貼合
      if (nextAvailableStart !== null) {
        // M2-3: 緊湊連動，中間不留空隙
        current.startTime = minutesToTime(nextAvailableStart);
        current.endTime = minutesToTime(nextAvailableStart + current.duration);
        nextAvailableStart += current.duration;
      }
    }

    // M2-4: 睡眠邊界檢查 (防止行程推移到凌晨 00:00 之後影響隔天)
    if (nextAvailableStart && nextAvailableStart > 1440) {
      console.warn("⚠️ 警告：行程已超過午夜，建議調整 duration");
    }

    result.push(current);
  }

  // 合併回待定區項目
  const unscheduled = items.filter(item => item.startTime === null);
  return [...result, ...unscheduled];
};
