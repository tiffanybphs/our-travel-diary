/**
 * 🌸 旅遊手帳：全局類型定義 (修正版)
 * 完全符合 Module 1-7 之數據規範，特別支持 M4-2 待定區與 M7-1 Excel 網格
 */

export type ScheduleCategory = '景點' | '美食' | '交通' | '住宿' | '購物';

export type TransportType = '徒歩' | '地鐵' | '巴士' | 'JR' | '新幹線' | '飛機';

export interface TransportLeg {
  type: TransportType;
  detail: string;      
  duration?: number;   
}

export interface ScheduleItem {
  id: string;
  tripId: string;
  
  // M4-2: 支援「有待編入行程區」，當這些值為 null 時，卡片會出現在待定區
  dayDate: string | null;     // YYYY-MM-DD
  startTime: string | null;   // HH:mm
  endTime: string | null;     // HH:mm
  
  duration: number;    // M2-3: 持續分鐘數 (骨牌連動核心)
  title: string;
  category: ScheduleCategory;
  location?: string;
  locationCoord?: { lat: number; lng: number }; 
  note?: string;
  costJPY?: number;    
  transportLegs?: TransportLeg[]; 
  
  // M2-3: 固定時間標記 (如預約好的餐廳或飛機，不隨骨牌效應移動)
  isFixedTime: boolean; 
  
  // M7: 協作與同步
  created_at: string;
  updated_at: string;
  created_by: string;  
}

// M7-1: 為了 Excel 15 分鐘網格匯出專用的映射結構
export interface ExcelTimeSlot {
  time: string; // "09:00", "09:15", "09:30" ...
  activity: string;
  category: string;
  note: string;
}

export interface ExpenseItem {
  id: string;
  tripId: string;
  item: string;
  category: ScheduleCategory | '其他';
  amountJPY: number;
  amountHKD: number;   
  date: string;
  paidBy: string;      
}

export interface TravelTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;      
  ownerId: string;     
  participants: string[]; 
  updated_at: string;
}
