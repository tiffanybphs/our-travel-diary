import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Calendar, Map, Ticket, ShoppingBag, Wallet, Plus, Save, 
  Trash2, Edit2, CheckCircle2, Navigation, Clock, ChevronDown, 
  ChevronUp, Download, Share2 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, addMinutes, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

// --- 配置區 ---
const SUPABASE_URL ="https://sofrkrzjaoitgwtjqhfj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnJrcnpqYW9pdGd3dGpxaGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzUxMTksImV4cCI6MjA4NTc1MTExOX0.U7U_vqygT8RaT9dO-dXde2t5kNardyKaOGuxDko3Ss8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 櫻花風格通用組件 ---
const SakuraCard = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[2rem] shadow-sm border-2 border-[#FFF0F5] p-5 mb-4 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const SakuraButton = ({ children, onClick, variant = "primary", className = "" }) => {
  const base = "px-4 py-2 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm ";
  const variants = {
    primary: "bg-[#FFC0CB] text-[#5D4037] hover:bg-[#FFB6C1]",
    secondary: "bg-[#F5F5DC] text-[#5D4037] border-2 border-[#D2B48C]",
    danger: "bg-red-100 text-red-500 border border-red-200"
  };
  return <button onClick={onClick} className={base + variants[variant] + " " + className}>{children}</button>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('行程');
  const [schedules, setSchedules] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(30000);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeDate, setActiveDate] = useState('2026-03-25');

  // 初始化讀取資料 (樂觀更新邏輯可在此擴充)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sched } = await supabase.from('schedules').select('*').order('start_time', { ascending: true });
    if (sched) setSchedules(sched);
    const { data: exp } = await supabase.from('expenses').select('*');
    if (exp) setExpenses(exp);
  };

  // --- 記帳邏輯 ---
  const totalSpent = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount), 0), [expenses]);
  const budgetPercent = Math.min((totalSpent / totalBudget) * 100, 100);
  const expenseData = [
    { name: '餐飲', value: expenses.filter(e => e.category === '餐飲').reduce((s, i) => s + Number(i.amount), 0) },
    { name: '購物', value: expenses.filter(e => e.category === '購物').reduce((s, i) => s + Number(i.amount), 0) },
    { name: '交通', value: expenses.filter(e => e.category === '交通').reduce((s, i) => s + Number(i.amount), 0) },
    { name: '其它', value: expenses.filter(e => !['餐飲','購物','交通'].includes(e.category)).reduce((s, i) => s + Number(i.amount), 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#FFC0CB', '#ADD8E6', '#D2B48C', '#F5F5DC'];

  // --- 導出 Excel 邏輯 ---
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(schedules);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TravelPlan");
    XLSX.writeFile(wb, "櫻花旅遊手帳_行程.xlsx");
  };

  return (
    <div className="min-h-screen font-maru bg-[#F5F5DC] pb-24 text-[#5D4037]">
      {/* Header */}
      <header className="relative h-56 bg-[#FFC0CB] overflow-hidden flex flex-col justify-end p-8">
        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">🌸 櫻花旅遊手帳</h1>
          <p className="text-sm tracking-widest opacity-80">2026/03/25 - 2026/04/02</p>
        </div>
        <div className="absolute top-4 right-4 text-[10px] bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
          🌸 Tiffany & Benjamin 🌸
        </div>
      </header>

      {/* 置頂 Tabs */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#FFF0F5] flex justify-around py-3">
        {[
          { id: '行程', icon: <Calendar size={20}/> },
          { id: '導航', icon: <Map size={20}/> },
          { id: '憑證', icon: <Ticket size={20}/> },
          { id: '清單', icon: <ShoppingBag size={20}/> },
          { id: '記賬', icon: <Wallet size={20}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-[#FFB6C1] scale-110' : 'text-[#D2B48C]/60'}`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.id}</span>
          </button>
        ))}
      </nav>

      {/* 主內容區 */}
      <main className="p-5 max-w-md mx-auto">
        
        {/* 行程模組 */}
        {activeTab === '行程' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
              {['03.25', '03.26', '03.27', '03.28'].map(d => (
                <button 
                  key={d}
                  onClick={() => setActiveDate(`2026-${d.replace('.','-')}`)}
                  className={`px-5 py-2 rounded-2xl flex-shrink-0 text-sm font-bold border-2 transition-all ${activeDate.includes(d.replace('.','-')) ? 'bg-[#FFC0CB] border-[#FFB6C1] shadow-md' : 'bg-white border-[#FFF0F5]'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* 範例行程卡片 */}
            <SakuraCard>
              <div className="flex justify-between items-start mb-3">
                <span className="bg-[#ADD8E6] text-white text-[10px] px-3 py-1 rounded-full font-bold">景點活動</span>
                <Clock size={16} className="text-[#D2B48C]" />
              </div>
              <h3 className="text-lg font-bold">上野公園櫻花漫步</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-[#D2B48C]">
                <span className="bg-[#F5F5DC] px-2 py-0.5 rounded text-[12px]">09:00 - 11:00</span>
                <span>(120 min)</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-[#F5F5DC] py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                  <Navigation size={14}/> 導航
                </button>
                <button className="flex-1 bg-[#FFF0F5] py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                  <Save size={14}/> 儲存
                </button>
              </div>
            </SakuraCard>

            <div className="flex justify-center mt-6">
               <SakuraButton onClick={exportExcel} variant="secondary">
                 <Download size={16}/> 匯出行程 Excel
               </SakuraButton>
            </div>
          </div>
        )}

        {/* 記帳模組 */}
        {activeTab === '記賬' && (
          <div className="animate-in zoom-in-95 duration-500">
            <SakuraCard className="bg-gradient-to-br from-white to-[#FFF0F5]">
              <h2 className="font-bold text-center mb-4">預算控管</h2>
              {/* 櫻花進度條 */}
              <div className="h-6 w-full bg-white rounded-full overflow-hidden border-2 border-[#FFC0CB] relative mb-2">
                <div 
                  className="h-full bg-[#FFC0CB] transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${budgetPercent}%` }}
                >
                  🌸
                </div>
              </div>
              <div className="flex justify-between text-[12px] font-bold">
                <span>已花: HK$ {totalSpent}</span>
                <span>剩餘: HK$ {totalBudget - totalSpent}</span>
              </div>
            </SakuraCard>

            <SakuraCard>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#FFC0CB] rounded-full" /> 支出分佈
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {expenseData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </SakuraCard>
          </div>
        )}

        {/* 清單模組 */}
        {activeTab === '清單' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">購物清單</h2>
              <button onClick={() => setIsEditMode(!isEditMode)} className="text-[#D2B48C]">
                <Edit2 size={20} className={isEditMode ? "text-[#FFB6C1]" : ""} />
              </button>
            </div>
            <SakuraCard className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FFF0F5]">
                    <th className="p-3 text-left">商品</th>
                    <th className="p-3 text-right">備註</th>
                    {isEditMode && <th className="p-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '藥妝', note: '新宿買' },
                    { name: '御守', note: '淺草寺' }
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-[#F5F5DC]">
                      <td className="p-3 font-bold">{item.name}</td>
                      <td className="p-3 text-right opacity-60">{item.note}</td>
                      {isEditMode && (
                        <td className="p-3">
                          <Trash2 size={16} className="text-red-300" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="w-full py-3 flex items-center justify-center gap-2 text-[#FFB6C1] hover:bg-[#FFF0F5]">
                <Plus size={18}/> 新增項目
              </button>
            </SakuraCard>
          </div>
        )}

      </main>

      {/* 右下角櫻花懸浮按鈕 */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#FFC0CB] text-white rounded-full shadow-xl flex items-center justify-center hover:rotate-90 transition-all active:scale-90 z-[60]">
        <Plus size={32} />
      </button>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[#FFC0CB] opacity-20" />
    </div>
  );
}
