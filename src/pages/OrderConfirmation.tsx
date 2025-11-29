import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, ArrowRight } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [showFireworks, setShowFireworks] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
    }

    const timer = setTimeout(() => {
      setShowFireworks(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  const Firework = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.5, 0],
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: 2,
        ease: "easeOut"
      }}
      style={{
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 60 + 20}%`,
      }}
    >
      <div className="relative">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            animate={{
              x: Math.cos((i * Math.PI * 2) / 8) * 50,
              y: Math.sin((i * Math.PI * 2) / 8) * 50,
              opacity: [1, 0],
            }}
            transition={{
              duration: 1,
              delay: delay + 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {showFireworks && (
        <>
          {[...Array(12)].map((_, i) => (
            <Firework key={i} delay={i * 0.2} />
          ))}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
        >
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>

          {orderId && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Your Order ID</p>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white px-6 py-3 rounded-full font-mono text-lg font-semibold">
                <Package className="w-5 h-5" />
                <span>#{orderId.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          )}

          <p className="text-xl text-gray-700 mb-3 leading-relaxed">
            Thank you for shopping with us!
          </p>
          <p className="text-gray-600 mb-8">
            We've sent a confirmation email with your order details and tracking information.
          </p>

          <div className="bg-gradient-to-r from-[#815536]/10 to-[#c9baa8]/10 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-[#815536] mt-1">✓</span>
                <span>Your order is being prepared for shipment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#815536] mt-1">✓</span>
                <span>You'll receive tracking details via email</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-[#815536] mt-1">✓</span>
                <span>Check your order status in the Orders section</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/orders')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white px-8 py-4 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 shadow-md"
            >
              <Package className="w-5 h-5" />
              <span>View Orders</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center space-x-2 bg-white border-2 border-[#815536] text-[#815536] px-8 py-4 rounded-lg font-semibold hover:bg-[#815536] hover:text-white transition-all duration-200"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderConfirmation;
