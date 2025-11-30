import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Check } from 'lucide-react';

interface CartNotificationPanelProps {
  product?: {
    name: string;
    price: number;
    image_url: string;
  };
}

const CartNotificationPanel: React.FC<CartNotificationPanelProps> = ({ product }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayProduct, setDisplayProduct] = useState<any>(null);

  useEffect(() => {
    const handleCartAdded = (event: CustomEvent) => {
      setDisplayProduct(event.detail);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('productAddedToCart', handleCartAdded as EventListener);
    return () => {
      window.removeEventListener('productAddedToCart', handleCartAdded as EventListener);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && displayProduct && (
        <motion.div
          initial={{ opacity: 0, x: 400, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 400, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm"
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-l-4 border-green-500">
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Added to Cart</h3>
                  <p className="text-sm text-gray-600 truncate">{displayProduct.name}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    ₹{displayProduct.price?.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-400 relative overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-transparent to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotificationPanel;
