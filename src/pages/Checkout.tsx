import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, MapPin, Plus, CreditCard as Edit2, Trash2, Check, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useSupabaseProducts } from '../hooks/useSupabaseProducts';
import { useAddresses } from '../hooks/useAddresses';
import { useToast } from '../context/ToastContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import AddressForm from '../components/AddressForm';
import { supabase } from '../lib/supabase';
import { calculateGSTBreakdown, getGSTLabel } from '../utils/gstCalculator';
import { INDIAN_STATES } from '../data/indianStates';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useCart();
  const { user, userProfile } = useAuth();
  const { products } = useSupabaseProducts();
  const { addresses, addAddress, updateAddress, deleteAddress, loading: addressLoading } = useAddresses();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [billingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(null);
  const { settings } = useSiteSettings();

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);

  const buyNowProductId = location.state?.buyNowProductId;
  const buyNowProduct = buyNowProductId ? products.find(p => p.id === buyNowProductId) : null;

  const displayItems = buyNowProduct ? [{
    id: 'buy-now-temp',
    product_id: buyNowProduct.id,
    quantity: 1,
    product: buyNowProduct
  }] : cartItems;

  const [guestAddress, setGuestAddress] = useState<any>({ state: 'Kerala', is_gst_registered: false });
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestFullName, setGuestFullName] = useState('');
  const [guestBillingAddress, setGuestBillingAddress] = useState<any>({ state: 'Kerala', is_gst_registered: false });

  const selectedAddress = user ? addresses.find(a => a.id === selectedAddressId) : guestAddress;

  const billingAddress = billingSameAsDelivery
    ? selectedAddress
    : (user ? addresses.find(a => a.id === billingAddressId) : guestBillingAddress);

  const customerState = billingAddress?.state || selectedAddress?.state || 'Kerala';
  const businessState = settings.business_state || 'Maharashtra';

  const subtotal = buyNowProduct ? buyNowProduct.price : getCartTotal();

  const freeShippingThreshold = settings.free_shipping_threshold || 0;
  const deliveryCharge = settings.delivery_charge || 0;
  const shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : deliveryCharge;

  const bulkDiscountThreshold = settings.bulk_discount_threshold || 0;
  const bulkDiscountPercentage = settings.bulk_discount_percentage || 0;
  const discount = bulkDiscountThreshold > 0 && subtotal >= bulkDiscountThreshold
    ? (subtotal * bulkDiscountPercentage) / 100
    : 0;

  const gstBreakdown = calculateGSTBreakdown(
    displayItems,
    customerState,
    shipping,
    discount,
    businessState
  );

  const total = gstBreakdown.total;

  useEffect(() => {
    if (buyNowProductId || isOrderPlaced) {
      return;
    }

    if (!cartLoading && cartItems.length === 0 && user) {
      console.log('Cart is empty after loading, redirecting to cart page');
      navigate('/', { replace: true });
    }
  }, [buyNowProductId, cartLoading, cartItems.length, navigate, isOrderPlaced, user]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.is_default);
      const addrId = defaultAddr?.id || addresses[0].id;
      setSelectedAddressId(addrId);
      if (billingSameAsDelivery) {
        setSelectedBillingAddressId(addrId);
      }
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (billingSameAsDelivery) {
      setSelectedBillingAddressId(selectedAddressId);
    }
  }, [billingSameAsDelivery, selectedAddressId]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  useEffect(() => {
    const fetchRazorpaySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['razorpay_key_id', 'payment_methods_enabled']);

        if (!error && data) {
          const settingsMap = data.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});

          const keyId = settingsMap['razorpay_key_id'];
          const paymentMethods = settingsMap['payment_methods_enabled'];

          if (keyId && keyId.startsWith('rzp_')) {
            setRazorpayKeyId(keyId);
            const methods = Array.isArray(paymentMethods) ? paymentMethods : JSON.parse(paymentMethods || '[]');
            setIsRazorpayEnabled(methods.includes('razorpay'));
          }
        }
      } catch (error) {
        console.error('Error fetching Razorpay settings:', error);
      }
    };

    fetchRazorpaySettings();
  }, []);

  const handleAddressSubmit = async (data: any) => {
    setIsSubmittingAddress(true);
    try {
      if (!user) {
        setGuestAddress(data);
        showToast('Address saved', 'success');
        setShowAddressForm(false);
        setEditingAddress(null);
        setIsSubmittingAddress(false);
        return;
      }

      if (editingAddress) {
        const result = await updateAddress(editingAddress.id, data);
        if (!result.error) {
          showToast('Address updated successfully', 'success');
          setShowAddressForm(false);
          setEditingAddress(null);
        } else {
          showToast('Failed to update address', 'error');
        }
      } else {
        const result = await addAddress(data);
        if (!result.error) {
          showToast('Address added successfully', 'success');
          setShowAddressForm(false);
          if (result.data) {
            setSelectedAddressId(result.data.id);
          }
        } else {
          showToast('Failed to add address', 'error');
        }
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const result = await deleteAddress(addressId);
    if (!result.error) {
      showToast('Address deleted successfully', 'success');
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    } else {
      showToast('Failed to delete address', 'error');
    }
  };

  const sendOrderEmails = async (order: any, selectedAddress: any) => {
    try {
      const orderItems = displayItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const customerEmail = user ? (userProfile?.email || user?.email || '') : guestEmail;
      const customerName = user ? (userProfile?.full_name || 'Customer') : guestFullName;

      const emailData = {
        to: customerEmail,
        subject: `Order Confirmation - #${order.id.slice(-8)}`,
        orderData: {
          orderId: order.id,
          customerName: customerName,
          orderItems,
          totalAmount: total,
          shippingAddress: selectedAddress,
          paymentMethod: paymentMethod,
          orderDate: order.created_at || new Date().toISOString()
        }
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('Order emails sent successfully');
      } else {
        const errorData = await response.json();
        console.warn('Email sending failed (order still created):', errorData);
      }
    } catch (error) {
      console.warn('Email sending error (order still created):', error);
    }
  };

  const validateGuestCheckout = () => {
    const errors: {[key: string]: boolean} = {};
    let isValid = true;

    if (!guestFullName.trim()) {
      errors.guestFullName = true;
      isValid = false;
    }

    if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      errors.guestEmail = true;
      isValid = false;
    }

    if (!guestPhone.trim() || !/^[0-9]{10}$/.test(guestPhone)) {
      errors.guestPhone = true;
      isValid = false;
    }

    if (!guestAddress?.address_line_1?.trim()) {
      errors.guestAddressLine1 = true;
      isValid = false;
    }

    if (!guestAddress?.city?.trim()) {
      errors.guestCity = true;
      isValid = false;
    }

    if (!guestAddress?.state) {
      errors.guestState = true;
      isValid = false;
    }

    if (!guestAddress?.postal_code?.trim() || !/^[0-9]{6}$/.test(guestAddress.postal_code)) {
      errors.guestPostalCode = true;
      isValid = false;
    }

    if (guestAddress?.is_gst_registered && !guestAddress?.gstin?.trim()) {
      errors.guestGstin = true;
      isValid = false;
    }

    if (!billingSameAsDelivery) {
      if (!guestBillingAddress?.address_line_1?.trim()) {
        errors.guestBillingAddressLine1 = true;
        isValid = false;
      }

      if (!guestBillingAddress?.city?.trim()) {
        errors.guestBillingCity = true;
        isValid = false;
      }

      if (!guestBillingAddress?.state) {
        errors.guestBillingState = true;
        isValid = false;
      }

      if (!guestBillingAddress?.postal_code?.trim() || !/^[0-9]{6}$/.test(guestBillingAddress.postal_code)) {
        errors.guestBillingPostalCode = true;
        isValid = false;
      }

      if (guestBillingAddress?.is_gst_registered && !guestBillingAddress?.gstin?.trim()) {
        errors.guestBillingGstin = true;
        isValid = false;
      }
    }

    setFieldErrors(errors);

    if (!isValid) {
      showToast('Please fill in all required fields correctly', 'error');
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return isValid;
  };

  const createOrder = async () => {
    try {
      if (!user && !validateGuestCheckout()) {
        return null;
      }

      if (user && !selectedAddress) {
        showToast('Please select a delivery address', 'error');
        return null;
      }

      const deliveryAddress = user ? selectedAddress : guestAddress;
      const finalBillingAddress = billingSameAsDelivery
        ? deliveryAddress
        : (user ? addresses.find(a => a.id === billingAddressId) : guestBillingAddress);

      if (!billingSameAsDelivery && !finalBillingAddress) {
        showToast('Please provide billing address', 'error');
        return null;
      }

      const orderPayload: any = {
        total_amount: total,
        subtotal: gstBreakdown.subtotal,
        cgst_amount: gstBreakdown.cgst || 0,
        sgst_amount: gstBreakdown.sgst || 0,
        igst_amount: gstBreakdown.igst || 0,
        shipping_charges: gstBreakdown.shipping,
        discount_amount: gstBreakdown.discount,
        customer_state: customerState,
        status: 'confirmed',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        shipping_address: deliveryAddress,
        billing_address: finalBillingAddress,
        billing_same_as_delivery: billingSameAsDelivery
      };

      if (user) {
        orderPayload.user_id = user.id;
      } else {
        orderPayload.guest_email = guestEmail;
        orderPayload.guest_phone = guestPhone;
        orderPayload.guest_name = guestFullName;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = displayItems.map(item => {
        const itemSubtotal = item.product.price * item.quantity;
        const gstPercentage = item.product.gst_percentage || 18;
        const gstAmount = (itemSubtotal * gstPercentage) / 100;

        return {
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          gst_percentage: gstPercentage,
          gst_amount: gstAmount,
          subtotal: itemSubtotal
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      sendOrderEmails(orderData, deliveryAddress).catch(err => {
        console.warn('Email sending failed but order was created:', err);
      });

      return orderData;
    } catch (error: any) {
      console.error('Error creating order:', error);
      showToast('Failed to create order. Please try again.', 'error');
      return null;
    }
  };

  const handleRazorpayPayment = async () => {
    if (!isRazorpayEnabled || !razorpayKeyId) {
      showToast('Online payment is not configured. Please use Cash on Delivery.', 'error');
      setIsProcessing(false);
      return;
    }

    if (!window.Razorpay) {
      showToast('Payment gateway failed to load. Please try again.', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      const createOrderResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
          }),
        }
      );

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const razorpayOrderData = await createOrderResponse.json();

      const deliveryAddress = user ? selectedAddress : guestAddress;
      const finalBillingAddress = billingSameAsDelivery
        ? deliveryAddress
        : (user ? addresses.find(a => a.id === billingAddressId) : guestBillingAddress);

      const orderData = {
        total_amount: total,
        shipping_address: deliveryAddress,
        billing_address: finalBillingAddress,
        items: displayItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        guest_email: !user ? guestEmail : null,
        guest_phone: !user ? guestPhone : null,
        guest_name: !user ? guestFullName : null,
      };

      const options = {
        key: razorpayOrderData.key_id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        order_id: razorpayOrderData.order_id,
        name: settings.business_name || 'Trendy Bazar',
        description: `Payment for order`,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.verified) {
              setIsOrderPlaced(true);

              if (!buyNowProduct) {
                await clearCart();
              }

              await sendOrderEmails(verifyData.order, deliveryAddress);

              navigate('/order-confirmation', {
                state: {
                  orderId: verifyData.order.id,
                  orderDetails: {
                    total: total,
                    paymentMethod: 'razorpay',
                    items: displayItems,
                  },
                },
                replace: true,
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            showToast('Payment verification failed. Please contact support.', 'error');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user ? (userProfile?.full_name || '') : guestFullName,
          email: user ? (userProfile?.email || '') : guestEmail,
          contact: user ? (userProfile?.phone || '') : guestPhone,
        },
        theme: {
          color: 'var(--button-primary-color)',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showToast('Payment cancelled', 'error');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        showToast(`Payment failed: ${response.error.description}`, 'error');
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Razorpay payment error:', error);
      showToast(error.message || 'Failed to process payment. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (user && !selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (!user && !validateGuestCheckout()) {
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
      } else {
        const order = await createOrder();
        if (!order) {
          setIsProcessing(false);
          return;
        }

        setIsOrderPlaced(true);

        if (!buyNowProduct) {
          await clearCart();
        }

        const deliveryAddress = user ? selectedAddress : guestAddress;
        await sendOrderEmails(order, deliveryAddress);

        setIsProcessing(false);

        navigate('/order-confirmation', {
          state: {
            orderId: order.id,
            orderDetails: {
              total: total,
              paymentMethod: 'cod',
              items: displayItems,
            },
          },
          replace: true,
        });
      }
    } catch (error) {
      showToast('Failed to place order', 'error');
      setIsProcessing(false);
    }
  };

  const canPlaceOrder = () => {
    if (user) {
      return !!selectedAddressId;
    } else {
      return guestFullName.trim() !== '' &&
             guestEmail.trim() !== '' &&
             guestPhone.trim() !== '' &&
             guestAddress?.address_line_1?.trim() !== '' &&
             guestAddress?.city?.trim() !== '' &&
             guestAddress?.state !== '' &&
             guestAddress?.postal_code?.trim() !== '' &&
             (!guestAddress?.is_gst_registered || guestAddress?.gstin?.trim() !== '') &&
             (billingSameAsDelivery || (
               guestBillingAddress?.address_line_1?.trim() !== '' &&
               guestBillingAddress?.city?.trim() !== '' &&
               guestBillingAddress?.state !== '' &&
               guestBillingAddress?.postal_code?.trim() !== '' &&
               (!guestBillingAddress?.is_gst_registered || guestBillingAddress?.gstin?.trim() !== '')
             ));
    }
  };

  if (!buyNowProductId && cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!buyNowProductId && !cartLoading && cartItems.length === 0) {
    return null;
  }

  const renderAddressCard = (address: any, isSelected: boolean, onSelect: () => void, isDefault: boolean) => {
    const isExpanded = expandedAddressId === address.id || isDefault;

    return (
      <motion.div
        key={address.id}
        whileHover={{ scale: 1.01 }}
        onClick={onSelect}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-600 bg-blue-600/5'
            : 'border-gray-200 hover:border-blue-600/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">{address.title}</span>
              {address.is_default && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  Default
                </span>
              )}
              {!isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedAddressId(expandedAddressId === address.id ? null : address.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-gray-700 font-medium">{address.full_name}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {address.address_line_1}
                  {address.address_line_2 && `, ${address.address_line_2}`}
                </p>
                <p className="text-gray-600 text-sm">
                  {address.city}, {address.state} - {address.postal_code}
                </p>
                <p className="text-gray-600 text-sm">Phone: {address.phone}</p>
                {address.is_gst_registered && address.gstin && (
                  <p className="text-gray-600 text-sm">GSTIN: {address.gstin}</p>
                )}
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isSelected && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            {isExpanded && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAddress(address);
                    setShowAddressForm(true);
                  }}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address.id);
                  }}
                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                </div>
                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#6d4429] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New</span>
                  </motion.button>
                )}
              </div>

              {!user ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={guestFullName}
                        onChange={(e) => {
                          setGuestFullName(e.target.value);
                          setFieldErrors(prev => ({...prev, guestFullName: false}));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                          fieldErrors.guestFullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                      {fieldErrors.guestFullName && (
                        <p className="text-red-500 text-xs mt-1">Full name is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          setFieldErrors(prev => ({...prev, guestEmail: false}));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                          fieldErrors.guestEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        required
                      />
                      {fieldErrors.guestEmail && (
                        <p className="text-red-500 text-xs mt-1">Valid email is required</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => {
                        setGuestPhone(e.target.value);
                        setFieldErrors(prev => ({...prev, guestPhone: false}));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                        fieldErrors.guestPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your 10-digit phone number"
                      required
                    />
                    {fieldErrors.guestPhone && (
                      <p className="text-red-500 text-xs mt-1">Valid 10-digit phone number is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                    <textarea
                      value={guestAddress?.address_line_1 || ''}
                      onChange={(e) => {
                        setGuestAddress({...guestAddress, address_line_1: e.target.value});
                        setFieldErrors(prev => ({...prev, guestAddressLine1: false}));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                        fieldErrors.guestAddressLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="House No., Building, Street, Area"
                      rows={2}
                      required
                    />
                    {fieldErrors.guestAddressLine1 && (
                      <p className="text-red-500 text-xs mt-1">Address is required</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={guestAddress?.city || ''}
                        onChange={(e) => {
                          setGuestAddress({...guestAddress, city: e.target.value});
                          setFieldErrors(prev => ({...prev, guestCity: false}));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                          fieldErrors.guestCity ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="City"
                        required
                      />
                      {fieldErrors.guestCity && (
                        <p className="text-red-500 text-xs mt-1">City is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <select
                        value={guestAddress?.state || 'Kerala'}
                        onChange={(e) => {
                          setGuestAddress({...guestAddress, state: e.target.value});
                          setFieldErrors(prev => ({...prev, guestState: false}));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                          fieldErrors.guestState ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      >
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {fieldErrors.guestState && (
                        <p className="text-red-500 text-xs mt-1">State is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                      <input
                        type="text"
                        value={guestAddress?.postal_code || ''}
                        onChange={(e) => {
                          setGuestAddress({...guestAddress, postal_code: e.target.value});
                          setFieldErrors(prev => ({...prev, guestPostalCode: false}));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                          fieldErrors.guestPostalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        required
                      />
                      {fieldErrors.guestPostalCode && (
                        <p className="text-red-500 text-xs mt-1">Valid 6-digit PIN code is required</p>
                      )}
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          checked={guestAddress?.is_gst_registered || false}
                          onChange={(e) => setGuestAddress({...guestAddress, is_gst_registered: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">
                          GST Registered Dealer
                        </label>
                      </div>
                    
                      {guestAddress?.is_gst_registered && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GSTIN (GST Identification Number) *
                          </label>
                          <input
                            type="text"
                            value={guestAddress?.gstin || ''}
                            onChange={(e) => {
                              setGuestAddress({...guestAddress, gstin: e.target.value.toUpperCase()});
                              setFieldErrors(prev => ({...prev, guestGstin: false}));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase ${
                              fieldErrors.guestGstin ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., 27AAPFU0939F1ZV"
                            maxLength={15}
                            required={guestAddress?.is_gst_registered}
                          />
                          {fieldErrors.guestGstin && (
                            <p className="text-red-500 text-xs mt-1">GSTIN is required for GST registered dealer</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">15-character GST Identification Number</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ) : addressLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => renderAddressCard(
                    address,
                    selectedAddressId === address.id,
                    () => setSelectedAddressId(address.id),
                    !!address.is_default
                  ))}
                </div>
              )}
            </motion.div>

            {/* Billing Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
              </div>

              <div className="mb-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all border-blue-600 bg-blue-600/5">
                  <input
                    type="checkbox"
                    checked={billingSameAsDelivery}
                    onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                    className="mr-3 text-blue-600 w-4 h-4"
                  />
                  <span className="font-medium text-gray-900">Billing address same as delivery address</span>
                </label>
              </div>

              {!billingSameAsDelivery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mt-4"
                >
                  {user ? (
                    addresses.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600 text-sm">No billing addresses available</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((address) => renderAddressCard(
                          address,
                          billingAddressId === address.id,
                          () => setSelectedBillingAddressId(address.id),
                          false
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Billing Address Details</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                        <textarea
                          value={guestBillingAddress?.address_line_1 || ''}
                          onChange={(e) => {
                            setGuestBillingAddress({...guestBillingAddress, address_line_1: e.target.value});
                            setFieldErrors(prev => ({...prev, guestBillingAddressLine1: false}));
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                            fieldErrors.guestBillingAddressLine1 ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Billing Address"
                          rows={2}
                          required={!billingSameAsDelivery}
                        />
                        {fieldErrors.guestBillingAddressLine1 && (
                          <p className="text-red-500 text-xs mt-1">Billing address is required</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <input
                            type="text"
                            value={guestBillingAddress?.city || ''}
                            onChange={(e) => {
                              setGuestBillingAddress({...guestBillingAddress, city: e.target.value});
                              setFieldErrors(prev => ({...prev, guestBillingCity: false}));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                              fieldErrors.guestBillingCity ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="City"
                            required={!billingSameAsDelivery}
                          />
                          {fieldErrors.guestBillingCity && (
                            <p className="text-red-500 text-xs mt-1">City is required</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                          <select
                            value={guestBillingAddress?.state || 'Kerala'}
                            onChange={(e) => {
                              setGuestBillingAddress({...guestBillingAddress, state: e.target.value});
                              setFieldErrors(prev => ({...prev, guestBillingState: false}));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                              fieldErrors.guestBillingState ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required={!billingSameAsDelivery}
                          >
                            {INDIAN_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          {fieldErrors.guestBillingState && (
                            <p className="text-red-500 text-xs mt-1">State is required</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                          <input
                            type="text"
                            value={guestBillingAddress?.postal_code || ''}
                            onChange={(e) => {
                              setGuestBillingAddress({...guestBillingAddress, postal_code: e.target.value});
                              setFieldErrors(prev => ({...prev, guestBillingPostalCode: false}));
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                              fieldErrors.guestBillingPostalCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            required={!billingSameAsDelivery}
                          />
                          {fieldErrors.guestBillingPostalCode && (
                            <p className="text-red-500 text-xs mt-1">Valid 6-digit PIN code is required</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            checked={guestBillingAddress?.is_gst_registered || false}
                            onChange={(e) => setGuestBillingAddress({...guestBillingAddress, is_gst_registered: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-700">
                            GST Registered Dealer
                          </label>
                        </div>

                        {guestBillingAddress?.is_gst_registered && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              GSTIN (GST Identification Number) *
                            </label>
                            <input
                              type="text"
                              value={guestBillingAddress?.gstin || ''}
                              onChange={(e) => {
                                setGuestBillingAddress({...guestBillingAddress, gstin: e.target.value.toUpperCase()});
                                setFieldErrors(prev => ({...prev, guestBillingGstin: false}));
                              }}
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase ${
                                fieldErrors.guestBillingGstin ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="e.g., 27AAPFU0939F1ZV"
                              maxLength={15}
                              required={guestBillingAddress?.is_gst_registered}
                            />
                            {fieldErrors.guestBillingGstin && (
                              <p className="text-red-500 text-xs mt-1">GSTIN is required for GST registered dealer</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">15-character GST Identification Number</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-600/5'
                      : 'border-gray-200 hover:border-blue-600/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="mr-3 text-blue-600"
                  />
                  <Truck className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                    !isRazorpayEnabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-600/5 cursor-pointer'
                      : 'border-gray-200 hover:border-blue-600/50 cursor-pointer'
                  }`}
                >
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                    disabled={!isRazorpayEnabled}
                    className="mr-3 text-blue-600 disabled:opacity-50"
                  />
                  <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">
                      {isRazorpayEnabled
                        ? 'UPI, Cards, NetBanking, Wallets'
                        : 'Not available - Enable in admin settings'}
                    </p>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {displayItems.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
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
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax ({getGSTLabel(customerState, businessState)})</span>
                  <div className="flex items-center space-x-2">
                    <span>₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                    <button
                      onClick={() => setShowTaxBreakdown(true)}
                      className="text-blue-600 hover:text-[#6d4429] transition-colors"
                      title="View tax breakdown"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              <motion.button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !canPlaceOrder()}
                whileHover={{ scale: !isProcessing && canPlaceOrder() ? 1.02 : 1 }}
                whileTap={{ scale: !isProcessing && canPlaceOrder() ? 0.98 : 1 }}
                className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? 'Processing...'
                  : paymentMethod === 'online'
                  ? `Pay ₹${Math.round(total).toLocaleString()}`
                  : `Place Order - ₹${Math.round(total).toLocaleString()}`}
              </motion.button>

              {!canPlaceOrder() && !isProcessing && (
                <p className="text-red-500 text-sm text-center mt-3">
                  {user ? 'Please select a delivery address' : 'Please fill in all required fields'}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressForm && (
          <AddressForm
            address={editingAddress}
            onSubmit={handleAddressSubmit}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            isSubmitting={isSubmittingAddress}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTaxBreakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaxBreakdown(false)}
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
                  onClick={() => setShowTaxBreakdown(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Items Breakdown</h4>
                  <div className="space-y-3 mb-4">
                    {displayItems.map((item) => {
                      const itemMRP = item.product.original_price || item.product.price;
                      const itemPrice = item.product.price;
                      const itemDiscount = itemMRP - itemPrice;
                      const discountPercent = itemMRP > 0 ? Math.round((itemDiscount / itemMRP) * 100) : 0;

                      return (
                        <div key={item.product.id} className="border-b pb-2 last:border-b-0">
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
                      <span className="font-medium">₹{displayItems.reduce((sum, item) => sum + ((item.product.original_price || item.product.price) * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        {displayItems.reduce((sum, item) => sum + (((item.product.original_price || item.product.price) - item.product.price) * item.quantity), 0) > 0
                          ? `-₹${displayItems.reduce((sum, item) => sum + (((item.product.original_price || item.product.price) - item.product.price) * item.quantity), 0).toLocaleString()}`
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">GST Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    {gstBreakdown.cgst !== undefined && gstBreakdown.sgst !== undefined ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            CGST (Central GST)
                            <span className="block text-xs text-gray-500">Same State Transaction</span>
                          </span>
                          <span className="font-medium">₹{Math.round(gstBreakdown.cgst).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            SGST (State GST)
                            <span className="block text-xs text-gray-500">Same State Transaction</span>
                          </span>
                          <span className="font-medium">₹{Math.round(gstBreakdown.sgst).toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          IGST (Integrated GST)
                          <span className="block text-xs text-gray-500">Interstate Transaction</span>
                        </span>
                        <span className="font-medium">₹{Math.round(gstBreakdown.igst || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Tax</span>
                        <span className="font-semibold">₹{Math.round(gstBreakdown.totalTax).toLocaleString()}</span>
                      </div>
                    </div>
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

                <div className="bg-gradient-to-r from-blue-600/10 to-yellow-500/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{Math.round(gstBreakdown.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center pt-2">
                  <p>Tax calculated based on: {customerState}</p>
                  <p>Business State: {businessState}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
