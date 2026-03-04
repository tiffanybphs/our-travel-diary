import React from 'react';
import { BottomNav } from './BottomNav';
// 強制 Vite 打包這張圖片並加入 Service Worker 緩存清單
import headerBg from '../../assets/header-bg.jpg'; 

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FFF9FB] font-sans text-gray-800 selection:bg-rose-200">
      {/* M1: 櫻花手帳頂部裝飾背景 */}
      <div 
        className="fixed top-0 left-0 right-0 h-48 bg-cover bg-center z-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${headerBg})` }}
      />
      <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#FFF9FB] z-0 pointer-events-none" />

      <main className="relative z-10 pb-24 min-h-screen flex flex-col max-w-md mx-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};
