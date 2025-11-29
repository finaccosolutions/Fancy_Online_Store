// src/components/ToastContainer.tsx
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getBgColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getBorderColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'info':
        return 'border-blue-200';
      case 'warning':
        return 'border-yellow-200';
      default:
        return 'border-gray-200';
    }
  };

  const getTextColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center p-4 rounded-lg shadow-lg border ${getBgColor(toast.type)} ${getBorderColor(toast.type)} max-w-xs`}
            role="alert"
          >
            <div className="flex-shrink-0 mr-3">
              {getIcon(toast.type)}
            </div>
            <div className={`flex-1 text-sm font-medium ${getTextColor(toast.type)}`}>
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-4 flex-shrink-0 ${getTextColor(toast.type)} opacity-70 hover:opacity-100 transition-opacity`}
            >
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
