# 🌸 Tokyo 2026: 零安裝櫻花導覽手帳

這是為 Tiffany 5 人團隊打造的 PWA 旅遊系統。**無需安裝軟體，只需一個網址。**

## 🚀 零安裝使用 (End Users)
1. 在手機瀏覽器打開網址。
2. 點擊「分享」或選單，選擇 **「加入主畫面 (Add to Home Screen)」**。
3. 桌面上會出現圖示，打開即是完整的 App。

## 📊 數據庫建立 (SQL 指令)
請在 Supabase SQL Editor 執行以確保 **Module 2/4/6/7** 功能正常：

```sql
-- 匯率與預算：$HKD = JPY \times 0.052$
-- 建立行程表 (含 M2 休眠區與 M4 待編入區邏輯)
CREATE TABLE schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME DEFAULT '08:00',
  end_time TIME DEFAULT '09:00',
  title TEXT NOT NULL,
  category TEXT DEFAULT 'spot', -- 'food', 'spot', 'transport', 'sleep'
  is_pending BOOLEAN DEFAULT FALSE, -- M4: 待編入區標記
  booked_by TEXT
);

-- 預設插入 M2 要求之每日 00:00-07:00 睡覺時間
INSERT INTO schedule (trip_id, date, start_time, end_time, title, category)
SELECT 'tokyo-cherry-blossom-2026', d, '00:00', '07:00', '睡覺覺時間 😴', 'sleep'
FROM generate_series('2026-10-21'::date, '2026-10-26'::date, '1 day'::interval) d;

-- 啟用實時同步 (M7)
ALTER PUBLICATION supabase_realtime ADD TABLE schedule, expenses, shopping_list, bookings;
