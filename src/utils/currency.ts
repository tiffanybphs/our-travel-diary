/**
 * 🌸 旅遊手帳：匯率與預算狀態工具
 * 符合 M6-2 (花瓣吹走邏輯) 與 M6-3 (JPY/HKD 換算)
 */

const JPY_TO_HKD_RATE = Number(import.meta.env.VITE_JPY_HKD_RATE) || 0.052;

/** 日幣轉港幣 */
export const jpyToHkd = (jpy: number): number => {
  return Math.round(jpy * JPY_TO_HKD_RATE);
};

/** 格式化金額 */
export const formatCurrency = (amount: number, currency: 'JPY' | 'HKD'): string => {
  return currency === 'JPY' 
    ? `¥${amount.toLocaleString()}` 
    : `HKD $${amount.toLocaleString()}`;
};

/** * 🌸 M6-2 核心：預算狀態計算
 * 除了百分比，還提供 isOverBudget 供前端觸發「花瓣吹走」動畫
 */
export const getBudgetStatus = (spentHKD: number, totalBudgetHKD: number) => {
  const progress = totalBudgetHKD > 0 ? (spentHKD / totalBudgetHKD) * 100 : 0;
  return {
    progress: Math.min(progress, 100),
    isOverBudget: spentHKD > totalBudgetHKD,
    remaining: totalBudgetHKD - spentHKD
  };
};
