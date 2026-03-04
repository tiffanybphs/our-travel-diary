import * as XLSX from 'xlsx';
import { ScheduleItem } from '../types';
import { formatHandbookDate, generate15MinSlots } from './dateUtils';
import { timeToMinutes } from './dominoLogic';

/**
 * 🌸 旅遊手帳：專業 Excel 匯出工具 (修正版)
 * 涵蓋 M3 (交通), M6-3 (成本), M7-1 (15分網格)
 */

export const exportToExcel = (
  items: ScheduleItem[],
  days: string[],
  tripTitle: string
) => {
  const timeSlots = generate15MinSlots();
  
  // 1. 建立表頭 (M2-1 格式)
  const header = ['時間', ...days.map(d => formatHandbookDate(d))];
  const worksheetData: any[][] = [header];

  // 2. 初始化空網格
  timeSlots.forEach(slot => {
    worksheetData.push([slot, ...new Array(days.length).fill('')]);
  });

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  const merges: XLSX.Range[] = [];

  // 3. 遍歷行程填入數據
  items.forEach(item => {
    if (!item.startTime || !item.dayDate) return;

    const dayIndex = days.indexOf(item.dayDate);
    if (dayIndex === -1) return;

    const startRowIndex = Math.floor(timeToMinutes(item.startTime) / 15) + 1;
    const rowSpan = Math.max(1, Math.ceil(item.duration / 15));

    const cellRef = XLSX.utils.encode_cell({ r: startRowIndex, c: dayIndex + 1 });

    // 🌸 整合 M3 (交通) 與 M6-3 (成本) 的專業內容格式化
    let content = `【${item.title}】`;
    if (item.location) content += `\n📍 ${item.location}`;
    if (item.costJPY) content += `\n💰 ¥${item.costJPY.toLocaleString()}`;
    
    // M3: 加入轉乘細節
    if (item.transportLegs && item.transportLegs.length > 0) {
      const transportStr = item.transportLegs
        .map(leg => `➡️ ${leg.type}${leg.detail ? `(${leg.detail})` : ''}`)
        .join('\n');
      content += `\n${transportStr}`;
    }
    
    if (item.note) content += `\n📝 ${item.note}`;

    // 寫入內容並開啟換行樣式
    ws[cellRef] = { 
      v: content, 
      t: 's', 
      s: { alignment: { wrapText: true, vertical: 'top' } } // 確保專業排版
    };

    if (rowSpan > 1) {
      merges.push({
        s: { r: startRowIndex, c: dayIndex + 1 },
        e: { r: startRowIndex + rowSpan - 1, c: dayIndex + 1 }
      });
    }
  });

  // 4. 設定欄寬與合併
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 8 }, // 時間欄
    ...new Array(days.length).fill({ wch: 35 }) // 行程欄加寬以容納 M3 交通細節
  ];

  // 5. 導出
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '櫻花行程表');
  XLSX.writeFile(wb, `${tripTitle}_HandBook.xlsx`);
};
