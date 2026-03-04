import { format, addMinutes, startOfDay, eachDayOfInterval, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';

/**
 * 🌸 旅遊手帳：日期與時間工具
 * 符合 M2-1 (精準 mm.dd(ddd) 格式) 與 M7-1 (15分網格)
 */

export const formatHandbookDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  // 修正：強制只取星期幾的那個字，例如「三」而非「週三」
  const dayName = format(date, 'i', { locale: zhTW }); 
  const dayMap: Record<string, string> = {
    '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '日'
  };
  return `${format(date, 'MM.dd')}(${dayMap[dayName]})`;
};

/** 生成日期列表 */
export const generateTravelDates = (start: string, end: string) => {
  try {
    const dateArray = eachDayOfInterval({
      start: parseISO(start),
      end: parseISO(end)
    });
    return dateArray.map(d => ({
      fullDate: format(d, 'yyyy-MM-dd'),
      label: formatHandbookDate(format(d, 'yyyy-MM-dd'))
    }));
  } catch (e) {
    return []; // 防止日期無效時當機
  }
};

/** 🌸 M7-1：生成 Excel 15 分鐘時間軸 */
export const generate15MinSlots = () => {
  const slots: string[] = [];
  let current = startOfDay(new Date());
  for (let i = 0; i < 96; i++) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, 15);
  }
  return slots;
};
