import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // M1-5: 鎖定背景滾動以模擬原生 App 體驗
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* 背景遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"
          />
          
          {/* 彈窗主體：手機端採取底部抽屜式設計 (Native Feel) */}
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-t border-rose-100"
          >
            {/* 頂部裝飾條 (手機端拖動感) */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
            
            <div className="flex justify-between items-center p-6 pb-2">
              <h3 className="font-black text-xl text-gray-800 tracking-tight">{title}</h3>
              <button 
                onClick={onClose} 
                className="p-2 bg-rose-50 text-rose-400 rounded-full active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 pt-2 max-h-[80vh] overflow-y-auto no-scrollbar pb-12 sm:pb-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
