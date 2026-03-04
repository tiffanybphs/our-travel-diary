import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, WifiOff } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'offline';
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible }) => {
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    offline: <WifiOff size={18} className="text-amber-500" />
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-100"
        >
          {icons[type]}
          <span className="text-xs font-bold text-gray-700">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
