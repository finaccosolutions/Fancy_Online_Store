import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Info, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { calculateGSTBreakdown } from '../utils/gstCalculator';

const Cart: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, loading } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const customerState = 'Maharashtra';
  const businessState = settings.business_state || 'Maharashtra';
  const subtotal = getCartTotal();

  const freeShippingThreshold = settings.free_shipping_threshold || 0;
  const deliveryCharge = settings.delivery_charge || 0;
  const shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : deliveryCharge;

  const bulkDiscountThreshold = settings.bulk_discount_threshold || 0;
  const bulkDiscountPercentage = settings.bulk_discount_percentage || 0;
  const discount = bulkDiscountThreshold > 0 && subtotal >= bulkDiscountThreshold
    ? (subtotal * bulkDiscountPercentage) / 100
    : 0;

  const gstBreakdown = calculateGSTBreakdown(
    cartItems,
    customerState,
    shipping,
    discount,
    businessState
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#815536] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="h-16 w-16 sm:h-24 sm:w-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your Cart is Empty</h2>
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Discover our amazing fragrances and add them to your cart
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white font-semibold rounded-lg hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200 space-x-2"
            >
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#815536] mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <button
                  onClick={clearCart}
                  className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">{item.product.category_name}</p>
                      <p className="font-bold text-[#815536] mt-1">₹{item.product.price.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{gstBreakdown.subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({bulkDiscountPercentage}%)</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{gstBreakdown.shipping === 0 ? 'Free' : `₹${gstBreakdown.shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <div className="flex items-center space-x-2">
                    <span>₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                    <button
                      onClick={() => setShowBreakdown(true)}
                      className="text-[#815536] hover:text-[#6d4429] transition-colors"
                      title="View breakdown"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{Math.round(gstBreakdown.total).toLocaleString()}</span>
                </div>
              </div>

              {freeShippingThreshold > 0 && getCartTotal() < freeShippingThreshold && (
                <div className="bg-[#c9baa8]/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-[#815536]">
                    Add ₹{(freeShippingThreshold - getCartTotal()).toLocaleString()} more to get free shipping!
                  </p>
                </div>
              )}

              {discount > 0 && (
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-green-700">
                    Bulk discount applied: ₹{discount.toLocaleString()} ({bulkDiscountPercentage}%)
                  </p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-[#815536] to-[#c9baa8] text-white py-4 px-6 rounded-lg font-semibold hover:from-[#6d4429] hover:to-[#b8a494] transition-all duration-200"
              >
                Proceed to Checkout
              </motion.button>

              <div className="mt-4 text-center">
                <Link
                  to="/products"
                  className="text-[#815536] hover:underline text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBreakdown(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Breakup</h3>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Items Breakdown</h4>
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => {
                      const itemMRP = item.product.original_price || item.product.price;
                      const itemPrice = item.product.price;
                      const itemDiscount = item.product.original_price ? (itemMRP - itemPrice) : 0;
                      const discountPercent = itemMRP > itemPrice ? Math.round((itemDiscount / itemMRP) * 100) : 0;

                      return (
                        <div key={item.id} className="border-b pb-2 last:border-b-0">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <div className="text-xs text-gray-600 mt-1 space-y-1">
                            <div className="flex justify-between">
                              <span>MRP (₹{itemMRP} × {item.quantity})</span>
                              <span>₹{(itemMRP * item.quantity).toLocaleString()}</span>
                            </div>
                            {itemDiscount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount ({discountPercent}%)</span>
                                <span>-₹{(itemDiscount * item.quantity).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium">
                              <span>Price</span>
                              <span>₹{(itemPrice * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Total (MRP)</span>
                      <span className="font-medium">₹{cartItems.reduce((sum, item) => sum + ((item.product.original_price || item.product.price) * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        {cartItems.reduce((sum, item) => {
                          const discount = item.product.original_price ? ((item.product.original_price - item.product.price) * item.quantity) : 0;
                          return sum + discount;
                        }, 0) > 0
                          ? `-₹${cartItems.reduce((sum, item) => {
                              const discount = item.product.original_price ? ((item.product.original_price - item.product.price) * item.quantity) : 0;
                              return sum + discount;
                            }, 0).toLocaleString()}`
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Tax Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Tax will be calculated based on delivery address selected at checkout
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Charges</span>
                      <span className="font-medium">
                        {gstBreakdown.shipping === 0 ? 'FREE' : `₹${gstBreakdown.shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#815536]/10 to-[#c9baa8]/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-[#815536]">
                      ₹{Math.round(gstBreakdown.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
