import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonType: string, reasonText: string) => Promise<void>;
  orderNumber: string;
}

const CANCELLATION_REASONS = [
  'Order placed by mistake',
  'Need to change delivery address',
  'Need to change payment method',
  'Found better price elsewhere',
  'Delivery time is too long',
  'Changed my mind',
  'Product no longer needed',
  'Other'
];

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      return;
    }

    if (selectedReason === 'Other' && !otherReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const reasonText = selectedReason === 'Other' ? otherReason : selectedReason;
      await onConfirm(selectedReason, reasonText);
      setSelectedReason('');
      setOtherReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-600">Order #{orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Please select a reason for canceling this order:
            </p>

            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-[#815536] bg-[#815536]/5'
                      : 'border-gray-200 hover:border-[#815536]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mr-3 text-[#815536]"
                  />
                  <span className="text-gray-900">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify:
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                  placeholder="Enter your reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#815536] focus:border-transparent"
                />
              </motion.div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedReason ||
                (selectedReason === 'Other' && !otherReason.trim())
              }
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Canceling...' : 'Cancel Order'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            This action cannot be undone
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CancelOrderModal;
