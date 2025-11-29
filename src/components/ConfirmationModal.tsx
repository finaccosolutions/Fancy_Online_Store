// src/components/ConfirmationModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-admin-card rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-admin-text">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-admin-sidebar rounded-full transition-colors text-admin-text-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-admin-text-light mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2 border border-admin-border text-admin-text-light rounded-lg hover:bg-admin-sidebar transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 bg-admin-danger text-white rounded-lg hover:bg-admin-danger/80 transition-colors"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
