import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🛡️ M7-4: 嚴格的環境變數檢查，防止開發時白屏找不到原因
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🌸 M7-4 嚴重錯誤: 遺失 Supabase 環境變數！請確認根目錄下有 .env 檔案並填妥正確的 URL 與 Key。');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
